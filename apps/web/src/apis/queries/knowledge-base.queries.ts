import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createKnowledgeBase,
  createKnowledgeBaseFromDocument,
  deleteKnowledgeBase,
  getKnowledgeBase,
  getKnowledgeBases
} from "../requests/knowledge-base.requests";
import { notifications } from "@mantine/notifications";
import { ICreateKnowledgeBaseRequest } from "../../types";

export const useCreateKnowledgeBaseFromDocument = () =>
  useMutation({
    mutationFn: async (documentId: string) => {
      const res = await createKnowledgeBaseFromDocument(documentId);
      return res;
    },
    onError: (err) => {
      notifications.show({
        message: err?.message,
        title: "Oops! Something went wrong.",
        color: "red"
      });
    }
  });

export const useCreateKnowledgeBase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ICreateKnowledgeBaseRequest) => {
      const res = await createKnowledgeBase(payload);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-base"] });
    },
    onError: (err) => {
      notifications.show({
        message: err?.message,
        title: "Oops! Something went wrong.",
        color: "red"
      });
    }
  });
};

export const useKnowledgeBases = () =>
  useQuery({
    queryKey: ["knowledge-base"],
    queryFn: async () => {
      const res = await getKnowledgeBases();
      return res;
    }
  });

export const useDeleteKnowledgeBase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (knowledgeBaseId: string) => {
      const res = await deleteKnowledgeBase(knowledgeBaseId);
      return res;
    },
    onSuccess: (_, knowledgeBaseId) => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-base"] });
      queryClient.invalidateQueries({
        queryKey: ["knowledge-base", knowledgeBaseId]
      });
    },
    onError: (err) => {
      notifications.show({
        message: err?.message,
        title: "Oops! Something went wrong.",
        color: "red"
      });
    }
  });
};

export const useKnowledgeBase = (id: string) =>
  useQuery({
    queryKey: ["knowledge-base", id],
    queryFn: async () => {
      const res = await getKnowledgeBase(id);
      return res;
    },
    enabled: !!id
  });
