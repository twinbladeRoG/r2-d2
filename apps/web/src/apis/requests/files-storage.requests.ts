import { FileWithPath } from "@mantine/dropzone";
import { IFile, IFileFilterQuery } from "../../types";
import http from "../http";

export const getUsersFiles = async (filter?: IFileFilterQuery) => {
  const params = new URLSearchParams();
  if (filter?.search) params.append("search", filter.search);
  if (filter?.extraction_status)
    params.append("extraction_status", filter.extraction_status);
  if (filter?.exclude) {
    filter.exclude.forEach((item) => {
      params.append("exclude", item);
    });
  }
  if (filter?.file_types) {
    filter.file_types.forEach((item) => {
      params.append("file_types", item);
    });
  }

  return http.get<Array<IFile>>(`/api/v1/file-storage/?${params.toString()}`);
};

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
