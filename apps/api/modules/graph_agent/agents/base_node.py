from abc import ABC
from typing import Any

from api.error import UserDefinedException
from api.logger import logger


class BaseNode(ABC):
    """
    Base class for all agents nodes.
    """

    services: dict[str, Any] = {}

    def __init__(self):
        self.name = self.__class__.__name__

        logger.debug(f">> Node: {self.name} initialized")

    def add_service(self, name: str, service: Any):
        self.services.update({name: service})

    def get_service(self, name: str):
        service = self.services.get(name, None)

        if service == None:
            raise UserDefinedException(f"Service: '{name}' is not found in {self.name}")

        return service
