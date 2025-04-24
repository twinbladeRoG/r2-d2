from abc import ABC, abstractmethod
from typing import Any, Generator, Optional
from uuid import uuid4

from api.logger import logger
from langgraph.graph.state import CompiledStateGraph


class BaseAgent(ABC):
    """
    Base class for all agents.
    """

    def __init__(self, agent_id: str = uuid4()):
        self.id = agent_id
        self.graph: CompiledStateGraph | None = None
        self.name = self.__class__.__name__

        logger.debug(f">> {self.name} Initialized: {self.id}")

    @abstractmethod
    def build_graph(self) -> CompiledStateGraph:
        """
        Build the graph for the agent and update the graph attribute.
        """
        pass

    @abstractmethod
    def get_answer(
        self, conversation_id: Optional[str], message: str
    ) -> Generator[str, Any, None]:
        """
        Stream the answer from the agent.
        This should be a generator function that yields the answer.
        """
        pass

    @classmethod
    def log(cls, message: str) -> None:
        """
        Log a message with the agent's name.
        """
        logger.debug(f">> {cls.__name__}: {message}")
