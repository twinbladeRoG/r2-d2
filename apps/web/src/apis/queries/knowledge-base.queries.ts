import { useMutation } from "@tanstack/react-query";
import { createKnowledgeBase } from "../requests/knowledge-base.requests";
import { notifications } from "@mantine/notifications";

export const useCreateKnowledgeBase = () =>
  useMutation({
    mutationFn: async (documentId: string) => {
      const res = await createKnowledgeBase(documentId);
      return res;
    },
    onError: (err) => {
      notifications.show({
        message: err.message,
        title: "Oops! Something went wrong.",
        color: "red"
      });
    }
  });
