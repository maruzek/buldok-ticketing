export type PaymentState = {
  status: "pending" | "paid" | "failed" | "canceled";
  message?: string;
};

export type PaymentStateMap = {
  [variableSymbol: string]: PaymentState;
};
