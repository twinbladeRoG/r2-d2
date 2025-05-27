from typing import Annotated

from fastapi import Depends

from .agents.base_agent import BaseAgent
from .agents.excel_agent.agent import ExcelAgent
from .agents.human_agent.agent import HumanAgent
from .agents.ppt_agent.agent import PowerPointAgent
from .agents.web_search_agent.agent import WebSearchAgent

web_search_agent = WebSearchAgent()
power_point_agent = PowerPointAgent()
human_agent = HumanAgent()
excel_agent = ExcelAgent()


def create_agent(agent_name: str):
    match agent_name:
        case "web_search_agent":
            return web_search_agent
        case "power_point_agent":
            return power_point_agent
        case "human_agent":
            return human_agent
        case "excel_agent":
            return excel_agent
        case _:
            return None


AgentDep = Annotated[BaseAgent | None, Depends(create_agent)]
