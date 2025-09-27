export type MatchInfo = {
  id: number;
  rival: string;
  description: string | null;
  playedAt: string;
  status: string;
};

export type SalesDataPoint = {
  time: string;
  sales: number;
};

export type EntranceStats = {
  name: string;
  totalEarnings: string;
  totalTickets: number;
  fullTicketsCount: number;
  fullTicketsEarnings: string;
  halfTicketsCount: number;
  halfTicketsEarnings: string;
  paymentMethods: {
    cash: string;
    qr: string;
  };
};

export type MatchDashboardStats = {
  match: MatchInfo;
  totalEarnings: string;
  totalTickets: number;
  fullTicketsCount: number;
  fullTicketsEarnings: string;
  halfTicketsCount: number;
  halfTicketsEarnings: string;
  salesOverTime: SalesDataPoint[];
  entrancesStats: EntranceStats[];
  paymentMethodStats: Array<{
    name: string;
    value: number;
  }>;
};
