from typing import Annotated

from fastapi import Depends

from .service import ChatService

ChatServiceDep = Annotated[ChatService, Depends(ChatService)]
