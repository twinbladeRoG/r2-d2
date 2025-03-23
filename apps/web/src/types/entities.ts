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
