from api.core.config import settings
from langchain_deepseek import ChatDeepSeek

from ..state import State


class ChatBotNode:
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

        self.llm_with_tools = self.llm.bind_tools(tools=[])

    def __call__(self, state: State):
        response = self.llm_with_tools.invoke(state["messages"])
        # return {**state, "messages": [response]}
        return {"messages": [response]}
