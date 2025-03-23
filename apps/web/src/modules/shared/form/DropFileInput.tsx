import React from "react";
import {
  Dropzone,
  DropzoneProps,
  FileRejection,
  FileWithPath,
  MIME_TYPES
} from "@mantine/dropzone";
import { ActionIcon, Card, Group, Text } from "@mantine/core";
import { Icon } from "@iconify/react";
import { bytesToSize } from "../../../utils";

interface DropFileInputProps extends Partial<DropzoneProps> {
  children?: React.ReactNode;
  error?: string;
  value?: FileWithPath[];
}

const DropFileInput: React.FC<DropFileInputProps> = ({
  children,
  onDrop,
  error,
  value,
  ...props
}) => {
  const handleDrop = (newFiles: FileWithPath[]) => {
    onDrop?.(newFiles);
  };

  const [rejections, setRejections] = React.useState<FileRejection[] | null>(
    null
  );

  const handleRejection = (fileRejections: FileRejection[]) => {
    setRejections(fileRejections);
  };

  const handleRemoveFile = (name: string) => {
    onDrop?.((value ?? [])?.filter((file) => file.name !== name));
  };

  return (
    <div className="space-y-4 mb-4">
      <Dropzone
        onDrop={handleDrop}
        maxSize={5 * 1024 ** 2}
        onReject={handleRejection}
        onDropAny={(files, fileRejections) => {
          if (files.length > 0 && fileRejections.length === 0) {
            setRejections(null);
          }
        }}
        {...props}>
        <Group
          justify="center"
          gap="xl"
          mih={220}
          style={{ pointerEvents: "none" }}>
          <Dropzone.Accept>
            <Icon icon="mdi:cloud-upload" />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <Icon icon="mdi:close-circle" />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <Icon icon="mdi:file-document-multiple" />
          </Dropzone.Idle>

          {children}
        </Group>

        {rejections?.map((rejection) => (
          <React.Fragment key={rejection.file.name}>
            {rejection.errors.map((error) => (
              <Text key={error.code + error.message} c="red">
                <span className="font-bold">{rejection.file.name}:</span>{" "}
                {error.message}
              </Text>
            ))}
          </React.Fragment>
        ))}

        {error && <Text c="red">{error}</Text>}
      </Dropzone>

      <div className="grid grid-cols-4 gap-4">
        {value?.map((file) => (
          <Card key={file.name} shadow="lg" bg={"gray"} className="!relative">
            <div className="flex items-center justify-center gap-7">
              {file.type === MIME_TYPES.pdf && (
                <Icon icon="mdi:file-pdf" className="text-2xl text-red-400" />
              )}
              <div className="truncate">
                <div className="truncate">{file.name}</div>
                <div className="truncate">{bytesToSize(file.size)}</div>
              </div>

              <ActionIcon
                ml="auto"
                color="red"
                variant="light"
                onClick={() => handleRemoveFile(file.name)}>
                <Icon icon="mdi:trash" />
              </ActionIcon>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DropFileInput;
