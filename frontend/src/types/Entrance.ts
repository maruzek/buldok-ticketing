import { EntranceStatus } from "./enums/EntranceStatus";
import { User } from "./User";

export type Entrance = {
  id: number;
  name: string;
  users: User[];
  status: EntranceStatus;
};
