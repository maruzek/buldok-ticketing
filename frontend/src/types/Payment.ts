import { PaymentStatus } from "./enums/PaymentStatus";

/**
 * Full Payment entity as returned by the API
 */
export interface Payment {
  id: number;
  variableSymbol: string;
  status: PaymentStatus;
  amount: number | null;
  createdAt: string;
  paidAt: string | null;
  bankAccountNumber: string | null;
  bankCode: string | null;
  bankUserIdentification: string | null;
  bankPaymentType: string | null;
  bankPaymentCurrency: string | null;
  bankMovementId: number | null;
  bankAccountName: string | null;
  bankName: string | null;
  bankInstructionId: number | null;
  paymentMessage: string | null;
}

/**
 * Response when creating a new QR payment
 */
export type PaymentCreateResponse = Pick<Payment, "id" | "variableSymbol">;

/**
 * Payment info embedded in Purchase responses
 * (Lighter version without bank details)
 */
export type PurchasePayment = Pick<
  Payment,
  "id" | "variableSymbol" | "status" | "amount" | "paidAt"
>;
