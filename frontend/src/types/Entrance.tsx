import { User } from "./User";

export type Entrance = {
  id: number;
  name: string;
  // location?: string | null;
  users: User[];
  status: "opened" | "closed" | "removed";
};
