from abc import ABC, abstractmethod
from typing import Any, Generator, Optional
from uuid import uuid4

from api.error import UserDefinedException
from api.logger import logger
from langgraph.graph.state import CompiledStateGraph

from ..schema import InterruptResponse


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
        self,
        conversation_id: Optional[str],
        message: str,
        interrupt_response: Optional[InterruptResponse] = None,
    ) -> Generator[str, Any, None]:
        """
        Stream the answer from the agent.
        This should be a generator function that yields the answer.
        """
        pass

    def get_history(self, conversation_id: str) -> list:
        """
        Get the history of the conversation.
        """
        try:
            graph = self.build_graph()

            config = {"configurable": {"thread_id": conversation_id}}
            self.log(f"Conversation ID: {self.id} \tConversation: {conversation_id}")

            state = graph.get_state(config)
            messages = state.values.get("messages", None)

            if messages is None:
                raise UserDefinedException(
                    "Conversation not found in memory", "CONVERSATION_NOT_FOUND"
                )

            return messages
        except UserDefinedException as e:
            raise e
        except Exception as e:
            logger.error(f"{self.name}: Error while executing graph: {e}")
            raise UserDefinedException(
                f"Error while executing graph: {str(e)}", "GRAPH_EXECUTION_ERROR"
            )

    @classmethod
    def log(cls, message: str) -> None:
        """
        Log a message with the agent's name.
        """
        logger.debug(f">> {cls.__name__}: {message}")
