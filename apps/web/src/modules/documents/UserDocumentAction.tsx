import React from "react";
import { useRemoveFile } from "../../apis/queries/file-storage.queries";
import { ActionIcon, Text, Tooltip } from "@mantine/core";
import { Icon } from "@iconify/react";
import { IFile } from "../../types";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import {
  useExtractDocument,
  useScheduleExtractDocument
} from "../../apis/queries/extract.queries";
import { useNavigate } from "react-router-dom";
import { useCreateKnowledgeBaseFromDocument } from "../../apis/queries/knowledge-base.queries";

interface UserDocumentActionProps {
  document: IFile;
}

const UserDocumentAction: React.FC<UserDocumentActionProps> = ({
  document
}) => {
  const removeFile = useRemoveFile();
  const navigate = useNavigate();
  const extract = useExtractDocument();
  const scheduleExtraction = useScheduleExtractDocument();
  const createKnowledgeBase = useCreateKnowledgeBaseFromDocument();

  const handleRemoveFile = () => {
    modals.openConfirmModal({
      title: "Are you sure you want to delete is file?",
      children: (
        <Text size="sm">
          This action cannot be undone. All data related to this file will be
          lost.
        </Text>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onCancel: () => {},
      onConfirm: () => {
        removeFile.mutate(document.id, {
          onError: (err) => {
            notifications.show({
              color: "red",
              message: err.message
            });
          }
        });
      }
    });
  };

  const handleExtract = () => {
    extract.mutate(document.id);
  };

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

  const handleCreateKnowledgeBase = () => {
    createKnowledgeBase.mutate(document.id, {
      onSuccess: () =>
        notifications.show({
          color: "green",
          message: "Document added to knowledge base"
        })
    });
  };

  return (
    <div className="flex gap-2 justify-end">
      <Tooltip
        label={
          document.extraction_status === "completed"
            ? "Create Knowledge Base"
            : "Kindly extract the document first"
        }>
        <ActionIcon
          variant="light"
          color="violet"
          disabled={document.extraction_status !== "completed"}
          loading={createKnowledgeBase.isPending}
          onClick={handleCreateKnowledgeBase}>
          <Icon icon="mdi:stars" />
        </ActionIcon>
      </Tooltip>

      <Tooltip label="Extract Now">
        <ActionIcon
          variant="light"
          color="green"
          loading={extract.isPending}
          onClick={handleExtract}>
          <Icon icon="mdi:file-star-four-points-outline" />
        </ActionIcon>
      </Tooltip>

      <Tooltip label="Schedule Extraction">
        <ActionIcon
          variant="light"
          color="blue"
          disabled={extract.isPending}
          loading={scheduleExtraction.isPending}
          onClick={handleScheduleExtract}>
          <Icon icon="mdi:file-clock" />
        </ActionIcon>
      </Tooltip>

      <ActionIcon
        variant="light"
        color="red"
        disabled={extract.isPending}
        loading={removeFile.isPending}
        onClick={handleRemoveFile}>
        <Icon icon="mdi:trash" />
      </ActionIcon>
    </div>
  );
};

export default UserDocumentAction;
