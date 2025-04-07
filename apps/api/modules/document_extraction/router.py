import asyncio
import json
from pathlib import Path
from pprint import pprint

from fastapi import APIRouter, WebSocket, WebSocketException

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
from pydantic import ValidationError


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


@router.websocket("/{file_id}/ws")
async def file_extraction_status(
    websocket: WebSocket,
    file_id: str,
    file_storage_service: FileStorageServiceDep,
    session: SessionDep,
    token: str | None = None,
):
    await websocket.accept()

    user = get_current_user(session, token)
    document = file_storage_service.get_file(user, session, file_id)
    loop = asyncio.get_event_loop()
    consumer = create_kafka_consumer(
        KafkaTopic.EXTRACT_DOCUMENT_STATUS.value, group_id="extract", loop=loop
    )

    try:
        await consumer.start()

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
        else:
            async for message in consumer:
                value = json.loads(message.value.decode("utf-8"))
                pprint(value)  # noqa: T203
                try:
                    validated_message = ScheduledExtraction.model_validate(value)
                    await websocket.send_json(value)
                    if validated_message.status == ExtractionStatus.COMPLETED:
                        await consumer.stop()
                        await websocket.close(1000, "Document extraction is completed")

                except ValidationError as e:
                    logger.error(
                        f"Failed to validated message for topic: {message.topic}"
                    )
                    logger.error(value)

    except asyncio.CancelledError as e:
        await consumer.stop()
    finally:
        await consumer.stop()
