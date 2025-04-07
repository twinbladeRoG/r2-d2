import asyncio
import json

from aiokafka import AIOKafkaProducer

from api.core.config import settings


def create_kafka_producer():
    """
    Create a Kafka producer that sends messages to the specified topic.
    """
    loop = asyncio.get_event_loop()
    servers = settings.KAFKA_BROKERS

    producer = AIOKafkaProducer(
        bootstrap_servers=servers,
        value_serializer=lambda m: json.dumps(m).encode("ascii"),
        loop=loop,
    )

    return producer
