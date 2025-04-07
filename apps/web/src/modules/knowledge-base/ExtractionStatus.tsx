import { Icon } from "@iconify/react/dist/iconify.js";
import {
  Badge,
  Card,
  DefaultMantineColor,
  Divider,
  Skeleton,
  Title
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { useFile } from "../../apis/queries/file-storage.queries";
import { bytesToSize } from "../../utils";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { EXTRACTION_STATUS } from "../../types";

dayjs.extend(advancedFormat);

const API_URL = import.meta.env.VITE_API_URL_BASE;

const ExtractionStatus = () => {
  const { id } = useParams();
  const document = useFile(id as string);
  const [status, setStatus] = useState<string | null>(null);

  const { readyState } = useWebSocket(
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

  const webSocketStatusColor = useMemo((): DefaultMantineColor => {
    switch (readyState) {
      case ReadyState.UNINSTANTIATED:
        return "gray";
      case ReadyState.CONNECTING:
        return "blue";
      case ReadyState.CLOSING:
        return "yellow";
      case ReadyState.CLOSED:
        return "red";
      case ReadyState.OPEN:
        return "green";
      default:
        return "gray";
    }
  }, [readyState]);

  const extractionStatusColor = useMemo((): DefaultMantineColor => {
    switch (status) {
      case EXTRACTION_STATUS.PENDING:
        return "yellow";
      case EXTRACTION_STATUS.IN_PROGRESS:
        return "blue";
      case EXTRACTION_STATUS.COMPLETED:
        return "green";
      case EXTRACTION_STATUS.FAILED:
        return "red";
      default:
        return "gray";
    }
  }, [status]);

  return (
    <section>
      <Title order={2}>
        Extraction{" "}
        <Badge
          color={webSocketStatusColor}
          leftSection={<Icon icon="mdi:circle" className="text-xs" />}>
          {ReadyState[readyState]}
        </Badge>
      </Title>
      <Divider my="md" />

      {document.data ? (
        <Card>
          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
            <p className="text-gray-400 whitespace-nowrap">Filename: </p>
            <p className="font-bold break-all">{document.data?.filename}</p>

            <p className="text-gray-400 whitespace-nowrap">Size: </p>
            <p className="font-bold">
              {bytesToSize(document.data?.content_length)}
            </p>

            <p className="text-gray-400 whitespace-nowrap">Created At: </p>
            <p className="font-bold">
              {dayjs(document.data?.created_at).format("Do MMM YY, h:mm A")}
            </p>

            <p className="text-gray-400 whitespace-nowrap">
              Extraction Status:{" "}
            </p>
            <Badge color={extractionStatusColor}>{status}</Badge>
          </div>
        </Card>
      ) : (
        <Skeleton height={200} />
      )}
    </section>
  );
};

export default ExtractionStatus;
