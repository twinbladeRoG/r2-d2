import { useQuery } from "@tanstack/react-query";
import { getAgentGraph } from "../requests/agent.requests";

export const useAgentWorkflow = (agentName: string) =>
  useQuery({
    queryKey: ["agent-workflow", agentName],
    queryFn: async () => {
      const res = await getAgentGraph(agentName);
      return res;
    }
  });
