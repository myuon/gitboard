import { GithubAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../api/firebase";

const provider = new GithubAuthProvider();

export const LoginPage = () => {
  return (
    <button
      onClick={async () => {
        await signInWithPopup(auth, provider);
      }}
    >
      Login with GitHub
    </button>
  );
};
