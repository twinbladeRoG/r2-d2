import React, { useMemo, useState } from "react";
import { IFile } from "../../types";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  RowSelectionState,
  useReactTable
} from "@tanstack/react-table";
import { Anchor, Badge, Button, Checkbox, Table } from "@mantine/core";
import { Icon } from "@iconify/react/dist/iconify.js";
import { bytesToSize, getFileIcon, getStatusColor } from "../../utils";
import dayjs from "dayjs";
import KnowledgeBaseDocumentAction from "./KnowledgeBaseDocumentAction";
import { useScheduleDocumentsForExtraction } from "../../apis/queries/extract.queries";
import { useQueryClient } from "@tanstack/react-query";
import DocumentsModal from "./DocumentsModal";
import { useDisclosure } from "@mantine/hooks";
import { useAddDocumentToKnowledgeBase } from "../../apis/queries/knowledge-base.queries";

interface KnowledgeBaseDocumentsProps {
  documents: Array<IFile>;
  knowledgeBaseId: string;
}

const columnHelper = createColumnHelper<IFile>();

const KnowledgeBaseDocuments: React.FC<KnowledgeBaseDocumentsProps> = ({
  documents,
  knowledgeBaseId
}) => {
  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
          />
        )
      }),
      columnHelper.accessor("filename", {
        header: "File",
        cell: (info) => (
          <Anchor
            href={`/extraction/${info.row.original.id}`}
            title={info.getValue()}>
            <div className="flex gap-2 items-center">
              <Icon
                icon={getFileIcon(info.row.original.content_type)}
                className="text-2xl"
              />
              <span className="">{info.row.original.original_filename}</span>
            </div>
          </Anchor>
        )
      }),
      columnHelper.accessor("extraction_status", {
        header: "Extraction Status",
        cell: (info) => (
          <Badge color={getStatusColor(info.getValue())}>
            {info.getValue()}
          </Badge>
        )
      }),
      columnHelper.accessor("created_at", {
        header: "Created At",
        cell: (info) => dayjs(info.getValue()).format("DD MMM YYYY")
      }),
      columnHelper.accessor("content_length", {
        header: "Size",
        cell: (info) => bytesToSize(info.getValue())
      }),
      columnHelper.display({
        id: "actions",
        header: () => <p className="text-center">Actions</p>,
        cell: (info) => (
          <KnowledgeBaseDocumentAction
            document={info.row.original}
            knowledgeBaseId={knowledgeBaseId}
          />
        )
      })
    ],
    [knowledgeBaseId]
  );

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const table = useReactTable({
    data: documents,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection
    },
    getRowId: (row) => row.id
  });

  const scheduleForExtraction = useScheduleDocumentsForExtraction();
  const queryClient = useQueryClient();
  const addDocumentsToKnowledgeBase =
    useAddDocumentToKnowledgeBase(knowledgeBaseId);

  const handleDocumentsForExtraction = () => {
    const selectedRows = table.getSelectedRowModel().rows.map((row) => row.id);
    scheduleForExtraction.mutate(selectedRows, {
      onSuccess: () => {
        table.resetRowSelection();
        queryClient.invalidateQueries({
          queryKey: ["knowledge-base", knowledgeBaseId]
        });
      }
    });
  };

  const [showDocumentsModal, documentsModalHandler] = useDisclosure();

  const handleAddDocuments = (documents: string[]) => {
    addDocumentsToKnowledgeBase.mutate(documents, {
      onSuccess: () => documentsModalHandler.close()
    });
  };

  return (
    <>
      <div className="flex gap-4 mb-4">
        <Button
          size="sm"
          color="violet"
          loading={scheduleForExtraction.isPending}
          onClick={handleDocumentsForExtraction}
          disabled={table.getSelectedRowModel().rows.length === 0}
          leftSection={<Icon icon="hugeicons:ai-book" />}>
          Schedule for Extraction
        </Button>

        <Button
          size="sm"
          color="green"
          leftSection={<Icon icon="mdi:plus" />}
          onClick={documentsModalHandler.open}>
          Add Document
        </Button>
        <DocumentsModal
          opened={showDocumentsModal}
          onClose={documentsModalHandler.close}
          excludedFileIds={documents.map((doc) => doc.id)}
          onAddDocuments={handleAddDocuments}
          isAdding={addDocumentsToKnowledgeBase.isPending}
        />
      </div>

      <Table>
        <Table.Thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <Table.Th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </Table.Th>
              ))}
            </Table.Tr>
          ))}
        </Table.Thead>

        <Table.Tbody>
          {table.getRowModel().rows.length === 0 ? (
            <Table.Tr>
              <Table.Td colSpan={columns.length} align="center">
                No documents uploaded yet
              </Table.Td>
            </Table.Tr>
          ) : null}

          {table.getRowModel().rows.map((row) => (
            <Table.Tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <Table.Td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Table.Td>
              ))}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </>
  );
};

export default KnowledgeBaseDocuments;
