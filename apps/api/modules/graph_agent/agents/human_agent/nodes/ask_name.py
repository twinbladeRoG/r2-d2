from langchain_core.messages import SystemMessage
from langgraph.types import interrupt

from ..state import State


def ask_name(state: State):
    """
    Ask the user for their name and update the state with the response.
    """

    # Check if the name is already set in the state
    if state.get("name", None) is not None:
        message = SystemMessage(
            content=f"My name is {state['name']}.",
        )
        return {"name": state["name"], "messages": [message]}

    name = interrupt("What is your name?")
    return {"name": name}
