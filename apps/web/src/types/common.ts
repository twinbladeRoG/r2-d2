export interface IBaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export type ObjectValues<T> = T[keyof T];
