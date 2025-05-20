import { useMutation } from "@tanstack/react-query";
import { IDocumentChatMessageRequest } from "../../types";
import { documentChat } from "../requests/document-chat.requests";

export const useDocumentChat = () => {
  return useMutation({
    mutationFn: async (payload: IDocumentChatMessageRequest) => {
      const res = await documentChat(payload);
      return res;
    }
  });
};
