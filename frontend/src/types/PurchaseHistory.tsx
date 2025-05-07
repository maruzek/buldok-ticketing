import { Entrance } from "./Entrance";
import { Match } from "./Match";

export type PurchaseHistory = {
  id?: number;
  userId: number;
  entrance: Entrance;
  match: Match;
};
