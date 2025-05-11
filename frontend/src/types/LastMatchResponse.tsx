import { Entrance } from "./Entrance";

export type LastMatchResponse = {
  id: number;
  rival: string;
  played_at: string;
  purchases: {
    id: number;
    purchased_at: string;
    entrance: Entrance;
    purchaseItems: {
      id: number;
      quantity: number;
      price_at_purchase: number;
      ticket_type: {
        id: number;
        name: string;
      };
    }[];
  }[];
};
