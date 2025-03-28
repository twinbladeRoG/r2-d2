import { FileWithPath } from "@mantine/dropzone";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getUsersFiles,
  removeFile,
  uploadFile
} from "../requests/files-storage.requests";

export const useUploadFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File | FileWithPath) => {
      const res = await uploadFile(file);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-files"] });
    }
  });
};

export const useUserFiles = () =>
  useQuery({
    queryKey: ["user-files"],
    queryFn: async () => {
      const res = await getUsersFiles();
      return res;
    }
  });

export const useRemoveFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fileId: string) => {
      const res = await removeFile(fileId);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-files"] });
    }
  });
};
