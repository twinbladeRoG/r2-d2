import { useMutation } from "@tanstack/react-query";
import { ILoginRequest } from "../../types";
import { login } from "../requests/auth.requests";

export const useLogin = () =>
  useMutation({
    mutationFn: async (data: ILoginRequest) => {
      const res = await login(data);
      return res;
    }
  });
