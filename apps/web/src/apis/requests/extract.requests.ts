import { IExtractedSection, IUsageLog } from "../../types";
import http from "../http";

export const extractDocument = (fileId: string) =>
  http.post<{
    usage_log: IUsageLog;
    sections: IExtractedSection[];
  }>(`/api/v1/document-extraction/${fileId}`);

export const scheduleExtractDocument = (fileId: string) =>
  http.post<null>(`/api/v1/document-extraction/${fileId}/schedule`);
