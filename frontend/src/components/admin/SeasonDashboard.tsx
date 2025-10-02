import {
  Bar,
  BarChart,
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
import useApi from "@/hooks/useApi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/types/ApiError";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { SeasonDashboardStats } from "@/types/SeasonDashboardStats";
import { DataTable } from "./MatchTable/data-table";
import { columns } from "./SeasonMatchesTable/columns";

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

// const salesChartConfig = {
//   sales: {
//     label: "Prodané lístky",
//     color: "var(--chart-1)",
//   },
// } satisfies ChartConfig;

const earningsChartConfig = {
  fullTicketsEarnings: {
    label: "Plné",
    color: "var(--chart-1)",
  },
  halfTicketsEarnings: {
    label: "Poloviční",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

// TODO: Utrženo celkem
// TODO: Celkem prodáno lístků
// TODO: Celkem plné
// TODO: Celkem poloviční
// TODO: tabulka zápasů
// TODO: rozdělení typů vstupenek (plné, poloviční) - koláč
// TODO: rozdělení vstupů podle prodaných vstupenek - koláč
// TODO: ? graf průměrného času prodeje od začátku zápasu
// TODO: rozdělení plateb podle metod - koláč
// TODO: detail vstupů
// TODO: graf výdělků za každý zápas

const SeasonDashboard = () => {
  const { seasonID } = useParams<{ seasonID: string }>();
  const { fetchData } = useApi();
  const queryClient = useQueryClient();

  const {
    data: seasonData,
    isPending,
    isError,
    error,
  } = useQuery<SeasonDashboardStats, ApiError>({
    queryKey: ["season", seasonID, "dashboard"],
    queryFn: () =>
      fetchData<SeasonDashboardStats>(`/season/${seasonID}/dash-stats`, {
        method: "GET",
      }),
    enabled: !!seasonID,
    retry: false,
  });
  console.log(seasonData);

  //   type LocalizedSalesPoint = {
  //     time: string;
  //     sales: number;
  //   };

  //   const localizedSalesOverTime: LocalizedSalesPoint[] = useMemo(() => {
  //     const data = seasonData?.salesOverTime ?? [];
  //     return data.map((point): LocalizedSalesPoint => {
  //       const [hours, minutes] = point.time.split(":");
  //       const utcDate = new Date();
  //       utcDate.setUTCHours(Number(hours), Number(minutes), 0, 0);

  //       return {
  //         sales: point.sales,
  //         time: utcDate.toLocaleTimeString("cs-CZ", {
  //           hour: "2-digit",
  //           minute: "2-digit",
  //         }),
  //       };
  //     });
  //   }, [seasonData?.salesOverTime]);

  if (!seasonData) {
    return null;
  }

  const {
    season,
    totalEarnings,
    totalTickets,
    fullTicketsCount,
    fullTicketsEarnings,
    halfTicketsCount,
    halfTicketsEarnings,
    entrancesStats = [],
    paymentMethodStats,
    games,
    earningsPerGame,
  } = seasonData;
  console.log(entrancesStats);

  const DashboardHeader = (
    <div>
      <h2 className="text-2xl font-bold mb-1">
        Přehled sezóny {season?.years}
      </h2>
      {/* <p className="text-gray-600">
        {season?.startedAt &&
          new Date(season?.startedAt).toLocaleDateString("cs-CZ", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
      </p> */}
      <p className="text-gray-600">
        {season?.startAt &&
          new Date(season?.startAt).toLocaleDateString("cs-CZ", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}{" "}
        -{" "}
        {season?.endAt &&
          new Date(season?.endAt).toLocaleDateString("cs-CZ", {
            year: "numeric",
            month: "short",
            day: "numeric",
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
    return <p>{error.message}</p>;
    // return <MatchError error={error!} matchID={matchID!} />;
  }

  // TODO: use skeleton loader
  //TODO: pridat tabluku se vsemi nakupy uplne dolu
  return (
    <ContentBoard
      cardAction={
        <div className="flex items-center gap-4">
          <RefreshCw
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["season", seasonID] });
              toast.success("Data znovu načtena");
            }}
            className={`cursor-pointer text-gray-600 hover:text-gray-900`}
            aria-label="Obnovit data"
          />
          <Link
            to={`/admin/seasons/${seasonID}/edit`}
            className="cursor-pointer text-gray-600 hover:text-gray-900"
          >
            <Settings2 />
          </Link>
        </div>
      }
      cardHeader={DashboardHeader}
    >
      {/* TODO: make Cards reusable */}
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
            <AccordionTrigger>Tabulka zápasů</AccordionTrigger>
            <AccordionContent>
              <DataTable columns={columns} data={games} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      <div className="w-full ">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold tabular-nums">
              Prodeje vstupenek v každém zápase
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={earningsChartConfig}
              className="w-full h-72"
            >
              <BarChart data={earningsPerGame} stackOffset="sign">
                <CartesianGrid vertical={false} />
                <XAxis dataKey="rival" tickLine={false} axisLine={false} />
                <YAxis
                  tickFormatter={(value) =>
                    `${Number(value).toLocaleString()} Kč`
                  }
                />
                {/* <ChartTooltip
                  content={<ChartTooltipContent indicator="dot" />}
                /> */}
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelClassName="font-bold"
                      className="w-[180px]"
                      formatter={(value, name, item, index) => {
                        const fullTicketsEarnings: number =
                          +item.payload.fullTicketsEarnings;
                        const halfTicketsEarnings: number =
                          +item.payload.halfTicketsEarnings;
                        const total: number =
                          fullTicketsEarnings + halfTicketsEarnings;
                        return (
                          <>
                            <div className="flex items-center gap-2">
                              <div
                                className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                                style={
                                  {
                                    backgroundColor: `var(--color-${name})`,
                                  } as React.CSSProperties
                                }
                              />
                              <span className="text-muted-foreground">
                                {earningsChartConfig[
                                  name as keyof typeof earningsChartConfig
                                ]?.label || name}
                              </span>
                              <div className="text-foreground ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums">
                                {Number(value).toLocaleString()}
                                <span className="text-muted-foreground font-normal ml-1">
                                  Kč
                                </span>
                              </div>
                            </div>
                            {/* Add total after the last item */}
                            {index === 1 && (
                              <div className="text-foreground mt-1.5 flex basis-full items-center border-t pt-1.5 text-xs font-medium">
                                Celkem
                                <div className="text-foreground ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums">
                                  {total.toLocaleString()}
                                  <span className="text-muted-foreground font-normal ml-1">
                                    Kč
                                  </span>
                                </div>
                              </div>
                            )}
                          </>
                        );
                      }}
                    />
                  }
                />
                <Bar
                  dataKey="fullTicketsEarnings"
                  stackId="a"
                  fill="var(--color-fullTicketsEarnings)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="halfTicketsEarnings"
                  stackId="a"
                  fill="var(--color-halfTicketsEarnings)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
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

export default SeasonDashboard;
