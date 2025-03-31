import { IExtractedItem } from "../../types";
import http from "../http";

export const extractDocument = (fileId: string) =>
  http.post<IExtractedItem[]>(`/api/v1/document-extraction/${fileId}`);
