import { Entrance } from "./Entrance";

// TODO: Omit description, status and purchases if not needed in the frontend

export type Match = {
  id: number;
  rival: string;
  description: string;
  playedAt: string;
  status: string;
  purchases: {
    id: number;
    purchasedAt: string;
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
