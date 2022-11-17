import { GithubAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../api/firebase";

const provider = new GithubAuthProvider();

export const LoginPage = () => {
  return (
    <button
      onClick={async () => {
        const result = await signInWithPopup(auth, provider);
        console.log(result);
        console.log(GithubAuthProvider.credentialFromResult(result));
      }}
    >
      Login with GitHub
    </button>
  );
};
