// import { Entrance } from "./entities/Entrance";
// import { User } from "./User";

// type PaymentDetails = {
//   paymentID: number | null;
//   paid_at: string | null;
//   amount: number | null;
//   status: string | null;
//   variableSymbol: string | null;
//   bankAccountNumber: number | null;
//   bankCode: number | null;
//   paymentMessage: string | null;
//   bankUserIdentification: string | null;
//   bankPaymentType: string | null;
//   bankPaymentCurrancy: string | null;
//   bankMovementId: number | null;
//   bankAccountName: string | null;
//   bankName: string | null;
//   bankInstructionId: number | null;
// };

// export type Purchase = {
//   id: number;
//   purchasedAt: string;
//   paymentType: "cash" | "qr";
//   soldBy: Pick<User, "fullName">;
//   entrance: Pick<Entrance, "name">;
//   purchaseItems: {
//     quantity: number;
//     priceAtPurchase: number;
//     ticketType: {
//       name: string;
//     };
//   }[];
//   payment: PaymentDetails | null;
// };

import { Entrance } from "./Entrance";
import { User } from "./User";
import { PurchasePayment } from "./Payment";
import { PurchaseStatus } from "./enums/PurchaseStatus";

export interface PurchaseItem {
  id: number;
  quantity: number;
  priceAtPurchase: string;
  ticketType: {
    id: number;
    name: "fullTicket" | "halfTicket";
  };
}

/**
 * Full Purchase entity
 */
export interface Purchase {
  id: number;
  purchasedAt: string;
  paymentType: "cash" | "qr";
  status: PurchaseStatus;
  entrance: Entrance;
  purchaseItems: PurchaseItem[];
  payment: PurchasePayment | null;
  soldBy?: Pick<User, "id" | "fullName">;
}

/**
 * Purchase as displayed in admin dashboard table
 */
export interface PurchaseTableRow {
  id: number;
  purchasedAt: string;
  paymentType: "cash" | "qr";
  status: PurchaseStatus;
  entrance: Pick<Entrance, "name">;
  soldBy: Pick<User, "fullName">;
  purchaseItems: Pick<
    PurchaseItem,
    "quantity" | "priceAtPurchase" | "ticketType"
  >[];
  payment: Pick<PurchasePayment, "variableSymbol" | "status"> | null;
}
