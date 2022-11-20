import useSWR from "swr";
import { auth } from "./firebase";

export const getAuthToken = async () => {
  if (auth.currentUser) {
    return auth.currentUser.getIdToken();
  } else {
    return await new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        unsubscribe();
        resolve(user?.getIdToken());
      });
    });
  }
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
