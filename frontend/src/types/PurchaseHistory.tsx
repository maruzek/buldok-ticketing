import { Entrance } from "./Entrance";

export type PurchaseHistory = {
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
};
