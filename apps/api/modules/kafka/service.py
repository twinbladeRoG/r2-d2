import json

from aiokafka.structs import ConsumerRecord
from sqlmodel import Session

from api.core.db import engine
from api.logger import logger
from api.modules.document_extraction.schemas import ScheduledExtraction
from api.modules.document_extraction.service import DocumentExtractorService
from api.modules.file_storage.service import FileStorageService
from api.modules.users.service import UserService

from .enums import KafkaTopic
from .producer import create_kafka_producer


class KafkaConsumerService:
    async def consume_message(self, message: ConsumerRecord):
        """
        Process the consumed message.
        """
        # Here you can implement your logic to process the message
        # For example, you can deserialize the message and perform some action
        value = json.loads(message.value.decode("utf-8"))

        match message.topic:
            case KafkaTopic.EXTRACT_DOCUMENT.value:
                try:
                    payload = ScheduledExtraction.model_validate(value)

                    with Session(engine) as session:
                        document_service = DocumentExtractorService()
                        user_service = UserService()
                        file_storage_service = FileStorageService()

                        user = user_service.get_user_by_id(session, payload.user_id)
                        document = file_storage_service.get_file(
                            user, session, payload.file_id
                        )
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
                    logger.error(
                        f"Error processing message from topic ({message.topic}): {e}"
                    )
