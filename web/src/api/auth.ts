import useSWR from "swr";
import { auth } from "./firebase";

export const getAuthToken = async () => {
  return await auth.currentUser?.getIdToken();
};

export const useAuthToken = () => {
  return useSWR("/token", async () => getAuthToken());
};

export const useTokenRefresher = () => {
  useSWR(
    "/token/refresher",
    async () => {
      await getAuthToken();
    },
    {
      refreshInterval: 1000 * 60 * 30,
    }
  );
};
