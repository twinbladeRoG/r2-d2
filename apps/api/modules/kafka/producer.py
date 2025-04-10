import asyncio
import json

from aiokafka import AIOKafkaProducer

from api.core.config import settings


def create_kafka_producer():
    """
    Create a Kafka producer that sends messages to the specified topic.
    """
    producer = AIOKafkaProducer(
        bootstrap_servers=settings.KAFKA_BROKERS,
        value_serializer=lambda m: json.dumps(m).encode("ascii"),
    )

    return producer
