import {
  IChatMessageWithCitations,
  IDocumentChatMessageRequest
} from "../../types";
import http from "../http";

export const documentChat = (payload: IDocumentChatMessageRequest) =>
  http.post<IChatMessageWithCitations>("/api/v1/document-chat/", payload);
