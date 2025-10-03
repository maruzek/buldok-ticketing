import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";

type BasicStatsCardsProps = {
  totalEarnings: number;
  totalTickets: number;
  fullTicketsCount: number;
  fullTicketsEarnings: number;
  halfTicketsCount: number;
  halfTicketsEarnings: number;
};

const BasicStatsCards = ({
  totalEarnings,
  totalTickets,
  fullTicketsCount,
  fullTicketsEarnings,
  halfTicketsCount,
  halfTicketsEarnings,
}: BasicStatsCardsProps) => {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:grid-cols-2 xl:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Utrženo celkem</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl">
            {totalEarnings} Kč
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Celkem prodáno lístků</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl">
            {totalTickets} ks
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
    </div>
  );
};

export default BasicStatsCards;
