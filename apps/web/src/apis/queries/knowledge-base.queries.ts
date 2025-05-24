import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addDocumentToKnowledgeBase,
  createKnowledgeBase,
  deleteKnowledgeBase,
  getKnowledgeBase,
  getKnowledgeBases,
  removeDocumentFromKnowledgeBase
} from "../requests/knowledge-base.requests";
import { notifications } from "@mantine/notifications";
import { ICreateKnowledgeBaseRequest } from "../../types";

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

export const useAddDocumentToKnowledgeBase = (knowledgeBaseId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documents: string[]) => {
      const res = await addDocumentToKnowledgeBase(knowledgeBaseId, documents);
      return res;
    },
    onSuccess: () => {
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

export const useRemoveDocumentFromKnowledgeBase = (knowledgeBaseId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentId: string) => {
      const res = await removeDocumentFromKnowledgeBase(
        knowledgeBaseId,
        documentId
      );
      return res;
    },
    onSuccess: () => {
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
