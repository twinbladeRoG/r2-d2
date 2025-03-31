import type { IBaseEntity } from "./common";

export interface IUser extends IBaseEntity {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface IFile extends IBaseEntity {
  filename: string;
  content_type: string;
  content_length: number;
  original_filename: string;
  owner_id: string;
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

export interface IExtractedItem {
  text: string;
  page_number: number;
  type: "table" | "figure" | "text";
}

export interface ICpuUsage {
  cpu_utilization: number;
  cpu_count: number;
  total_memory: number;
  available_memory: number;
  used_memory: number;
  free_memory: number;
  memory_percentage: number;
}

export interface IGpuUsage {
  index: number;
  name: string;
  utilization: number;
  memory_used: number;
  memory_total: number;
  memory_free: number;
  memory_available: number;
  temperature: number;
}

export interface IUsageLog {
  timestamp: string;
  cpu_usage: ICpuUsage;
  gpu_usage: Array<IGpuUsage>;
}
