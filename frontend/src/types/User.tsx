import { Entrance } from "./Entrance";
import { UserStatus } from "./enums/UserStatus";

export type User = {
  id: number;
  email: string;
  fullName: string;
  roles: string[];
  entrance: Entrance | null;
  registeredAt: string;
  verified: boolean;
  status: UserStatus;
};
