import { Icon } from "@iconify/react";
import {
  Anchor,
  Badge,
  Button,
  Card,
  Checkbox,
  Divider,
  Modal,
  ScrollArea,
  Skeleton,
  Stack,
  Text,
  TextInput
} from "@mantine/core";
import React, { useEffect, useState } from "react";
import { useUserFiles } from "../../apis/queries/file-storage.queries";
import { bytesToSize, getFileIcon, getStatusColor } from "../../utils";
import { IFileFilterQuery } from "../../types";
import { useDebouncedCallback } from "@mantine/hooks";

interface DocumentsModalProps {
  opened: boolean;
  onClose: () => void;
  excludedFileIds?: string[];
  onAddDocuments?: (documents: string[]) => void;
  isAdding?: boolean;
}

const DocumentsModal: React.FC<DocumentsModalProps> = ({
  opened,
  onClose,
  excludedFileIds,
  onAddDocuments,
  isAdding
}) => {
  const [search, setSearch] = useState<string>("");
  const [filter, setFilter] = useState<IFileFilterQuery>({
    exclude: excludedFileIds
  });
  const documents = useUserFiles(filter);

  useEffect(() => {
    if (excludedFileIds) {
      setFilter((prev) => ({
        ...prev,
        exclude: excludedFileIds
      }));
    }
  }, [excludedFileIds]);

  const handleSearch = useDebouncedCallback((query: string) => {
    setFilter((prev) => ({
      ...prev,
      search: query
    }));
  }, 500);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    setSearch(value);
    handleSearch(value);
  };

  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const handleSelectDocument = (id: string) => {
    if (selectedDocuments.includes(id)) {
      setSelectedDocuments((prev) => prev.filter((docId) => docId !== id));
    } else {
      setSelectedDocuments((prev) => [...prev, id]);
    }
  };

  const handleAddDocuments = () => {
    if (onAddDocuments) {
      onAddDocuments(selectedDocuments);
    }
    setSelectedDocuments([]);
    onClose();
    setSearch("");
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Documents"
      size="lg"
      scrollAreaComponent={ScrollArea.Autosize}>
      <div className="flex gap-4 mb-4 items-center">
        <TextInput
          placeholder="Search documents..."
          radius="md"
          size="md"
          rightSection={<Icon icon="mdi:magnify" className="text-gray-500" />}
          value={search}
          onChange={handleChange}
          className="flex-1"
        />

        <Button
          disabled={selectedDocuments.length === 0}
          leftSection={
            selectedDocuments.length > 0 ? (
              <Badge color="blue.4">{selectedDocuments.length}</Badge>
            ) : null
          }
          loading={isAdding}
          onClick={handleAddDocuments}>
          Add
        </Button>
      </div>

      <Divider my="md" />

      {documents.isFetching && (
        <div className="flex flex-col gap-4">
          <Skeleton h={60} w={"100%"} radius="md" animate={true} />
          <Skeleton h={60} w={"100%"} radius="md" animate={true} />
          <Skeleton h={60} w={"100%"} radius="md" animate={true} />
        </div>
      )}

      {!documents.isFetching && documents.data?.length === 0 && (
        <Text size="sm" c="gray">
          No documents found
        </Text>
      )}

      <Stack>
        {documents.data?.map((doc) => (
          <Card key={doc.id}>
            <div className="flex items-center">
              <div className="">
                <Anchor
                  href={`/extraction/${doc.id}`}
                  title={doc.filename}
                  target="_blank"
                  mb="xs">
                  <div className="flex gap-2 items-center">
                    <Icon
                      icon={getFileIcon(doc.content_type)}
                      className="text-2xl"
                    />
                    <span className="">{doc.original_filename}</span>
                  </div>
                </Anchor>

                <div className="flex gap-4">
                  <div className="flex">
                    <Text size="sm" c="gray">
                      Extraction Status:
                    </Text>
                    <Badge
                      color={getStatusColor(doc.extraction_status)}
                      ml="sm">
                      {doc.extraction_status}
                    </Badge>
                  </div>

                  <Text size="sm" c="gray">
                    Size: <strong>{bytesToSize(doc.content_length)}</strong>
                  </Text>
                </div>
              </div>

              <Checkbox
                checked={selectedDocuments.includes(doc.id)}
                onChange={() => handleSelectDocument(doc.id)}
                className="ml-auto"
              />
            </div>
          </Card>
        ))}
      </Stack>
    </Modal>
  );
};

export default DocumentsModal;
