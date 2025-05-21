import {
  ICreateKnowledgeBaseRequest,
  IKnowledgeBase,
  IKnowledgeBaseWithDocuments
} from "../../types";
import http from "../http";

export const createKnowledgeBaseFromDocument = (documentId: string) =>
  http.post<null>(`/api/v1/knowledge-base/${documentId}`);

export const createKnowledgeBase = (payload: ICreateKnowledgeBaseRequest) =>
  http.post<IKnowledgeBase>("/api/v1/knowledge-base/", payload);

export const getKnowledgeBases = () =>
  http.get<Array<IKnowledgeBase>>("/api/v1/knowledge-base/");

export const deleteKnowledgeBase = (knowledgeBaseId: string) =>
  http.delete<null>(`/api/v1/knowledge-base/${knowledgeBaseId}`);

export const getKnowledgeBase = (knowledgeBaseId: string) =>
  http.get<IKnowledgeBaseWithDocuments>(
    `/api/v1/knowledge-base/${knowledgeBaseId}`
  );
