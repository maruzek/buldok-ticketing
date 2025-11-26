import { PaymentStatus } from "./enums/PaymentStatus";

export type PaymentState = {
  status: PaymentStatus;
  message?: string;
};

export type PaymentStateMap = {
  [variableSymbol: string]: PaymentState;
};
