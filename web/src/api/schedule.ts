import useSWR from "swr";
import { Schedule } from "../../../shared/model/schedule";
import { useAuthToken } from "./auth";

export const useSchedule = () => {
  const { data: token } = useAuthToken();

  return useSWR<Schedule>(
    token ? [token, "/api/schedule/last"] : null,
    async () => {
      const resp = await fetch("/api/schedule/last", {
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
