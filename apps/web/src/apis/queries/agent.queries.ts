import { useQuery } from "@tanstack/react-query";
import {
  getAgentChatConversation,
  getAgentGraph
} from "../requests/agent.requests";

export const useAgentWorkflow = (agentName: string) =>
  useQuery({
    queryKey: ["agent-workflow", agentName],
    queryFn: async () => {
      const res = await getAgentGraph(agentName);
      return res;
    },
    enabled: !!agentName
  });

export const useAgentChatConversation = (
  agentName: string,
  conversationId: string | null | undefined
) =>
  useQuery({
    queryKey: ["agent-chat-conversation", agentName, conversationId],
    queryFn: async () => {
      const res = await getAgentChatConversation(
        agentName,
        String(conversationId)
      );
      return res;
    },
    retry: false,
    enabled: !!conversationId && !!agentName
  });
