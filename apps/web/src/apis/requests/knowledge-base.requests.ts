import {
  ICreateKnowledgeBaseRequest,
  IKnowledgeBase,
  IKnowledgeBaseWithDocuments
} from "../../types";
import http from "../http";

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

export const addDocumentToKnowledgeBase = (
  knowledgeBaseId: string,
  documents: string[]
) =>
  http.put<IKnowledgeBaseWithDocuments>(
    `/api/v1/knowledge-base/${knowledgeBaseId}/documents`,
    {
      document_ids: documents
    }
  );

export const removeDocumentFromKnowledgeBase = (
  knowledgeBaseId: string,
  documentId: string
) =>
  http.delete<IKnowledgeBaseWithDocuments>(
    `/api/v1/knowledge-base/${knowledgeBaseId}/documents/${documentId}`
  );
