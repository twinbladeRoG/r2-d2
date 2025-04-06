from enum import Enum


class KafkaTopic(Enum):
    """Kafka topics for different services."""

    EXTRACT_DOCUMENT = "extract.document"
    EXTRACT_DOCUMENT_STATUS = "extract.document.status"
