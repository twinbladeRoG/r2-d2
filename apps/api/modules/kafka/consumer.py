import asyncio
import json
import logging
from pprint import pprint

from aiokafka import AIOKafkaConsumer

from api.core.config import settings

from .service import KafkaConsumerService

logger = logging.getLogger("uvicorn")


def create_kafka_consumer(
    topic: str, group_id: str, loop: asyncio.AbstractEventLoop = None
) -> AIOKafkaConsumer:
    """
    Create a Kafka consumer that consumes messages from the specified topic.
    """
    consumer = AIOKafkaConsumer(
        topic,
        bootstrap_servers=settings.KAFKA_BROKERS,
        group_id=group_id,
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
        kafka_consumer_service = KafkaConsumerService()

        async for message in consumer:
            logger.info(f"Received message from topic: {message.topic}")
            value = json.loads(message.value.decode("utf-8"))
            pprint(value)  # noqa: T203
            await kafka_consumer_service.consume_message(message)
    except asyncio.CancelledError as e:
        await consumer.stop()
    finally:
        await consumer.stop()
