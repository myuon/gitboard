import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { IndexPage } from "./pages/IndexPage";
import { IndexLayout } from "./layouts/IndexLayout";
import { ImportPage } from "./pages/ImportPage";
import { UserPage } from "./pages/UserPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <IndexLayout />,
    children: [
      {
        path: "/user/:name",
        element: <UserPage />,
      },
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
