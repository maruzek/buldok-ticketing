import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Label,
  Pie,
  PieChart,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
} from "recharts";
import ContentBoard from "./ContentBoard";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { RefreshCw, Settings2 } from "lucide-react";
import { Link, useParams } from "react-router";
import Spinner from "../Spinner";
import { toast } from "sonner";
import MatchError from "../errors/MatchError";
import useApi from "@/hooks/useApi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/types/ApiError";
import { MatchDashboardStats } from "@/types/MatchDashboardStats";
import { useMemo } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { PurchaseTable } from "./PurchaseTable/PurchaseTable";

const chartConfig = {
  plne: {
    label: "Plné",
    color: "var(--chart-1)",
  },
  polovicni: {
    label: "Poloviční",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const salesChartConfig = {
  sales: {
    label: "Prodané lístky",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const MatchDashboard = () => {
  const { matchID } = useParams<{ matchID: string }>();
  const { fetchData } = useApi();
  const queryClient = useQueryClient();

  const {
    data: matchData,
    isPending,
    isError,
    error,
  } = useQuery<MatchDashboardStats, ApiError>({
    queryKey: ["match", matchID, "dashboard"],
    queryFn: () =>
      fetchData<MatchDashboardStats>(`/matches/${matchID}/dash-stats`, {
        method: "GET",
      }),
    enabled: !!matchID,
    retry: false,
  });
  console.log(matchData);

  type LocalizedSalesPoint = {
    time: string;
    sales: number;
  };

  const localizedSalesOverTime: LocalizedSalesPoint[] = useMemo(() => {
    const data = matchData?.salesOverTime ?? [];
    return data.map((point): LocalizedSalesPoint => {
      const [hours, minutes] = point.time.split(":");
      const utcDate = new Date();
      utcDate.setUTCHours(Number(hours), Number(minutes), 0, 0);

      return {
        sales: point.sales,
        time: utcDate.toLocaleTimeString("cs-CZ", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    });
  }, [matchData?.salesOverTime]);

  if (!matchData) {
    return null;
  }
  console.log(matchData);
  const {
    match,
    totalEarnings,
    totalTickets,
    fullTicketsCount,
    fullTicketsEarnings,
    halfTicketsCount,
    halfTicketsEarnings,
    entrancesStats = [],
    paymentMethodStats,
  } = matchData;

  const DashboardHeader = (
    <div>
      <h2 className="text-2xl font-bold mb-1">
        Přehled zápasu proti {match?.rival}
      </h2>
      <p className="text-gray-600">
        {match?.playedAt &&
          new Date(match?.playedAt).toLocaleDateString("cs-CZ", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
      </p>
    </div>
  );

  const pieColors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ];

  if (isPending) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return <MatchError error={error!} matchID={matchID!} />;
  }

  // TODO: use skeleton loader
  //TODO: pridat tabluku se vsemi nakupy uplne dolu
  return (
    <ContentBoard
      cardAction={
        <div className="flex items-center gap-4">
          <RefreshCw
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["match", matchID] });
              toast.success("Data znovu načtena");
            }}
            className={`cursor-pointer text-gray-600 hover:text-gray-900`}
            aria-label="Obnovit data"
          />
          <Link
            to={`/admin/matches/${match?.id}/edit`}
            className="cursor-pointer text-gray-600 hover:text-gray-900"
          >
            <Settings2 />
          </Link>
        </div>
      }
      cardHeader={DashboardHeader}
    >
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
      <div className="my-2 w-full">
        <Accordion
          type="single"
          collapsible
          className="px-4 bg-card border rounded-xl text-card-foreground shadow-sm"
        >
          <AccordionItem value="purchases">
            <AccordionTrigger>Tabulka nákupů a plateb</AccordionTrigger>
            <AccordionContent>
              <PurchaseTable matchID={matchID!} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      <div className="grid grid-cols-2 gap-4 max-[1410px]:grid-cols-1">
        <Card className="@container/card">
          <CardHeader>
            <CardTitle className="text-xl font-semibold tabular-nums">
              Rozdělení typů vstupenek
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square w-full min-h-[200px]"
            >
              <RadialBarChart
                data={[
                  {
                    month: "january",
                    plne: fullTicketsCount,
                    polovicni: halfTicketsCount,
                  },
                ]}
                endAngle={180}
                innerRadius="60%"
                outerRadius="100%"
              >
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) - 16}
                              className="fill-foreground text-2xl font-bold"
                            >
                              {totalTickets.toLocaleString()}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 4}
                              className="fill-muted-foreground"
                            >
                              Návštěvníků
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </PolarRadiusAxis>
                <RadialBar
                  dataKey="plne"
                  stackId="a"
                  cornerRadius={5}
                  fill="var(--color-plne)"
                  className="stroke-transparent stroke-2"
                />
                <RadialBar
                  dataKey="polovicni"
                  fill="var(--color-polovicni)"
                  stackId="a"
                  cornerRadius={5}
                  className="stroke-transparent stroke-2"
                />
              </RadialBarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="@container/card">
          <CardHeader>
            <CardTitle className="text-xl font-semibold tabular-nums ">
              Rozdělení vstupů podle prodaných vstupenek
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={chartConfig}
              className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[80%] w-full min-h-[200px]"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={entrancesStats}
                  dataKey="totalTickets"
                  label
                  nameKey="name"
                  className="border-4 border-background"
                >
                  {entrancesStats.map((_, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={pieColors[idx % pieColors.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-col gap-5">
        <Card className="@container/card">
          <CardHeader>
            <CardTitle className="text-xl font-semibold tabular-nums">
              Prodeje v průběhu času
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={salesChartConfig}
              className="max-h-[500px] w-full"
            >
              <AreaChart
                accessibilityLayer
                data={localizedSalesOverTime}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="time"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  interval={0}
                  padding={{ left: 20, right: 20 }}
                />
                <YAxis hide={true} padding={{ top: 20 }} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Area
                  dataKey="sales"
                  type="natural"
                  fill="var(--color-sales)"
                  stroke="var(--color-sales)"
                  fillOpacity={0.4}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <div className="grid grid-cols-2 gap-4 max-[1410px]:grid-cols-1">
          <Card className="@container/card">
            <CardHeader>
              <CardTitle className="text-xl font-semibold tabular-nums ">
                Rozdělení plateb podle metod
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={chartConfig}
                className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[80%] w-full min-h-[200px]"
              >
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={paymentMethodStats}
                    dataKey="value"
                    label
                    nameKey="name"
                    className="border-4 border-background"
                  >
                    {paymentMethodStats &&
                      paymentMethodStats.map((_, idx) => (
                        <Cell
                          key={`cell-${idx}`}
                          fill={pieColors[idx % pieColors.length]}
                        />
                      ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <div className="flex flex-col gap-4">
            {paymentMethodStats &&
              paymentMethodStats.map((method) => (
                <Card key={method.name}>
                  <CardHeader>
                    <CardDescription>{method.name}</CardDescription>
                    <CardTitle className="text-2xl font-bold tabular-nums ">
                      {method.value} Kč
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))}
          </div>
        </div>
        {entrancesStats.map((entrance) => (
          <Card key={entrance.name} className="@container/card">
            <CardHeader>
              <CardTitle className="text-xl font-bold tabular-nums ">
                {entrance.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="grid xl:grid-cols-3 gap-6 grid-cols-1">
                <div className="col-span-1">
                  <p className="text-lg">Utrženo celkem</p>
                  <p className="text-3xl font-semibold mb-5">
                    {entrance.totalEarnings} Kč
                  </p>

                  <p className="text-lg">Celkem prodáno lístků</p>
                  <p className="text-2xl font-semibold mb-3">
                    {entrance.totalTickets} ks
                  </p>

                  <p className="text-lg">
                    {entrance.halfTicketsCount} ks polovičních
                  </p>
                  <p className="text-2xl font-semibold mb-3">
                    {entrance.halfTicketsEarnings} Kč
                  </p>

                  <p className="text-lg">
                    {entrance.fullTicketsCount} ks plných
                  </p>
                  <p className="text-2xl font-semibold">
                    {entrance.fullTicketsEarnings} Kč
                  </p>
                </div>
                <div className="col-span-2">
                  <ChartContainer
                    config={chartConfig}
                    className="mx-auto w-full min-h-[200px]"
                  >
                    <RadialBarChart
                      data={[
                        {
                          plne: entrance.fullTicketsCount,
                          polovicni: entrance.halfTicketsCount,
                        },
                      ]}
                      endAngle={180}
                      innerRadius="60%"
                      outerRadius="100%"
                    >
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <PolarRadiusAxis
                        tick={false}
                        tickLine={false}
                        axisLine={false}
                      >
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  textAnchor="middle"
                                >
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) - 16}
                                    className="fill-foreground text-2xl font-bold"
                                  >
                                    {entrance.totalTickets.toLocaleString()}
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 4}
                                    className="fill-muted-foreground"
                                  >
                                    Vstupenek
                                  </tspan>
                                </text>
                              );
                            }
                          }}
                        />
                      </PolarRadiusAxis>
                      <RadialBar
                        dataKey="plne"
                        stackId="a"
                        cornerRadius={5}
                        fill="var(--color-plne)"
                        className="stroke-transparent stroke-2"
                      />
                      <RadialBar
                        dataKey="polovicni"
                        fill="var(--color-polovicni)"
                        stackId="a"
                        cornerRadius={5}
                        className="stroke-transparent stroke-2"
                      />
                    </RadialBarChart>
                  </ChartContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ContentBoard>
  );
};

export default MatchDashboard;
