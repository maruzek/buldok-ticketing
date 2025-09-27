import { Entrance } from "./Entrance";
import { User } from "./User";

export type Purchase = {
  id: number;
  purchasedAt: string;
  paymentType: "cash" | "qr";
  soldBy: Pick<User, "fullName">;
  entrance: Pick<Entrance, "name">;
  purchaseItems: {
    quantity: number;
    priceAtPurchase: number;
    ticketType: {
      name: string;
    };
  }[];
};
