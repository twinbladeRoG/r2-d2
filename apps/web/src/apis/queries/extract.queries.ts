import { useMutation } from "@tanstack/react-query";
import { extractDocument } from "../requests/extract.requests";
import { notifications } from "@mantine/notifications";

export const useExtractDocument = () => {
  return useMutation({
    mutationFn: async (fileId: string) => {
      const res = await extractDocument(fileId);
      return res;
    },
    onError: (err) => {
      notifications.show({
        message: err.message,
        color: "red"
      });
    }
  });
};
