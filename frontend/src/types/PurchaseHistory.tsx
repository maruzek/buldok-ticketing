export type PurchaseHistory = {
  id?: number;
  purchased_at?: string;
  purchaseItems: {
    id: number;
    quantity: number;
    priceAtPurchase: number;
    ticketType: {
      id: number;
      name: string;
      price: number;
    };
  }[];
};
