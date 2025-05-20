import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Home from "./pages/home";
import Login from "./pages/login";
import RootLayout from "./modules/shared/RootLayout";
import NotFound from "./modules/shared/NotFound";
import Documents from "./pages/documents";
import ExtractionStatus from "./modules/documents/ExtractionStatus";
import AgentChatPage from "./pages/agent-chat";
import DocumentChat from "./pages/rag";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <div>Not Found</div>,
    children: [
      { index: true, element: <Home /> },
      {
        path: "agent",
        children: [
          { index: true, element: <AgentChatPage /> },
          { path: ":id", element: <AgentChatPage /> }
        ]
      },
      { path: "documents", element: <Documents /> },
      { path: "document-chat", element: <DocumentChat /> },
      {
        path: "extraction",
        children: [{ path: ":id", element: <ExtractionStatus /> }]
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
