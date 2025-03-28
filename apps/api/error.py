class UserDefinedException(Exception):
    def __init__(self, message: str, code: str, *args):
        self.name = "UserDefinedException"
        self.message = message
        self.code = code
