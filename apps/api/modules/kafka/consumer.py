from kafka import KafkaConsumer


def main():
    consumer = KafkaConsumer(
        "foobar",
        bootstrap_servers="localhost:9092",
    )
    for msg in consumer:
        print(msg.value)  # noqa: T201


if __name__ == "__main__":
    main()
