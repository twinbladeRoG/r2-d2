import { useUserFiles } from "../../apis/queries/file-storage.queries";
import {
  Badge,
  Card,
  DefaultMantineColor,
  Skeleton,
  Table
} from "@mantine/core";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable
} from "@tanstack/react-table";
import { ExtractionStatus, IFile } from "../../types";
import dayjs from "dayjs";
import { bytesToSize } from "../../utils";
import { MIME_TYPES } from "@mantine/dropzone";
import { Icon } from "@iconify/react";
import { useMemo } from "react";
import UserDocumentAction from "./UserDocumentAction";

const columnHelper = createColumnHelper<IFile>();

const getFileIcon = (type: string) => {
  switch (type) {
    case MIME_TYPES.pdf:
      return "mdi:file-pdf";
    case MIME_TYPES.docx:
      return "mdi:file-word";
    default:
      return "mdi:file-document";
  }
};

const UserDocuments = () => {
  const documents = useUserFiles();

  const getStatusColor = (status: ExtractionStatus): DefaultMantineColor => {
    switch (status) {
      case "pending":
        return "yellow";
      case "in_progress":
        return "blue";
      case "completed":
        return "green";
      case "failed":
        return "red";
      default:
        return "gray";
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("filename", {
        header: "File",
        cell: (info) => (
          <div className="flex items-center gap-2">
            <Icon
              icon={getFileIcon(info.row.original.content_type)}
              className="text-2xl"
            />
            <span>{info.getValue()}</span>
          </div>
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
        header: "Actions",
        cell: (info) => <UserDocumentAction document={info.row.original} />
      })
    ],
    []
  );

  const table = useReactTable({
    data: documents.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <Card>
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
          {documents.isFetching ? (
            <>
              <Table.Tr>
                <Table.Td colSpan={columns.length}>
                  <Skeleton height={30} radius="sm" />
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td colSpan={columns.length}>
                  <Skeleton height={30} radius="sm" />
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td colSpan={columns.length}>
                  <Skeleton height={30} radius="sm" />
                </Table.Td>
              </Table.Tr>
            </>
          ) : null}

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
    </Card>
  );
};

export default UserDocuments;
