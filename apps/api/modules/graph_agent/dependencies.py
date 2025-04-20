from typing import Annotated

from fastapi import Depends

from .agents.web_search_agent.agent import WebSearchAgent

agent = WebSearchAgent()


def create_agent():
    return agent


WebSearchAgentDep = Annotated[WebSearchAgent, Depends(create_agent)]
