import { IAgentWorkflow } from "../../types";
import http from "../http";

export const getAgentGraph = (agentName: string) =>
  http.get<IAgentWorkflow>(`/api/v1/agent/${agentName}/workflow`);

export const getAgentChatConversation = (
  agentName: string,
  conversationId: string
) => http.get(`/api/v1/agent/${agentName}/chat/${conversationId}`);
