import { useQuery } from "@tanstack/react-query";
import useApi from "./useApi";
import { Match } from "../types/Match";

export function useMatch(matchID?: string) {
  const { fetchData } = useApi();
  return useQuery<Match>({
    queryKey: ["match", matchID],
    queryFn: () =>
      fetchData<Match>(`/matches/${matchID}/stats`, { method: "GET" }),
    enabled: !!matchID,
  });
}
