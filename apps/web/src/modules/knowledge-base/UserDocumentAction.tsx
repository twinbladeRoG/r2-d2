import React from "react";
import { useRemoveFile } from "../../apis/queries/file-storage.queries";
import { ActionIcon, Text } from "@mantine/core";
import { Icon } from "@iconify/react";
import { IFile } from "../../types";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";

interface UserDocumentActionProps {
  document: IFile;
}

const UserDocumentAction: React.FC<UserDocumentActionProps> = ({
  document
}) => {
  const removeFile = useRemoveFile();

  const handleRemoveFile = () => {
    modals.openConfirmModal({
      title: "Are you sure you want to logout?",
      children: (
        <Text size="sm">
          This action will log you out of your account and you will need to log
          in again to access the application.
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

  return (
    <div>
      <ActionIcon
        variant="light"
        color="red"
        loading={removeFile.isPending}
        onClick={handleRemoveFile}>
        <Icon icon="mdi:trash" />
      </ActionIcon>
    </div>
  );
};

export default UserDocumentAction;
