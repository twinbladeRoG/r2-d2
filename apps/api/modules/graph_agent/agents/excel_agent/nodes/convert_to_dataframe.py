from typing import Any

import pandas as pd
from api.models import User
from api.modules.file_storage.service import FileStorageService
from sqlmodel import Session

from ...base_node import BaseNode
from ..state import State


class ConvertToDataFrameNode(BaseNode):
    """
    Converts a excel file to a pandas DataFrame.
    """

    def __init__(self, services: dict[str, Any]):
        self.services = services

    def __call__(self, state: State):
        file_id = state["file_id"]

        user: User = self.get_service("user")
        session: Session = self.get_service("session")
        file_storage_service: FileStorageService = self.get_service("file_storage")

        file_path = file_storage_service.get_file_path(user, session, file_id)
        data_frame = pd.read_csv(file_path)

        return {"dataframe": data_frame.to_json(orient="split")}
