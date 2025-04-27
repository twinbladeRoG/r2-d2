from typing import Annotated

from aiokafka import AIOKafkaProducer
from fastapi import Depends

from api.logger import logger

from .producer import create_kafka_producer


async def kafka_producer_dependency():
    producer = create_kafka_producer()
    await producer.start()
    logger.debug("Starting Kafka producer...")
    try:
        yield producer
    finally:
        logger.debug("Stopping Kafka producer...")
        await producer.stop()


KafkaProducerDep = Annotated[AIOKafkaProducer, Depends(kafka_producer_dependency)]
