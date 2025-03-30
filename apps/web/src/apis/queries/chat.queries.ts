import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { IChatMessageRequest } from "../../types";
import {
  chat,
  deleteConversation,
  getConversation,
  getConversations
} from "../requests/chat.requests";
import { notifications } from "@mantine/notifications";

export const useChat = () => {
  return useMutation({
    mutationFn: async (payload: IChatMessageRequest) => {
      const res = await chat(payload);
      return res;
    }
  });
};

export const useConversation = (id?: string | null | undefined) =>
  useQuery({
    queryKey: ["conversation", id],
    queryFn: async () => {
      const res = await getConversation(String(id));
      return res;
    },
    enabled: !!id
  });

export const useConversations = (page: number, limit: number = 10) =>
  useQuery({
    queryKey: ["conversations", page, limit],
    queryFn: async () => {
      const res = await getConversations(page, limit);
      return res;
    },
    placeholderData: keepPreviousData,
    staleTime: 5000
  });

export const useDeleteConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteConversation(id);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (err) => {
      notifications.show({
        message: err.message,
        color: "red"
      });
    }
  });
};
