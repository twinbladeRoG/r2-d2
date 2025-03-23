import type { IBaseEntity } from "./common";

export interface IUser extends IBaseEntity {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}
