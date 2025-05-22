from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field, PositiveInt


class DocumentType(str, Enum):
    TEXT = "text"
    TABLE = "table"
    FIGURE = "figure"


class ExtractionStatus(str, Enum):
    PENDING = "pending"
    IN_QUEUE = "in_queue"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


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


class DoclingExtractionResult(BaseModel):
    usage_log: UsageLog
    documents: list[ExtractedDocument]


class ScheduledExtraction(BaseModel):
    file_id: str
    user_id: str
    status: ExtractionStatus = ExtractionStatus.PENDING


class DocumentsForExtraction(BaseModel):
    documents: list[str] = Field(min_length=1, max_length=255)
