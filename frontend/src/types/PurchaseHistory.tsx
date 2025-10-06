import { Entrance } from "./Entrance";

export type PurchaseHistory = {
  id: number;
  purchasedAt: string;
  entrance: Entrance;
  paymentType: "cash" | "qr";
  purchaseItems: {
    id: number;
    quantity: number;
    priceAtPurchase: number;
    ticketType: {
      id: number;
      name: string;
    };
  }[];
  payment: {
    variableSymbol: string;
    status: string;
  } | null;
};
