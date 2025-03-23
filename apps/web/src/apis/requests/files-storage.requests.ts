import { FileWithPath } from "@mantine/dropzone";
import { IFile } from "../../types";
import http from "../http";

export const getUsersFiles = async () =>
  http.get<Array<IFile>>("/api/v1/file-storage");

export const uploadFile = (file: File | FileWithPath) => {
  const formData = new FormData();
  formData.append("file", file);

  return http.post<IFile>("/api/v1/file-storage", formData);
};
