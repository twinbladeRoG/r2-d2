import http from "../http";

export const createKnowledgeBase = (documentId: string) =>
  http.post<null>(`/api/v1/knowledge-base/${documentId}`);
