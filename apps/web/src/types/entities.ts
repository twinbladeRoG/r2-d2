import type { IBaseEntity, ObjectValues } from "./common";
import { EXTRACTION_STATUS } from "./enums";

export interface IUser extends IBaseEntity {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export type ExtractionStatus = ObjectValues<typeof EXTRACTION_STATUS>;

export interface IFile extends IBaseEntity {
  filename: string;
  content_type: string;
  content_length: number;
  original_filename: string;
  owner_id: string;
  extraction_status: ExtractionStatus;
}

export interface IConversation extends IBaseEntity {
  user_id: string;
  title: string;
}

export interface IConversationWithMessages extends IConversation {
  chat_messages: Array<IChatMessage>;
}

export interface IChatMessage extends IBaseEntity {
  message: string;
  role: "user" | "bot";
  conversation_id: string;
}

export interface ICitation {
  point_id: number;
  score: number;
  document: IFile;
  page_number: number;
  chuck: string;
}

export interface IChatMessageWithCitations {
  chat_message: IChatMessage;
  citations?: Array<ICitation> | null;
}

export interface ICpuUsage {
  cpu_count: number;
  total_memory: number;
  cpu_utilization: Array<[string, number]>;
  available_memory: Array<[string, number]>;
  used_memory: Array<[string, number]>;
  free_memory: Array<[string, number]>;
  memory_percentage: Array<[string, number]>;
}

export interface IGpuUsage {
  index: number;
  uuid: string;
  name: string;
  memory_total: number;
  utilization: Array<[string, number]>;
  memory_used: Array<[string, number]>;
  memory_free: Array<[string, number]>;
  memory_available: Array<[string, number]>;
  temperature: Array<[string, number]>;
}

export interface IUsageLog extends IBaseEntity {
  document_id: string;
  usage_log: {
    cpu_usage: ICpuUsage;
    gpu_usage: Array<IGpuUsage>;
  };
}

export interface IExtractedSection extends IBaseEntity {
  type: "text" | "table" | "figure";
  page_number: number;
  content: string;
  document_id: string;
}

export interface IAgentWorkflowEdge {
  source: string;
  target: string;
}

export interface IAgentWorkflowSchemaNode {
  id: string;
  type: "schema";
  data: string;
}

export interface IAgentWorkflowRunnableNode {
  id: string;
  type: "runnable";
  data: {
    id: string[];
    name: string;
  };
}

export type IAgentWorkflowNode =
  | IAgentWorkflowSchemaNode
  | IAgentWorkflowRunnableNode;

export interface IAgentWorkflow {
  mermaid: string;
  state: {
    nodes: Array<IAgentWorkflowNode>;
    edges: Array<IAgentWorkflowEdge>;
  };
}

export interface IKnowledgeBase extends IBaseEntity {
  name: string;
  vector_store_name: string;
}

export interface ICreateKnowledgeBaseRequest {
  name: string;
  documents: string[];
}

export interface IKnowledgeBaseWithDocuments extends IKnowledgeBase {
  documents: Array<IFile>;
}
