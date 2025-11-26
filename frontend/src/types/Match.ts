import { Purchase } from "./Purchase";
import { Season } from "./Season";

// TODO: Omit description, status and purchases if not needed in the frontend

// export type Match = {
//   id: number;
//   rival: string;
//   description: string;
//   playedAt: string;
//   status: string;
//   purchases: PurchaseHistory[];
//   season: Season;
// };

export type Match = {
  id: number;
  rival: string;
  description: string;
  playedAt: string;
  status: string;
  purchases: Purchase[];
  season: Season;
};
