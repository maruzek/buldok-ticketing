import { GameStat } from "@/types/SeasonDashboardStats";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import MatchTrend from "./MatchTrend";

type BasicStatsCardsProps = {
  totalEarnings: number;
  totalTickets: number;
  fullTicketsCount: number;
  fullTicketsEarnings: number;
  halfTicketsCount: number;
  halfTicketsEarnings: number;

  numberOfGames?: number;
  averageAttendance?: number;
  averageEarningsPerGame?: number;
  highestEarningsGame?: GameStat;
  lowestEarningsGame?: GameStat;
  mostAttendedGame?: GameStat;
  leastAttendedGame?: GameStat;

  seasonEarningsPerGame?: number;
  seasonAverageAttendance?: number;
};

const BasicStatsCards = ({
  totalEarnings,
  totalTickets,
  fullTicketsCount,
  fullTicketsEarnings,
  halfTicketsCount,
  halfTicketsEarnings,
  numberOfGames,
  averageAttendance,
  averageEarningsPerGame,
  highestEarningsGame,
  lowestEarningsGame,
  mostAttendedGame,
  leastAttendedGame,
  seasonEarningsPerGame,
  seasonAverageAttendance,
}: BasicStatsCardsProps) => {
  const formatRival = (rival: string | null) => (rival ? `(${rival})` : "");

  if ((numberOfGames ?? 0) === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="">Prozatím nejsou k dispozici žádná data</p>
      </div>
    );
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:grid-cols-2 xl:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Utrženo celkem</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl flex gap-2">
            {totalEarnings} Kč
            <MatchTrend
              seasonStat={seasonEarningsPerGame ?? 0}
              matchStat={totalEarnings}
            />
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Celkem prodáno lístků</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl flex gap-2">
            {totalTickets} ks
            <MatchTrend
              seasonStat={seasonAverageAttendance ?? 0}
              matchStat={totalTickets}
            />
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Celkem plné</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl">
            {fullTicketsCount} ks &bull; {fullTicketsEarnings} Kč
          </CardTitle>
        </CardHeader>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Celkem poloviční</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl">
            {halfTicketsCount} ks &bull; {halfTicketsEarnings} Kč
          </CardTitle>
        </CardHeader>
      </Card>

      {numberOfGames && (
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Počet zápasů</CardDescription>
            <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl">
              {numberOfGames}
            </CardTitle>
          </CardHeader>
        </Card>
      )}
      {averageAttendance && (
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Průměrná návštěvnost</CardDescription>
            <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl">
              {Math.round(averageAttendance)} osob
            </CardTitle>
          </CardHeader>
        </Card>
      )}
      {averageEarningsPerGame && (
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Průměrné tržby na zápas</CardDescription>
            <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl">
              {Math.round(averageEarningsPerGame).toLocaleString("cs-CZ")} Kč
            </CardTitle>
          </CardHeader>
        </Card>
      )}
      {mostAttendedGame && (
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>
              Nejnavštěvovanější zápas {formatRival(mostAttendedGame.rival)}
            </CardDescription>
            <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl">
              {mostAttendedGame.value} osob
            </CardTitle>
          </CardHeader>
        </Card>
      )}
      {leastAttendedGame && (
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>
              Nejméně navštěvovaný zápas {formatRival(leastAttendedGame.rival)}
            </CardDescription>
            <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl">
              {leastAttendedGame.value} osob
            </CardTitle>
          </CardHeader>
        </Card>
      )}
      {highestEarningsGame && (
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>
              Nejvyšší tržby ze zápasu {formatRival(highestEarningsGame.rival)}
            </CardDescription>
            <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl">
              {highestEarningsGame.value?.toLocaleString("cs-CZ")} Kč
            </CardTitle>
          </CardHeader>
        </Card>
      )}
      {lowestEarningsGame && (
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>
              Nejnižší tržby ze zápasu {formatRival(lowestEarningsGame.rival)}
            </CardDescription>
            <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl">
              {lowestEarningsGame.value?.toLocaleString("cs-CZ")} Kč
            </CardTitle>
          </CardHeader>
        </Card>
      )}
    </div>
  );
};

export default BasicStatsCards;
