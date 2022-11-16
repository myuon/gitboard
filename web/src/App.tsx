import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { IndexPage } from "./pages/IndexPage";
import { IndexLayout } from "./layouts/IndexLayout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <IndexLayout />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        index: true,
        element: <IndexPage />,
      },
    ],
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
