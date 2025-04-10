from aiokafka.structs import ConsumerRecord
from sqlmodel import Session

from api.core.db import engine
from api.logger import logger
from api.modules.document_extraction.schemas import ScheduledExtraction
from api.modules.document_extraction.service import DocumentExtractorService
from api.modules.file_storage.service import FileStorageService
from api.modules.kafka.producer import create_kafka_producer
from api.modules.users.service import UserService


async def extract_document(message: ConsumerRecord):
    """
    Process the consumed message.
    """
    logger.info("Started Extraction")

    try:
        payload = ScheduledExtraction.model_validate(message)

        with Session(engine) as session:
            document_service = DocumentExtractorService()
            user_service = UserService()
            file_storage_service = FileStorageService()

            user = user_service.get_user_by_id(session, payload.user_id)
            document = file_storage_service.get_file(user, session, payload.file_id)
            file_path = file_storage_service.get_file_path(
                user, session, payload.file_id
            )

            kafka_producer = create_kafka_producer()
            await kafka_producer.start()

            await document_service.extract_document(
                session, user, document, kafka_producer, file_path
            )

            await kafka_producer.stop()

    except Exception as e:
        logger.error(f"Error processing message from topic ({message.topic}): {e}")
