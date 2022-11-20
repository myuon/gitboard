import {
  browserLocalPersistence,
  getAuth,
  GithubAuthProvider,
  signInWithPopup,
} from "firebase/auth";

const provider = new GithubAuthProvider();

export const LoginPage = () => {
  return (
    <button
      onClick={async () => {
        const auth = getAuth();
        await auth.setPersistence(browserLocalPersistence);
        await signInWithPopup(auth, provider);
      }}
    >
      Login with GitHub
    </button>
  );
};
