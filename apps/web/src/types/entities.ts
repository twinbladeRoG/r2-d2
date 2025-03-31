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
