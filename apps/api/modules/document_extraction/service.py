import json
from pathlib import Path
from uuid import UUID

from aiokafka import AIOKafkaProducer
from sqlmodel import Session

from api.logger import logger
from api.models import (
    Document,
    ExtractedSection,
    ExtractionResult,
    ExtractionUsageLog,
    User,
)
from api.modules.kafka.enums import KafkaTopic

from .docling_extractor import DoclingExtractor
from .schemas import ExtractionStatus, ScheduledExtraction


class DocumentExtractorService:
    def __init__(self):
        self.converter = DoclingExtractor()

    def extract_document(
        self, session: Session, user: User, document: Document, file_path: Path
    ):
        document.extraction_status = ExtractionStatus.IN_PROGRESS
        session.add(document)
        session.commit()
        session.refresh(document)

        try:
            result = self.converter.run(file_path)
            document.extraction_status = ExtractionStatus.COMPLETED
        except Exception as e:
            logger.error(f"Error during document extraction: {e}")
            document.extraction_status = ExtractionStatus.FAILED

        session.add(document)
        session.commit()
        session.refresh(document)

        sections = []
        for item in result.documents:
            extracted_section = ExtractedSection(
                document_id=document.id,
                content=item.text,
                type=item.type,
                page_number=item.page_number,
            )
            sections.append(extracted_section)

        extraction_usage_log = ExtractionUsageLog(
            document_id=document.id, usage_log=result.usage_log.model_dump(mode="json")
        )

        session.add(extraction_usage_log)
        session.add_all(sections)
        session.commit()
        session.refresh(document)
        session.refresh(extraction_usage_log)

        response = ExtractionResult(
            sections=document.extracted_sections, usage_log=extraction_usage_log
        )

        return response

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
