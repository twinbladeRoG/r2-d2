from ..state import State


class FileRouterNode:
    def __init__(self):
        pass

    def __call__(self, state: State):
        if state.get("file_id") is None:
            return False
        else:
            return True
