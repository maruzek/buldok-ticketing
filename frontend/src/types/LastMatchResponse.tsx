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
      priceAtPurchase: number;
      ticketType: {
        id: number;
        name: string;
      };
    }[];
  }[];
};
