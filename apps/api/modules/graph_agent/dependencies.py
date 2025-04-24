from typing import Annotated

from fastapi import Depends

from .agents.ppt_agent.agent import PowerPointAgent
from .agents.web_search_agent.agent import WebSearchAgent

web_search_agent = WebSearchAgent()
power_point_agent = PowerPointAgent()


def create_agent(agent_name: str):
    match agent_name:
        case "web_search_agent":
            return web_search_agent
        case "power_point_agent":
            return power_point_agent
        case _:
            return None


AgentDep = Annotated[WebSearchAgent | PowerPointAgent | None, Depends(create_agent)]
