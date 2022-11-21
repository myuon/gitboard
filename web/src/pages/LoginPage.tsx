import {
  browserLocalPersistence,
  getAuth,
  GithubAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

const provider = new GithubAuthProvider();

export const LoginPage = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={async () => {
        const auth = getAuth();
        await auth.setPersistence(browserLocalPersistence);
        await signInWithPopup(auth, provider);
        navigate("/");
      }}
    >
      Login with GitHub
    </button>
  );
};
