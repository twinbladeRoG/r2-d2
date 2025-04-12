import { useQuery } from "@tanstack/react-query";
import { getAgentGraph } from "../requests/agent.requests";

export const useAgentWorkflow = () =>
  useQuery({
    queryKey: ["agent-workflow"],
    queryFn: async () => {
      const res = await getAgentGraph();
      return res;
    }
  });
