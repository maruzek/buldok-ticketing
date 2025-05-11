import { User } from "./User";

export type Entrance = {
  id: string;
  name: string;
  location?: string | null;
  users: User[];
};
