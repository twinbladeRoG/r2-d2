import { useMutation, useQuery } from "@tanstack/react-query";
import { ILoginRequest } from "../../types";
import { getActiveUser, login } from "../requests/auth.requests";

export const useLogin = () =>
  useMutation({
    mutationFn: async (data: ILoginRequest) => {
      const res = await login(data);
      return res;
    }
  });

export const useActiveUser = () =>
  useQuery({
    queryKey: ["active-user"],
    queryFn: async () => {
      const res = await getActiveUser();
      return res;
    }
  });
