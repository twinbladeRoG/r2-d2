import { FileWithPath } from "@mantine/dropzone";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getFile,
  getUsersFiles,
  removeFile,
  uploadFile
} from "../requests/files-storage.requests";
import { IFileFilterQuery } from "../../types";

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

export const useUserFiles = (filter?: IFileFilterQuery) =>
  useQuery({
    queryKey: ["user-files", filter],
    queryFn: async () => {
      const res = await getUsersFiles(filter);
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

export const useFile = (fileId: string) =>
  useQuery({
    queryKey: ["file", fileId],
    queryFn: async () => {
      const res = await getFile(fileId);
      return res;
    }
  });
