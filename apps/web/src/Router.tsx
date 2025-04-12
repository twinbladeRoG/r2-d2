import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Home from "./pages/home";
import Login from "./pages/login";
import RootLayout from "./modules/shared/RootLayout";
import NotFound from "./modules/shared/NotFound";
import Documents from "./pages/documents";
import Extraction from "./pages/extraction";
import ExtractionStatus from "./modules/knowledge-base/ExtractionStatus";
import AgentChatPage from "./pages/agent-chat";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <div>Not Found</div>,
    children: [
      { index: true, element: <Home /> },
      { path: "/agent", element: <AgentChatPage /> },
      { path: "documents", element: <Documents /> },
      {
        path: "extraction",
        children: [
          { index: true, element: <Extraction /> },
          { path: ":id", element: <ExtractionStatus /> }
        ]
      }
    ]
  },
  { path: "/login", element: <Login /> },
  { path: "*", element: <NotFound /> }
]);

const Router = () => {
  return <RouterProvider router={router} />;
};

export default Router;
