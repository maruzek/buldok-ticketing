export type PurchaseHistory = {
  id?: number;
  purchased_at?: string;
  purchaseItems: {
    id: number;
    quantity: number;
    price_at_purchase: number;
    ticket_type: {
      id: number;
      name: string;
      price: number;
    };
  }[];
};
