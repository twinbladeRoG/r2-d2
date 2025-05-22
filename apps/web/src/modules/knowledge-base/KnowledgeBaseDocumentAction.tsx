import React from "react";
import { EXTRACTION_STATUS, IFile } from "../../types";
import { ActionIcon, Loader, Tooltip } from "@mantine/core";
import { Icon } from "@iconify/react";
import { useScheduleExtractDocument } from "../../apis/queries/extract.queries";
import { notifications } from "@mantine/notifications";
import { useNavigate } from "react-router-dom";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { useQueryClient } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL_BASE;

interface KnowledgeBaseDocumentActionProps {
  document: IFile;
  knowledgeBaseId: string;
}

const KnowledgeBaseDocumentAction: React.FC<
  KnowledgeBaseDocumentActionProps
> = ({ document, knowledgeBaseId }) => {
  const navigate = useNavigate();
  const scheduleExtraction = useScheduleExtractDocument();

  const handleScheduleExtract = () => {
    scheduleExtraction.mutate(document.id, {
      onSuccess: () => {
        notifications.show({
          message: "Extraction scheduled successfully",
          color: "green"
        });
        navigate(`/extraction/${document.id}`);
      }
    });
  };

  const queryClient = useQueryClient();

  const { readyState } = useWebSocket(
    `ws://${API_URL}/api/v1/document-extraction/${document.id}/ws?token=${localStorage.getItem("ACCESS_TOKEN")}`,
    {
      share: true,
      shouldReconnect: () => false,
      onError() {
        queryClient.invalidateQueries({
          queryKey: ["knowledge-base", knowledgeBaseId]
        });
      },
      onClose: () => {
        queryClient.invalidateQueries({
          queryKey: ["knowledge-base", knowledgeBaseId]
        });
      },
      onMessage() {
        queryClient.invalidateQueries({
          queryKey: ["knowledge-base", knowledgeBaseId]
        });
      }
    },
    ![EXTRACTION_STATUS.PENDING, EXTRACTION_STATUS.COMPLETED].includes(
      document.extraction_status as "pending" | "completed"
    )
  );

  const isProcessing = readyState === ReadyState.OPEN;

  return (
    <div className="flex gap-2 justify-end items-center">
      {isProcessing ? (
        <Loader size="xs" />
      ) : (
        <Tooltip label="Schedule Extraction">
          <ActionIcon
            variant="light"
            color="blue"
            disabled={isProcessing}
            loading={scheduleExtraction.isPending}
            onClick={handleScheduleExtract}>
            <Icon icon="mdi:file-clock" />
          </ActionIcon>
        </Tooltip>
      )}
    </div>
  );
};

export default KnowledgeBaseDocumentAction;
