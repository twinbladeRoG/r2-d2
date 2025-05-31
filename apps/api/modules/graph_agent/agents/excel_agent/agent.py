import json
from uuid import uuid4

from api.logger import logger
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, ToolMessage
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph
from langgraph.types import Command, Interrupt

from ..base_agent import BaseAgent
from .nodes.chatbot import ChatBotNode
from .nodes.convert_to_dataframe import ConvertToDataFrameNode
from .nodes.file_router import FileRouterNode
from .nodes.file_select import FileSelectNode
from .state import State


class ExcelAgent(BaseAgent):
    def __init__(
        self,
    ):
        super().__init__()
        self.memory = MemorySaver()

    def build_graph(self):
        if self.graph is not None:
            self.log("Graph already built")
            return self.graph

        self.log("Building")

        graph_builder = StateGraph(State)

        # Create nodes
        file_router = FileRouterNode()
        file_select = FileSelectNode()
        convert_to_dataframe = ConvertToDataFrameNode(self.services)
        chatbot = ChatBotNode()

        # Add Nodes
        graph_builder.add_node("file_select", file_select)
        graph_builder.add_node("convert_to_dataframe", convert_to_dataframe)
        graph_builder.add_node("chatbot", chatbot)

        # Create Workflow
        graph_builder.add_conditional_edges(
            START, file_router, {True: "convert_to_dataframe", False: "file_select"}
        )
        graph_builder.add_edge("file_select", "convert_to_dataframe")
        graph_builder.add_edge("convert_to_dataframe", "chatbot")
        graph_builder.add_edge("chatbot", END)

        # Compile
        graph = graph_builder.compile(checkpointer=self.memory)

        self.graph = graph

        return graph

    def get_answer(self, conversation_id, message, interrupt_response=None):
        try:
            graph = self.build_graph()

            if conversation_id == None:
                conversation_id = uuid4()
                yield f"event: conversationId\ndata: {conversation_id}\n\n"

            config = {"configurable": {"thread_id": conversation_id}}

            self.log(f"ID: {self.id} \tConversation: {conversation_id}")

            if interrupt_response is not None:
                events = graph.stream(
                    Command(
                        resume=interrupt_response.message,
                        update={
                            "file_id": interrupt_response.message,
                            "messages": [{"role": "user", "content": message}],
                        },
                    ),
                    config,
                    stream_mode="updates",
                )
            else:
                events = graph.stream(
                    {"messages": [{"role": "user", "content": message}]},
                    config,
                    stream_mode="updates",
                )

            for event in events:
                for node, event_value in event.items():
                    yield f"event: node\ndata: {node}\n\n"
                    logger.debug(f"{self.name}:\tNode:\t{node}")

                    state = graph.get_state(config)

                    if len(state.next) != 0:
                        logger.debug(f"{self.name}:\tNext Node:\t{state.next}")
                        yield f"event: node\ndata: {state.next[0]}\n\n"

                    if node == "__interrupt__":
                        interrupt = event_value[0]
                        if isinstance(interrupt, Interrupt):
                            yield f"event: interrupt\ndata: {json.dumps(interrupt.value)}\n\n"
                            continue

                    if len(event_value.get("messages", [])) == 0:
                        continue

                    message: BaseMessage = event_value.get("messages", [])[-1]

                    if isinstance(message, HumanMessage):
                        continue

                    elif isinstance(message, AIMessage):
                        reasoning_content = message.additional_kwargs.get(
                            "reasoning_content", None
                        )
                        if reasoning_content:
                            thinking_response = {"text": reasoning_content}

                            yield f"event: reason\ndata: {json.dumps(thinking_response)}\n\n"

                        response = {"text": message.content}
                        yield f"event: message\ndata: {json.dumps(response)}\n\n"

                    elif isinstance(message, ToolMessage):
                        tool_content = message.content
                        tool_content = json.loads(tool_content)

                        response = {"content": tool_content, "name": message.name}

                        yield f"event: tool\ndata: {json.dumps(response)}\n\n"

        except Exception as e:
            logger.error(f"{self.name}: Error while executing graph: {e}")
            yield f"event: error\ndata: {e}\n\n"
        finally:
            yield "event: done\ndata: end\n\n"
