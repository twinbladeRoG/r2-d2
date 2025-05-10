import { useMutation, useQuery } from "@tanstack/react-query";
import {
  extractDocument,
  getExtractedDocumentSections,
  getExtractedUsageLogs,
  scheduleExtractDocument
} from "../requests/extract.requests";
import { notifications } from "@mantine/notifications";

export const useExtractDocument = () => {
  return useMutation({
    mutationFn: async (fileId: string) => {
      const res = await extractDocument(fileId);
      return res;
    },
    onError: (err) => {
      notifications.show({
        message: err.message,
        color: "red"
      });
    }
  });
};

export const useScheduleExtractDocument = () =>
  useMutation({
    mutationFn: async (fileId: string) => {
      const res = await scheduleExtractDocument(fileId);
      return res;
    },
    onError: (err) => {
      notifications.show({
        message: err.message,
        color: "red"
      });
    }
  });

export const useExtractedDocumentSections = (id: string) =>
  useQuery({
    queryKey: ["extracted-document-sections", id],
    queryFn: async () => {
      const res = await getExtractedDocumentSections(id);
      return res;
    },
    enabled: !!id
  });

export const useExtractedUsageLogs = (id: string) =>
  useQuery({
    queryKey: ["extracted-usage-logs", id],
    queryFn: async () => {
      const res = await getExtractedUsageLogs(id);
      return res;
    },
    enabled: !!id
  });
