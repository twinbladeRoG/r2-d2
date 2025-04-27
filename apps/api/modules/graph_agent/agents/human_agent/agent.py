import json
from typing import Optional
from uuid import uuid4

from api.error import UserDefinedException
from api.logger import logger
from api.modules.graph_agent.agents.base_agent import BaseAgent
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, ToolMessage
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph
from langgraph.types import Command, Interrupt

from ...schema import InterruptResponse
from .nodes.ask_name import ask_name
from .nodes.chatbot import ChatBotNode
from .state import State


class HumanAgent(BaseAgent):
    def __init__(self):
        super().__init__()
        self.memory = MemorySaver()

    def build_graph(self):
        if self.graph != None:
            self.log("Already Present")
            return self.graph

        self.log("Building")

        graph_builder = StateGraph(State)

        # Create nodes
        chatbot = ChatBotNode()

        # Add Nodes
        graph_builder.add_node("chatbot", chatbot)
        graph_builder.add_node("ask_name", ask_name)

        # Create Workflow
        graph_builder.add_edge(START, "ask_name")
        graph_builder.add_edge("ask_name", "chatbot")
        graph_builder.add_edge("chatbot", END)

        # Compile
        graph = graph_builder.compile(checkpointer=self.memory)

        self.graph = graph

        return graph

    def get_answer(
        self,
        conversation_id: Optional[str],
        message: str,
        interrupt_response: Optional[InterruptResponse] = None,
    ):
        try:
            graph = self.build_graph()

            if conversation_id == None:
                conversation_id = uuid4()
                yield f"event: conversationId\ndata: {conversation_id}\n\n"

            config = {"configurable": {"thread_id": conversation_id}}

            self.log(f"ID: {self.id} \tConversation: {conversation_id}")

            if interrupt_response is not None:
                events = graph.stream(
                    Command(update={"name": interrupt_response.message}),
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

                    state = graph.get_state(config)
                    if len(state.next) != 0:
                        yield f"event: node\ndata: {state.next[0]}\n\n"

                    if node == "__interrupt__":
                        interrupt = event_value[0]
                        if isinstance(interrupt, Interrupt):
                            response = {
                                "query": interrupt.value,
                                "message": interrupt.value,
                                "last_human_assistance_tool_call_id": interrupt.ns[0],
                            }
                            yield f"event: interrupt\ndata: {json.dumps(response)}\n\n"
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

    def get_history(self, conversation_id: str):
        try:
            graph = self.build_graph()

            config = {"configurable": {"thread_id": conversation_id}}
            self.log(f"Conversation ID: {self.id} \tConversation: {conversation_id}")

            state = graph.get_state(config)
            messages = state.values.get("messages", None)

            if messages is None:
                raise UserDefinedException(
                    "Conversation not found in memory", "CONVERSATION_NOT_FOUND"
                )

            return messages
        except UserDefinedException as e:
            raise e
        except Exception as e:
            logger.error(f"{self.name}: Error while executing graph: {e}")
            raise UserDefinedException(
                f"Error while executing graph: {str(e)}", "GRAPH_EXECUTION_ERROR"
            )
