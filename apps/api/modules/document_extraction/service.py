import json
from pathlib import Path
from uuid import UUID

from aiokafka import AIOKafkaProducer
from sqlmodel import Session

from api.logger import logger
from api.models import User
from api.modules.kafka.enums import KafkaTopic

from .docling_extractor import DoclingExtractor
from .schemas import ScheduledExtraction


class DocumentExtractorService:
    def __init__(self):
        self.converter = DoclingExtractor()

    def extract_document(self, session: Session, user: User, file_path: Path):
        result = self.converter.run(file_path)

        return result

    async def schedule_extraction(
        self, kafka_producer: AIOKafkaProducer, user: User, file_id: UUID
    ):
        try:
            message = ScheduledExtraction.model_validate(
                {
                    "user_id": user.id.hex,
                    "file_id": file_id.hex,
                }
            )
            await kafka_producer.send_and_wait(
                KafkaTopic.EXTRACT_DOCUMENT.value, value=message.model_dump(mode="json")
            )
        except Exception as e:
            logger.error(f"Error sending message to Kafka: {e}")
        return None
