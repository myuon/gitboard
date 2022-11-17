import { auth, getAuthToken } from "../api/firebase";

export const IndexPage = () => {
  getAuthToken().then((token) => {
    console.log(token);
  });

  return <h1>Index /</h1>;
};
