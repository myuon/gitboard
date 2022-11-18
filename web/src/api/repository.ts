import useSWR from "swr";
import { useAuthToken } from "./auth";
import { Repository } from "../../../shared/model/repository";

export const useRepository = () => {
  const { data: token } = useAuthToken();

  return useSWR<Repository[]>(
    token ? [token, "/api/repository"] : null,
    async () => {
      const resp = await fetch("/api/repository", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        method: "GET",
      });
      if (resp.ok) {
        return resp.json();
      }
    }
  );
};
