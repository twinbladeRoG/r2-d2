from typing import Annotated

from fastapi import Depends

from .service import DocumentExtractorService

DocumentExtractorDep = Annotated[
    DocumentExtractorService, Depends(DocumentExtractorService)
]
