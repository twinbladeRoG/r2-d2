export interface ILoginRequest {
  username: string;
  password: string;
}

export interface ILoginResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
}

export interface IChatMessageRequest {
  message: string;
  role: string;
  conversation_id?: string | null | undefined;
}

export interface IDocumentChatMessageRequest extends IChatMessageRequest {
  document_id: string;
}
