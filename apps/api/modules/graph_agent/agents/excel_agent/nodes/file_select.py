from langgraph.types import interrupt

from ..state import State


class FileSelectNode:
    """
    Selects a file from the user's local system.
    """

    def __init__(self):
        pass

    def __call__(self, state: State):
        value = interrupt(
            {"type": "SELECT_EXCEL_FILE", "message": "Please select an Excel file."}
        )

        return {"file_id": value}
