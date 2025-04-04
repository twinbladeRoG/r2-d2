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
    cpu_count: int = 0
    total_memory: float = 0.0
    # Time Series Metrics
    cpu_utilization: list[tuple[datetime, float]] = []
    available_memory: list[tuple[datetime, float]] = []
    used_memory: list[tuple[datetime, float]] = []
    free_memory: list[tuple[datetime, float]] = []
    memory_percentage: list[tuple[datetime, float]] = []


class GPUUsage(BaseModel):
    index: int = 0
    uuid: str = ""
    name: str = ""
    memory_total: float = 0.0
    # Time Series Metrics
    utilization: list[tuple[datetime, float]] = []
    memory_used: list[tuple[datetime, float]] = []
    memory_free: list[tuple[datetime, float]] = []
    memory_available: list[tuple[datetime, float]] = []
    temperature: list[tuple[datetime, int | None]] = []


class UsageLog(BaseModel):
    cpu_usage: CPUUsage
    gpu_usage: list[GPUUsage] = []


class ExtractionResult(BaseModel):
    usage_log: UsageLog
    documents: list[ExtractedDocument]
