import { FileWithPath } from "@mantine/dropzone";
import { IFile } from "../../types";
import http from "../http";

export const getUsersFiles = async () =>
  http.get<Array<IFile>>("/api/v1/file-storage");

export const uploadFile = (file: File | FileWithPath) => {
  const headers = new Headers();
  const formData = new FormData();
  formData.append("file", file);

  return http.post<IFile>("/api/v1/file-storage/", formData, { headers });
};

export const removeFile = (fileId: string) =>
  http.delete(`/api/v1/file-storage/${fileId}`);

export const getFile = (fileId: string) =>
  http.get<IFile>(`/api/v1/file-storage/${fileId}`);
