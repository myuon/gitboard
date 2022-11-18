import { GithubAuthProvider, signInWithPopup } from "firebase/auth";
import { getAuthToken } from "../api/auth";
import { auth } from "../api/firebase";

const provider = new GithubAuthProvider();

export const LoginPage = () => {
  return (
    <button
      onClick={async () => {
        const result = await signInWithPopup(auth, provider);
        const credential = GithubAuthProvider.credentialFromResult(result);
        if (credential?.accessToken) {
          const resp = await fetch("/api/user/token", {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${await getAuthToken()}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              token: credential.accessToken,
            }),
          });
          if (!resp.ok) {
            console.error("Failed to update token");
          }
        }
      }}
    >
      Login with GitHub
    </button>
  );
};
