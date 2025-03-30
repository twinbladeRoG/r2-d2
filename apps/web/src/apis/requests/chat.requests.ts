import {
  IChatMessage,
  IChatMessageRequest,
  IConversation,
  IConversationWithMessages
} from "../../types";
import http from "../http";

export const chat = (payload: IChatMessageRequest) =>
  http.post<IChatMessage>("/api/v1/chat/", payload);

export const getConversations = (page: number, limit: number) => {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });
  return http.get<IConversation[]>(`/api/v1/chat?${query}`);
};

export const getConversation = (id: string) =>
  http.get<IConversationWithMessages>(`/api/v1/chat/${id}`);

export const deleteConversation = (id: string) =>
  http.delete(`/api/v1/chat/${id}`);
