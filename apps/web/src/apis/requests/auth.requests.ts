import { ILoginRequest, ILoginResponse } from "../../types";
import http from "../http";

export const login = async (data: ILoginRequest) => {
  const body = new URLSearchParams({
    username: data.username,
    password: data.password,
    grant_type: "password"
  });

  const headers = new Headers();
  headers.append("Content-Type", "application/x-www-form-urlencoded");

  return http.post<ILoginResponse>("/api/v1/authentication/user/login", body, {
    headers
  });
};
