import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Home from "./pages/home";
import Login from "./pages/login";
import RootLayout from "./modules/shared/RootLayout";
import NotFound from "./modules/shared/NotFound";
import Documents from "./pages/documents";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <div>Not Found</div>,
    children: [
      { index: true, element: <Home /> },
      { path: "documents", element: <Documents /> }
    ]
  },
  { path: "/login", element: <Login /> },
  { path: "*", element: <NotFound /> }
]);

const Router = () => {
  return <RouterProvider router={router} />;
};

export default Router;
