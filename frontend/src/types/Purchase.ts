import { Entrance } from "./Entrance";
import { User } from "./User";

type PaymentDetails = {
  paid_at: string | null;
  amount: number | null;
  status: string | null;
  variableSymbol: string | null;
  bankAccountNumber: number | null;
  bankCode: number | null;
  paymentMessage: string | null;
  bankUserIdentification: string | null;
  bankPaymentType: string | null;
  bankPaymentCurrancy: string | null;
  bankMovementId: number | null;
  bankAccountName: string | null;
  bankName: string | null;
  bankInstructionId: number | null;
};

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
  payment: PaymentDetails | null;
};
