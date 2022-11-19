import useSWR from "swr";
import { useAuthToken } from "./auth";
import { UserOwnerRelation } from "../../../shared/model/userOwnerRelation";

export const useOwnerRelation = () => {
  const { data: token } = useAuthToken();

  return useSWR<UserOwnerRelation[]>(
    token ? [token, "/api/userOwnerRelation"] : null,
    async () => {
      const resp = await fetch("/api/userOwnerRelation", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (resp.ok) {
        return resp.json();
      }
    }
  );
};
