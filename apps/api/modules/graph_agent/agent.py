import json

from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, ToolMessage
from langchain_deepseek import ChatDeepSeek
from langgraph.graph import END, START, StateGraph

from api.core.config import settings

from .state import State
from .tools import get_tool_icon, get_tool_label, tool_node, tools

llm = ChatDeepSeek(
    api_base=f"{settings.LLM_HOST}/v1",
    api_key=settings.LLM_SECRET,
    model="deepseek-coder:latest",
    temperature=0,
    max_tokens=None,
    timeout=None,
    max_retries=2,
)
llm_with_tools = llm.bind_tools(tools)


def chatbot(state: State):
    response = llm_with_tools.invoke(state["messages"])
    return {"messages": [response]}


def route_tools(
    state: State,
):
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


def build_graph():
    graph_builder = StateGraph(State)

    graph_builder.add_node("tools", tool_node)
    graph_builder.add_node("chatbot", chatbot)

    graph_builder.add_edge(START, "chatbot")
    graph_builder.add_conditional_edges(
        "chatbot",
        route_tools,
        {"tools": "tools", END: END},
    )
    graph_builder.add_edge("tools", "chatbot")

    graph = graph_builder.compile()

    return graph


graph = build_graph()


def get_answer(message: str):
    try:
        config = {"configurable": {"thread_id": "1"}}
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
        yield f"event: error\ndata: {e}\n\n"
    finally:
        yield "event: done\ndata: end\n\n"
