import { Entrance } from "./Entrance";

export type User = {
  id: number;
  email: string;
  fullName: string;
  roles: string[];
  entrance: Entrance | null;
  registeredAt: string;
};
