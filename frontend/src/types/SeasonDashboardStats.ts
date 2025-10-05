import { Match } from "./Match";
import { Season } from "./Season";

export type EntranceStat = {
  name: string;
  totalTickets: number;
  totalEarnings: number;
  fullTicketsCount: number;
  fullTicketsEarnings: number;
  halfTicketsCount: number;
  halfTicketsEarnings: number;
};

export type PaymentMethodStat = {
  name: string;
  value: number;
};

export type EarningsPerGame = {
  rival: string;
  fullTicketsEarnings: number;
  halfTicketsEarnings: number;
};

export type GameStat = {
  rival: string | null;
  value: number | null;
};

export type SeasonDashboardStats = {
  season: Season;
  games: Match[];
  totalEarnings: number;
  totalTickets: number;
  fullTicketsCount: number;
  fullTicketsEarnings: number;
  halfTicketsCount: number;
  halfTicketsEarnings: number;
  entrancesStats: EntranceStat[];
  paymentMethodStats: PaymentMethodStat[];
  earningsPerGame: EarningsPerGame[];

  numberOfGames: number;
  averageAttendance: number;
  averageEarningsPerGame: number;
  highestEarningsGame: GameStat;
  lowestEarningsGame: GameStat;
  mostAttendedGame: GameStat;
  leastAttendedGame: GameStat;
};
