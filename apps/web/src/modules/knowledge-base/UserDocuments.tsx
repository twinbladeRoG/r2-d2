import { useUserFiles } from "../../apis/queries/file-storage.queries";
import { Card, Table } from "@mantine/core";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable
} from "@tanstack/react-table";
import { IFile } from "../../types";
import dayjs from "dayjs";
import { bytesToSize } from "../../utils";
import { MIME_TYPES } from "@mantine/dropzone";
import { Icon } from "@iconify/react";

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

const columns = [
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
  columnHelper.accessor("created_at", {
    header: "Created At",
    cell: (info) => dayjs(info.getValue()).format("DD MMM YYYY")
  }),
  columnHelper.accessor("content_length", {
    header: "Size",
    cell: (info) => bytesToSize(info.getValue())
  })
];

const UserDocuments = () => {
  const documents = useUserFiles();

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
