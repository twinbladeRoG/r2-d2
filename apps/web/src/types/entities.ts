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

export interface IUsageLog {
  cpu_usage: ICpuUsage;
  gpu_usage: Array<IGpuUsage>;
}
