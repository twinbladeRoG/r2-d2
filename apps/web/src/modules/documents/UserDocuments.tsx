import { useUserFiles } from "../../apis/queries/file-storage.queries";
import {
  Anchor,
  Badge,
  Button,
  Card,
  Checkbox,
  Skeleton,
  Table
} from "@mantine/core";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  RowSelectionState,
  useReactTable
} from "@tanstack/react-table";
import { IFile } from "../../types";
import dayjs from "dayjs";
import { bytesToSize, getFileIcon, getStatusColor } from "../../utils";
import { Icon } from "@iconify/react";
import { useMemo, useState } from "react";
import UserDocumentAction from "./UserDocumentAction";
import CreateKnowledgeBase from "../knowledge-base/CreateKnowledgeBase";
import { useDisclosure } from "@mantine/hooks";

const columnHelper = createColumnHelper<IFile>();

const UserDocuments = () => {
  const documents = useUserFiles();

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

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
        cell: (info) => <UserDocumentAction document={info.row.original} />
      })
    ],
    []
  );

  const table = useReactTable({
    data: documents.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection
    },
    getRowId: (row) => row.id
  });

  const [opened, handlers] = useDisclosure(false);

  return (
    <Card>
      <div className="flex mb-4">
        <Button
          size="sm"
          color="violet"
          onClick={() => handlers.open()}
          disabled={table.getSelectedRowModel().rows.length === 0}
          leftSection={<Icon icon="hugeicons:ai-book" />}>
          Create Knowledge Base
        </Button>

        <CreateKnowledgeBase
          opened={opened}
          onClose={handlers.close}
          selectedDocumentIds={table
            .getSelectedRowModel()
            .rows.map((row) => row.id)}
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
