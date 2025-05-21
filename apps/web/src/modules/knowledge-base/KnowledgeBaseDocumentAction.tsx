import React from "react";
import { IFile } from "../../types";
import { ActionIcon, Tooltip } from "@mantine/core";
import { Icon } from "@iconify/react";
import { useScheduleExtractDocument } from "../../apis/queries/extract.queries";
import { notifications } from "@mantine/notifications";
import { useNavigate } from "react-router-dom";

interface KnowledgeBaseDocumentActionProps {
  document: IFile;
}

const KnowledgeBaseDocumentAction: React.FC<
  KnowledgeBaseDocumentActionProps
> = ({ document }) => {
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

  return (
    <div className="flex gap-2 justify-end">
      <Tooltip label="Schedule Extraction">
        <ActionIcon
          variant="light"
          color="blue"
          loading={scheduleExtraction.isPending}
          onClick={handleScheduleExtract}>
          <Icon icon="mdi:file-clock" />
        </ActionIcon>
      </Tooltip>
    </div>
  );
};

export default KnowledgeBaseDocumentAction;
