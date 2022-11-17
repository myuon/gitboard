import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { IndexPage } from "./pages/IndexPage";
import { IndexLayout } from "./layouts/IndexLayout";
import { ImportPage } from "./pages/ImportPage";

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
        path: "/import",
        element: <ImportPage />,
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
