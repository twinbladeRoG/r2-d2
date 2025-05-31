import builtins
import contextlib
import io
from typing import Any

from api.core.config import settings
from langchain_core.runnables import RunnableConfig
from langchain_deepseek import ChatDeepSeek

from ..state import State


class CodeActAgent:
    def __init__(self):
        self.llm = ChatDeepSeek(
            api_base=f"{settings.LLM_HOST}/v1",
            api_key=settings.LLM_SECRET,
            model="deepseek-coder:latest",
            temperature=0,
            max_tokens=None,
            timeout=None,
            max_retries=2,
        )

    def eval(self, code: str, _locals: dict[str, Any]) -> tuple[str, dict[str, Any]]:
        # Store original keys before execution
        original_keys = set(_locals.keys())

        try:
            with contextlib.redirect_stdout(io.StringIO()) as f:
                exec(code, builtins.__dict__, _locals)
            result = f.getvalue()
            if not result:
                result = "<code ran, no output printed to stdout>"
        except Exception as e:
            result = f"Error during execution: {repr(e)}"

        # Determine new variables created during execution
        new_keys = set(_locals.keys()) - original_keys
        new_vars = {key: _locals[key] for key in new_keys}
        return result, new_vars

    def __call__(self, state: State, config: RunnableConfig):
        # human_messages = list(
        #     filter(lambda x: isinstance(x, HumanMessage), state["messages"])
        # )
        # print("\n MESSAGE:\n", len(human_messages), human_messages[-1])

        # Also generate Python Code with pandas for the user's question only if needed.

        return state
