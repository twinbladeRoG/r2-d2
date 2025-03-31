from datetime import datetime
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


class CPUUsage(BaseModel):
    cpu_utilization: float
    cpu_count: int
    total_memory: float
    available_memory: float
    used_memory: float
    free_memory: float
    memory_percentage: float


class GPUUsage(BaseModel):
    index: int
    name: str
    utilization: float
    memory_used: float
    memory_total: float
    memory_free: float
    memory_available: float
    temperature: int | None


class UsageLog(BaseModel):
    timestamp: datetime
    cpu_usage: CPUUsage
    gpu_usage: list[GPUUsage]


class ExtractionResult(BaseModel):
    usage_log: list[UsageLog]
    documents: list[ExtractedDocument]
