from typing import Optional

from pydantic import BaseModel, Field

from api.models import ExtractionStatus


class FileFilterParams(BaseModel):
    exclude: list[str] = Field(
        default=None, description="List of file IDs to exclude from the results"
    )
    search: str = Field(
        default=None, description="Search term to filter files by name or content"
    )
    extraction_status: Optional[ExtractionStatus] = None
    file_types: list[str] = Field(
        default=None, description="Filter file type like text/csv"
    )
