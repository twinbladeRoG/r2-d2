from kafka import KafkaProducer


def main():
    producer = KafkaProducer(
        bootstrap_servers="localhost:9092",
    )

    producer.send("foobar", b"some_message_bytes")


if __name__ == "__main__":
    main()
