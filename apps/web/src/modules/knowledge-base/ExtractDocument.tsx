import React, { useMemo, useState } from "react";
import { useUserFiles } from "../../apis/queries/file-storage.queries";
import { cn } from "../../utils";
import {
  Anchor,
  Button,
  Card,
  Code,
  Collapse,
  Divider,
  Select,
  Table,
  Text,
  Title
} from "@mantine/core";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  useExtractDocument,
  useScheduleExtractDocument
} from "../../apis/queries/extract.queries";
import Markdown, { ReactRenderer } from "marked-react";
import { IExtractedSection, IUsageLog } from "../../types";
import ResourceCharts from "./ResourceCharts";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";

interface ExtractDocumentProps {
  className?: string;
}

const schema = yup.object({
  fileId: yup.string().required("Required")
});

const ExtractDocument: React.FC<ExtractDocumentProps> = ({ className }) => {
  const documents = useUserFiles();
  const extract = useExtractDocument();
  const scheduleExtraction = useScheduleExtractDocument();

  const form = useForm({
    resolver: yupResolver(schema),
    defaultValues: { fileId: undefined }
  });

  const [extractedItems, setExtractedItems] = useState<IExtractedSection[]>([]);
  const [usageLog, setUsage] = useState<IUsageLog | null>(null);

  const handleSubmit = form.handleSubmit(async (data) => {
    setUsage(null);
    setExtractedItems([]);
    extract.mutate(data.fileId, {
      onSuccess: (res) => {
        setExtractedItems(res.sections);
        setUsage(res.usage_log);
      }
    });
  });

  const renderer = useMemo(
    () =>
      ({
        list(children: React.ReactNode, ordered: boolean) {
          if (ordered)
            return (
              <ol className="list-inside my-2 list-decimal">{children}</ol>
            );
          return <ul className="list-inside my-2 list-disc">{children}</ul>;
        },
        code(code: React.ReactNode) {
          return (
            <Code block my="md">
              {code}
            </Code>
          );
        },
        table(children) {
          return (
            <Table withTableBorder withColumnBorders>
              {children}
            </Table>
          );
        },
        tableBody(children) {
          return <Table.Tbody>{children}</Table.Tbody>;
        },
        tableHeader(children) {
          return <Table.Thead>{children}</Table.Thead>;
        },
        tableRow(children) {
          return <Table.Tr>{children}</Table.Tr>;
        },
        tableCell(children) {
          return <Table.Td>{children}</Table.Td>;
        },
        heading(children, level) {
          return <Title order={level}>{children}</Title>;
        },
        link(href, text) {
          return (
            <Anchor href={href} target="_blank">
              {text}
            </Anchor>
          );
        }
      }) satisfies Partial<ReactRenderer>,
    []
  );

  const [showResource, handleResource] = useDisclosure();

  const handleScheduleExtraction = async () => {
    try {
      const isValid = await form.trigger("fileId");

      if (!isValid) return;

      const fileId = form.getValues("fileId");

      scheduleExtraction.mutate(fileId, {
        onSuccess: () => {
          notifications.show({
            message: "Extraction scheduled successfully",
            color: "green"
          });
        }
      });
    } catch {
      //
    }
  };

  return (
    <section className={cn(className)}>
      <Card mb="lg">
        <form onSubmit={handleSubmit}>
          <Controller
            control={form.control}
            name="fileId"
            render={({ field, fieldState }) => (
              <Select
                label="Select File"
                data={documents.data?.map((doc) => ({
                  value: doc.id,
                  label: doc.filename
                }))}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                mb="lg"
              />
            )}
          />

          <Button
            type="submit"
            loading={extract.isPending}
            disabled={scheduleExtraction.isPending}>
            Extract
          </Button>

          <Button
            type="button"
            ml="md"
            loading={scheduleExtraction.isPending}
            onClick={handleScheduleExtraction}
            color="indigo">
            Schedule Extraction
          </Button>
        </form>
      </Card>

      {usageLog ? (
        <>
          <Button
            variant="light"
            mb="lg"
            fullWidth
            onClick={handleResource.toggle}>
            Resource Utilization
          </Button>

          <Collapse in={showResource}>
            <Card my="lg">
              <ResourceCharts usage={usageLog.usage_log} />
            </Card>
          </Collapse>
        </>
      ) : null}

      <Card>
        {extractedItems.map((item) => (
          <Card
            mb="lg"
            key={item.id}
            bg={item?.type === "table" ? "dark.9" : "gray.9"}>
            <div>
              <Markdown breaks renderer={renderer}>
                {item.content}
              </Markdown>
            </div>

            <Divider my="md" />

            <Text size="sm" c="gray.6">
              Page Number: {item.page_number}
            </Text>
          </Card>
        ))}
      </Card>
    </section>
  );
};

export default ExtractDocument;
