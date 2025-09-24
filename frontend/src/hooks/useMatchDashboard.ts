import { useQuery } from "@tanstack/react-query";
import useApi from "@/hooks/useApi";
import { Match } from "@/types/Match";
import { ApiError } from "@/types/ApiError";

export type MatchDashboardData = {
  match: Match;
  uniqueEntranceNames: string[];
  numOfFullTickets: number;
  numOfHalfTickets: number;
  ticketsPerEntrance: { entranceName: string; count: number }[];
  totalEarnings: string;
  fullTicketsEarnings: string;
  halfTicketsEarnings: string;
};

export function useMatchDashboard(matchID: string) {
  const { fetchData } = useApi();

  const {
    data: match,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery<Match, ApiError>({
    queryKey: ["match", matchID],
    queryFn: () =>
      fetchData<Match>(`/matches/${matchID}/stats`, { method: "GET" }),
    enabled: !!matchID,
    retry: false,
  });

  if (isPending || isError || !match) {
    return {
      match: null,
      uniqueEntranceNames: [],
      numOfFullTickets: 0,
      numOfHalfTickets: 0,
      ticketsPerEntrance: [],
      totalEarnings: "0",
      fullTicketsEarnings: "0",
      halfTicketsEarnings: "0",
      isError,
      error,
      isPending,
    };
  }

  const purchases = match.purchases;

  if (!purchases || purchases.length === 0) {
    return {
      match: match,
      uniqueEntranceNames: [],
      numOfFullTickets: 0,
      numOfHalfTickets: 0,
      ticketsPerEntrance: [],
      totalEarnings: "0",
      fullTicketsEarnings: "0",
      halfTicketsEarnings: "0",

      isError,
      error,
      isPending,
    };
  }

  const allNames = purchases
    .map((p) => p.entrance?.name)
    .filter((n): n is string => !!n.trim());
  const uniqueEntranceNames = Array.from(new Set(allNames));

  const numOfFullTickets = purchases.reduce(
    (sum, p) =>
      sum +
      p.purchaseItems.reduce((si, it) => {
        return it.ticketType.name === "fullTicket"
          ? si + Number(it.quantity)
          : si;
      }, 0),
    0
  );
  const numOfHalfTickets = purchases.reduce(
    (sum, p) =>
      sum +
      p.purchaseItems.reduce(
        (si, it) =>
          it.ticketType.name === "halfTicket" ? si + Number(it.quantity) : si,
        0
      ),
    0
  );

  const ticketsPerEntrance = uniqueEntranceNames.map((name) => ({
    entranceName: name,
    count: purchases
      .filter((p) => p.entrance?.name === name)
      .reduce(
        (cnt, p) =>
          cnt + p.purchaseItems.reduce((si, it) => si + Number(it.quantity), 0),
        0
      ),
  }));

  const flatItems = purchases.flatMap((p) => p.purchaseItems);
  const totalEarnings = flatItems
    .reduce((sum, it) => sum + Number(it.priceAtPurchase), 0)
    .toLocaleString("cs-CZ");
  const fullTicketsEarnings = flatItems
    .filter((it) => it.ticketType.name === "fullTicket")
    .reduce((sum, it) => sum + Number(it.priceAtPurchase), 0)
    .toLocaleString("cs-CZ");
  const halfTicketsEarnings = flatItems
    .filter((it) => it.ticketType.name === "halfTicket")
    .reduce((sum, it) => sum + Number(it.priceAtPurchase), 0);

  return {
    match: match,
    uniqueEntranceNames,
    numOfFullTickets,
    numOfHalfTickets,
    ticketsPerEntrance,
    totalEarnings,
    fullTicketsEarnings,
    halfTicketsEarnings,
    refetch: refetch,
  };
}
