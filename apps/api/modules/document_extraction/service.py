import asyncio
import json
from pathlib import Path
from uuid import UUID

from aiokafka import AIOKafkaProducer
from sqlmodel import Session

from api.error import UserDefinedException
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
from .schemas import DoclingExtractionResult, ExtractionStatus, ScheduledExtraction


class DocumentExtractorService:
    def __init__(self):
        self.converter = DoclingExtractor()

    async def _change_document_status(
        self,
        session: Session,
        producer: AIOKafkaProducer,
        document: Document,
        user_id: str,
        status: ExtractionStatus,
    ):
        document.extraction_status = status.value
        session.add(document)
        session.commit()
        session.refresh(document)

        message = ScheduledExtraction.model_validate(
            {"file_id": document.id.hex, "user_id": user_id, "status": status.value}
        )

        await producer.send_and_wait(
            KafkaTopic.EXTRACT_DOCUMENT_STATUS.value,
            value=message.model_dump(mode="json"),
        )

    def _get_sections(
        self, session: Session, document: Document, result: DoclingExtractionResult
    ):
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
            document_id=document.id,
            usage_log=result.usage_log.model_dump(mode="json"),
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

    async def extract_document(
        self,
        session: Session,
        user: User,
        document: Document,
        kafka_producer: AIOKafkaProducer,
        file_path: Path,
    ):
        try:
            await self._change_document_status(
                session,
                kafka_producer,
                document,
                user.id.hex,
                ExtractionStatus.IN_PROGRESS,
            )

            await asyncio.sleep(2)

            result = self.converter.run(file_path)
            await self._change_document_status(
                session,
                kafka_producer,
                document,
                user.id.hex,
                ExtractionStatus.COMPLETED,
            )

            response = self._get_sections(session, document, result)

            return response
        except Exception as e:
            logger.error(f"Error during document extraction: {e}")
            document.extraction_status = ExtractionStatus.FAILED

            await self._change_document_status(
                session,
                kafka_producer,
                document,
                user.id.hex,
                ExtractionStatus.FAILED,
            )

            raise UserDefinedException(str(e), "EXTRACTION_FAILED")

    async def schedule_extraction(
        self,
        session: Session,
        kafka_producer: AIOKafkaProducer,
        user: User,
        document: Document,
    ):
        try:
            await self._change_document_status(
                session,
                kafka_producer,
                document,
                user.id.hex,
                ExtractionStatus.PENDING,
            )

            message = ScheduledExtraction.model_validate(
                {
                    "file_id": document.id.hex,
                    "user_id": user.id.hex,
                    "status": ExtractionStatus.IN_PROGRESS.value,
                }
            )
            await kafka_producer.send_and_wait(
                KafkaTopic.EXTRACT_DOCUMENT.value, value=message.model_dump(mode="json")
            )
        except Exception as e:
            logger.error(f"Error sending message to Kafka: {e}")
        return None
