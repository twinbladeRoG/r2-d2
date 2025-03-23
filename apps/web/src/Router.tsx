import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Home from "./pages/home";
import Login from "./pages/login";
import RootLayout from "./modules/shared/RootLayout";
import NotFound from "./modules/shared/NotFound";
import KnowledgeBase from "./pages/knowledge-base";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <div>Not Found</div>,
    children: [
      { index: true, element: <Home /> },
      { path: "knowledge-base", element: <KnowledgeBase /> }
    ]
  },
  { path: "/login", element: <Login /> },
  { path: "*", element: <NotFound /> }
]);

const Router = () => {
  return <RouterProvider router={router} />;
};

export default Router;
