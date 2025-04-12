import { IAgentWorkflow } from "../../types";
import http from "../http";

export const getAgentGraph = () =>
  http.get<IAgentWorkflow>("/api/v1/agent/workflow");
