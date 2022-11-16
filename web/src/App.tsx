import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { IndexPage } from "./pages/IndexPage";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    index: true,
    element: <IndexPage />,
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
