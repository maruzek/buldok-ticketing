import useApi from "../../hooks/useApi";
import Spinner from "../Spinner";
import { Match } from "@/types/Match";
import ContentBoard from "./ContentBoard";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ArrowRight, Dot } from "lucide-react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import BasicStatsCards from "./BasicStatsCards";
import { SeasonDashboardStats } from "@/types/SeasonDashboardStats";
import { ApiError } from "@/types/ApiError";
import MatchSalesChart from "./SeasonDashboard/MatchSalesChart";

// const PIE_COLORS = ["#7ccf01", "#FFBB28", "#A28DFF", "#FF82B3"];

const AdminBasicInfo = () => {
  const { fetchData } = useApi();

  const { data: latestMatch } = useQuery<Match | null>({
    queryKey: ["last-active-match"],
    queryFn: () =>
      fetchData<Match | null>("/admin/matches/last-active-match", {
        method: "GET",
      }),
  });

  const {
    data: seasonData,
    isPending,
    isError,
    error,
  } = useQuery<SeasonDashboardStats, ApiError>({
    queryKey: ["season"],
    queryFn: () =>
      fetchData<SeasonDashboardStats>(`/season/current`, {
        method: "GET",
      }),
    retry: false,
  });

  if (!seasonData || isPending) {
    return (
      <div className="flex justify-center h-40 w-full pt-10">
        <Spinner />
      </div>
    );
  }

  const {
    season,
    totalEarnings,
    totalTickets,
    fullTicketsCount,
    fullTicketsEarnings,
    halfTicketsCount,
    halfTicketsEarnings,
    // entrancesStats = [],
    // paymentMethodStats,
    // games,
    earningsPerGame,
  } = seasonData;

  return (
    <>
      <ContentBoard>
        {latestMatch && (
          <Link to={`/admin/matches/${latestMatch.id}/stats`}>
            <Card className="bg-green-100 m-0 py-0 pt-2 hover:bg-green-200 transition-colors cursor-pointer">
              <CardHeader className="py">
                <CardTitle className="text-md text-green-800 hover:text-green-900 p-0 m-0 hover:underline flex items-center gap-2">
                  <Dot className="inline mb-1 mr-2 animate-ping" size={30} />
                  <span>Právě se hraje zápas proti {latestMatch.rival}</span>
                  <ArrowRight />
                </CardTitle>
              </CardHeader>
            </Card>
          </Link>
        )}

        <h1 className="text-2xl font-bold">Statistiky sezóny {season.years}</h1>

        {season && !isPending && !isError && (
          <>
            <div>
              <Link to={`/admin/seasons/${season.id}/stats`}>
                <span className="flex items-center gap-1 hover:underline">
                  Zobrazit detailní statistiky sezóny <ArrowRight />
                </span>
              </Link>
            </div>

            <BasicStatsCards
              totalEarnings={totalEarnings}
              totalTickets={totalTickets}
              fullTicketsCount={fullTicketsCount}
              fullTicketsEarnings={fullTicketsEarnings}
              halfTicketsCount={halfTicketsCount}
              halfTicketsEarnings={halfTicketsEarnings}
            />

            <div className="w-full">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">
                    Vývoj prodeje vstupenek za jednotlivé zápasy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MatchSalesChart earningsPerGame={earningsPerGame} />
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </ContentBoard>
    </>
  );
};

export default AdminBasicInfo;
