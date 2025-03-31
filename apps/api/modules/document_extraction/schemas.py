from enum import Enum

from pydantic import BaseModel, PositiveInt


class DocumentType(str, Enum):
    text = "text"
    table = "table"
    figure = "figure"


class ExtractedDocument(BaseModel):
    text: str
    type: DocumentType
    page_number: PositiveInt
