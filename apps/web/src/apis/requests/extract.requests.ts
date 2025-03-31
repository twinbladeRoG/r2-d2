import { IExtractedItem, IUsageLog } from "../../types";
import http from "../http";

export const extractDocument = (fileId: string) =>
  http.post<{
    usage_log: IUsageLog[];
    documents: IExtractedItem[];
  }>(`/api/v1/document-extraction/${fileId}`);
