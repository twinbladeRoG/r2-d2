import asyncio
import json
from datetime import datetime
from pprint import pprint

from fastapi import APIRouter, WebSocket
from pydantic import ValidationError

from api.dependencies import (
    CurrentUser,
    FileStorageServiceDep,
    SessionDep,
    get_current_user,
)
from api.logger import logger
from api.modules.kafka.consumer import create_kafka_consumer
from api.modules.kafka.dependencies import KafkaProducerDep
from api.modules.kafka.enums import KafkaTopic

from .dependencies import DocumentExtractorDep
from .schemas import ExtractionStatus, ScheduledExtraction

router = APIRouter(prefix="/document-extraction", tags=["Document Extraction"])


@router.post("/{file_id}")
async def extract_document(
    session: SessionDep,
    user: CurrentUser,
    document_extraction_service: DocumentExtractorDep,
    file_storage_service: FileStorageServiceDep,
    producer: KafkaProducerDep,
    file_id: str,
):
    document = file_storage_service.get_file(user, session, file_id)
    file_path = file_storage_service.get_file_path(user, session, file_id)
    result = await document_extraction_service.extract_document(
        session, user, document, producer, file_path
    )
    return result


@router.post("/{file_id}/schedule")
async def schedule_extraction(
    session: SessionDep,
    document_extraction_service: DocumentExtractorDep,
    user: CurrentUser,
    file_storage_service: FileStorageServiceDep,
    producer: KafkaProducerDep,
    file_id: str,
):
    document = file_storage_service.get_file(user, session, file_id)
    await document_extraction_service.schedule_extraction(
        session, producer, user, document
    )
    return None


@router.get("/{file_id}/sections")
def get_extracted_sections(
    session: SessionDep,
    user: CurrentUser,
    file_storage_service: FileStorageServiceDep,
    document_extraction_service: DocumentExtractorDep,
    file_id: str,
):
    document = file_storage_service.get_file(user, session, file_id)
    sections = document_extraction_service.get_document_extracted_section(
        session, document
    )

    return sections


@router.get("/{file_id}/usage-log")
def get_extraction_usage_log(
    session: SessionDep,
    user: CurrentUser,
    file_storage_service: FileStorageServiceDep,
    document_extraction_service: DocumentExtractorDep,
    file_id: str,
):
    document = file_storage_service.get_file(user, session, file_id)
    sections = document_extraction_service.get_document_extraction_usage_log(
        session, document
    )

    return sections


@router.websocket("/{file_id}/ws")
async def file_extraction_status(
    websocket: WebSocket,
    file_id: str,
    file_storage_service: FileStorageServiceDep,
    session: SessionDep,
    token: str | None = None,
):
    logger.info("> Websocket starting")
    await websocket.accept()
    logger.info("> Websocket started")

    user = get_current_user(session, token)
    document = file_storage_service.get_file(user, session, file_id)

    consumer = create_kafka_consumer(
        KafkaTopic.EXTRACT_DOCUMENT_STATUS.value, loop=None
    )

    try:
        await consumer.start()
        logger.info("> Consumer started")

        logger.info(f"> Document Status: {document.extraction_status}")

        if document.extraction_status == ExtractionStatus.COMPLETED:
            message = ScheduledExtraction.model_validate(
                {
                    "user_id": user.id.hex,
                    "file_id": document.id.hex,
                    "status": ExtractionStatus.COMPLETED,
                }
            )
            await websocket.send_json(message.model_dump(mode="json"))
            await websocket.close(1000, "Document extraction is completed")
        elif document.extraction_status == ExtractionStatus.FAILED:
            message = ScheduledExtraction.model_validate(
                {
                    "user_id": user.id.hex,
                    "file_id": document.id.hex,
                    "status": ExtractionStatus.FAILED,
                }
            )
            await websocket.send_json(message.model_dump(mode="json"))
            await websocket.close(1000, "Document extraction failed")
        else:
            async for message in consumer:
                timestamp = datetime.now().strftime("%I:%M%p")
                logger.info(
                    f"[{timestamp}] Received message from topic: {message.topic}"
                )
                value = json.loads(message.value.decode("utf-8"))
                pprint(value)  # noqa: T203
                try:
                    validated_message = ScheduledExtraction.model_validate(value)
                    await websocket.send_json(value)

                    if validated_message.status in [
                        ExtractionStatus.COMPLETED,
                        ExtractionStatus.FAILED,
                    ]:
                        await consumer.stop()
                        await websocket.close(1000, "Document extraction is completed")

                except ValidationError as e:
                    logger.error(
                        f"Failed to validated message for topic: {message.topic}"
                    )
                    logger.error(value)

    except asyncio.CancelledError as e:
        logger.error(f"> Error: {e}")

        await consumer.stop()
    finally:
        await consumer.stop()
