import { useParams, Navigate } from "react-router-dom";
import AgentChat from "../modules/agent-chat/AgentChat";

const AgentChatPage = () => {
  const { id } = useParams();

  if (!id) {
    return <Navigate to={"/agent/web_search_agent"} />;
  }

  return (
    <AgentChat
      agentName={id as string}
      className="h-[calc(100dvh-76px-16px)] overflow-hidden"
    />
  );
};

export default AgentChatPage;
