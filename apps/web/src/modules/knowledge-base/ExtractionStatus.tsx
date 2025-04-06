import { Icon } from "@iconify/react/dist/iconify.js";
import { Badge } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useWebSocket, { ReadyState } from "react-use-websocket";

const API_URL = import.meta.env.VITE_API_URL_BASE;

const ExtractionStatus = () => {
  const { id } = useParams();
  const [status, setStatus] = useState<string | null>(null);

  const { lastJsonMessage, readyState } = useWebSocket(
    `ws://${API_URL}/api/v1/document-extraction/${id}/ws?token=${localStorage.getItem("ACCESS_TOKEN")}`,
    {
      share: false,
      shouldReconnect: () => false,
      onError(event) {
        console.log("err", event);
      },
      onClose: (event) => {
        notifications.show({
          color: "green",
          message: event.reason
        });
      },
      onMessage(event) {
        console.log(event);
        const message = JSON.parse(event.data);
        console.log(message);

        setStatus(message.status as string);
      }
    }
  );

  useEffect(() => {
    console.log("readyState", readyState);
  }, [readyState]);

  useEffect(() => {
    console.log("lastJsonMessage", lastJsonMessage);
  }, [lastJsonMessage]);

  return (
    <section>
      <h1>Extraction</h1>
      <Badge leftSection={<Icon icon="mdi:circle" className="text-xs" />}>
        {ReadyState[readyState]}
      </Badge>
      <Badge>{status}</Badge>
    </section>
  );
};

export default ExtractionStatus;
