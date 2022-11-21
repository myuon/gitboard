import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

export const useAuthGuard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    void (async () => {
      const token = await getAuthToken();
      if (!token) {
        navigate("/login");
      }
    })();
  }, [navigate]);
};
