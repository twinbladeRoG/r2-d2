from langgraph.types import interrupt

from ..state import State


class FileSelectNode:
    """
    Selects a file from the user's local system.
    """

    def __init__(self):
        pass

    def __call__(self, state: State):
        file_id = state.get("file_id")

        if file_id == None:
            interrupt(
                {"type": "SELECT_EXCEL_FILE", "message": "Please select an Excel file."}
            )

        return {"file_id": file_id}
