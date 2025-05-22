import { IExtractedSection, IUsageLog } from "../../types";
import http from "../http";

export const extractDocument = (fileId: string) =>
  http.post<{
    usage_log: IUsageLog;
    sections: IExtractedSection[];
  }>(`/api/v1/document-extraction/${fileId}`);

export const scheduleExtractDocument = (fileId: string) =>
  http.post<null>(`/api/v1/document-extraction/${fileId}/schedule`);

export const getExtractedDocumentSections = (fileId: string) =>
  http.get<IExtractedSection[]>(
    `/api/v1/document-extraction/${fileId}/sections`
  );

export const getExtractedUsageLogs = (fileId: string) =>
  http.get<IUsageLog>(`/api/v1/document-extraction/${fileId}/usage-log`);

export const scheduleDocumentsForExtraction = (fileIds: string[]) =>
  http.post<null>(`/api/v1/document-extraction/schedule-extraction`, {
    documents: fileIds
  });
