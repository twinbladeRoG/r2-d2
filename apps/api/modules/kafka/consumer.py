import asyncio
import json
from datetime import datetime
from pprint import pprint

from aiokafka import AIOKafkaConsumer
from redis import Redis
from rq import Queue

from api.core.config import settings
from api.logger import logger
from api.modules.document_extraction.schemas import ScheduledExtraction
from api.modules.worker.extract_worker import extract_document

from .enums import KafkaTopic

q = Queue("extract", connection=Redis(settings.REDIS_HOST, settings.REDIS_PORT))


def create_kafka_consumer(
    *topic: list[str], loop: asyncio.AbstractEventLoop = None
) -> AIOKafkaConsumer:
    """
    Create a Kafka consumer that consumes messages from the specified topic.
    """
    consumer = AIOKafkaConsumer(
        *topic,
        bootstrap_servers=settings.KAFKA_BROKERS,
        loop=loop,
    )

    return consumer


async def consume(consumer: AIOKafkaConsumer):
    """
    Consume messages from the Kafka topic.
    """
    await consumer.start()
    logger.info("Kafka consumer started")
    try:
        async for message in consumer:
            timestamp = datetime.now().strftime("%I:%M%p")
            logger.info(f"[{timestamp}] Received message from topic: {message.topic}")
            value = json.loads(message.value.decode("utf-8"))
            pprint(value)  # noqa: T203

            match message.topic:
                case KafkaTopic.EXTRACT_DOCUMENT.value:
                    try:
                        payload = ScheduledExtraction.model_validate(value)
                        q.enqueue(extract_document, payload)
                    except Exception as e:
                        logger.error(
                            f"Error processing message from topic ({message.topic}): {e}"
                        )
    except asyncio.CancelledError as e:
        await consumer.stop()
    finally:
        await consumer.stop()
