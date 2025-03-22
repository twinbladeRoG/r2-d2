import io
import os
from typing import Annotated

from dotenv import load_dotenv
from langchain_openai import OpenAI
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph
from langgraph.graph.message import add_messages
from PIL import Image
from typing_extensions import TypedDict

load_dotenv()

OPEN_API_KEY = os.getenv("FAST_API_OPENAI_KEY")

if OPEN_API_KEY is None:
    raise ValueError("FAST_API_OPENAI_KEY is not set in the environment")

os.environ["OPENAI_API_KEY"] = OPEN_API_KEY

llm = OpenAI()


class State(TypedDict):
    messages: Annotated[list, add_messages]


graph_builder = StateGraph(State)


def chatbot(state: State):
    return {"messages": [llm.invoke(state["messages"])]}


graph_builder.add_node("chatbot", chatbot)
graph_builder.add_edge(START, "chatbot")
graph_builder.add_edge("chatbot", END)
memory = MemorySaver()
graph = graph_builder.compile(checkpointer=memory)

try:
    graph_image = graph.get_graph().draw_mermaid_png()
    image = Image.open(io.BytesIO(graph_image))
    image.save("graph_image.png")
except Exception as e:
    print(e)

config = {"configurable": {"thread_id": "1"}}


def stream_graph_updates(user_input: str):
    events = graph.stream(
        {"messages": [{"role": "user", "content": user_input}]},
        config,
        stream_mode="values",
    )
    for event in events:
        print(event["messages"][-1].content)


while True:
    try:
        user_input = input("User: ")
        if user_input.lower() in ["quit", "exit", "q"]:
            print("Goodbye!")
            break
        stream_graph_updates(user_input)
    except Exception as e:
        print("> Error:\n", e)
        break
