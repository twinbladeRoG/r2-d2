import json
from typing import Optional
from uuid import uuid4

from api.logger import logger
from api.modules.graph_agent.agents.base_agent import BaseAgent
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, ToolMessage
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph

from .nodes.chatbot import ChatBotNode
from .nodes.tools import get_tool_icon, get_tool_label, tool_node
from .state import State


class PowerPointAgent(BaseAgent):
    def __init__(self):
        super().__init__()
        self.memory = MemorySaver()

    def route_tools(self, state: State):
        """
        Use in the conditional_edge to route to the ToolNode if the last message
        has tool calls. Otherwise, route to the end.
        """
        if isinstance(state, list):
            ai_message = state[-1]
        elif messages := state.get("messages", []):
            ai_message = messages[-1]
        else:
            raise ValueError(f"No messages found in input state to tool_edge: {state}")

        if hasattr(ai_message, "tool_calls") and len(ai_message.tool_calls) > 0:
            return "tools"

        return END

    def build_graph(self):
        if self.graph != None:
            self.log("Already Present")
            return self.graph

        self.log("Building")

        graph_builder = StateGraph(State)

        # Create nodes
        chatbot = ChatBotNode()

        # Add Nodes
        graph_builder.add_node("tools", tool_node)
        graph_builder.add_node("chatbot", chatbot)

        # Create Workflow
        graph_builder.add_edge(START, "chatbot")
        graph_builder.add_conditional_edges(
            "chatbot",
            self.route_tools,
            {"tools": "tools", END: END},
        )
        graph_builder.add_edge("tools", "chatbot")

        # Compile
        graph = graph_builder.compile(checkpointer=self.memory)

        self.graph = graph

        return graph

    def get_answer(self, conversation_id: Optional[str], message: str):
        try:
            graph = self.build_graph()

            if conversation_id == None:
                conversation_id = uuid4()
                yield f"event: conversationId\ndata: {conversation_id}\n\n"

            config = {"configurable": {"thread_id": conversation_id}}

            self.log(f"ID: {self.id} \tConversation: {conversation_id}")

            events = graph.stream(
                {"messages": [{"role": "user", "content": message}]},
                config,
                stream_mode="updates",
            )

            for event in events:
                for node, event_value in event.items():
                    yield f"event: node\ndata: {node}\n\n"

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

                        response = {
                            "content": tool_content,
                            "name": message.name,
                            "label": get_tool_label(message.name),
                            "icon": get_tool_icon(message.name),
                        }
                        yield f"event: tool\ndata: {json.dumps(response)}\n\n"

        except Exception as e:
            logger.error(f"{self.name}: Error while executing graph: {e}")
            yield f"event: error\ndata: {e}\n\n"
        finally:
            yield "event: done\ndata: end\n\n"

    def get_history(self, conversation_id):
        return []
