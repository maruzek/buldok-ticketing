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
} from "recharts";
import ContentBoard from "./ContentBoard";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
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
import { Settings2 } from "lucide-react";
import { Link } from "react-router";
import { useEffect, useState } from "react";
import { LastMatchResponse } from "@/types/LastMatchResponse";
import useApi from "../../hooks/useApi";
import Spinner from "../Spinner";

const chartDataPie = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
  { browser: "firefox", visitors: 187, fill: "var(--color-firefox)" },
  { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
  { browser: "other", visitors: 90, fill: "var(--color-other)" },
];
const chartConfigPie = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "var(--chart-1)",
  },
  safari: {
    label: "Safari",
    color: "var(--chart-2)",
  },
  firefox: {
    label: "Firefox",
    color: "var(--chart-3)",
  },
  edge: {
    label: "Edge",
    color: "var(--chart-4)",
  },
  other: {
    label: "Other",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

const chartDataTime = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
];
const chartConfigTime = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

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

const MatchDashboard = () => {
  const [match, setMatch] = useState<LastMatchResponse | null>(null);
  const [uniqueEntranceNames, setUniqueEntranceNames] = useState<string[]>([]);
  const [numOfFullTickets, setNumOfFullTickets] = useState<number>(0);
  const [numOfHalfTickets, setNumOfHalfTickets] = useState<number>(0);
  const [ticketsPerEntrance, setTicketsPerEntrance] = useState<
    { entranceName: string; count: number }[]
  >([]);
  const { fetchData, isLoading } = useApi();
  useEffect(() => {
    const fetchLatestMatch = async () => {
      try {
        const response = await fetchData<LastMatchResponse | null>(
          "/admin/matches/last-active-match",
          {
            method: "GET",
          }
        );
        if (response) {
          setMatch(response);
          console.log(response);
        }
      } catch (error) {
        console.error("Error fetching latest match:", error);
      }
    };
    fetchLatestMatch();
  }, [fetchData]);

  useEffect(() => {
    if (match?.purchases) {
      const allPurchaseEntranceNames = match.purchases
        .map((purchase) => purchase.entrance?.name)
        .filter(
          (name): name is string =>
            typeof name === "string" && name.trim() !== ""
        );
      const uniqueNames = Array.from(new Set(allPurchaseEntranceNames));
      setUniqueEntranceNames(uniqueNames);

      const fullTickets = match.purchases.reduce(
        (acc, purchase) =>
          acc +
          purchase.purchaseItems.reduce(
            (itemAcc, item) =>
              item.ticket_type.name === "fullTicket"
                ? itemAcc + Number(item.quantity)
                : itemAcc,
            0
          ),
        0
      );
      setNumOfFullTickets(fullTickets);

      const halfTickets = match.purchases.reduce(
        (acc, purchase) =>
          acc +
          purchase.purchaseItems.reduce(
            (itemAcc, item) =>
              item.ticket_type.name === "halfTicket"
                ? itemAcc + Number(item.quantity)
                : itemAcc,
            0
          ),
        0
      );
      setNumOfHalfTickets(halfTickets);
    } else {
      setUniqueEntranceNames([]);
      setNumOfFullTickets(0);
      setNumOfHalfTickets(0);
    }
  }, [match]);

  useEffect(() => {
    if (match?.purchases && uniqueEntranceNames.length > 0) {
      const calculatedData = uniqueEntranceNames.map((name) => {
        const ticketsForThisEntrance = match.purchases
          .filter((purchase) => purchase.entrance?.name === name)
          .reduce((totalTicketsInEntrance, purchase) => {
            const ticketsInThisSpecificPurchase = purchase.purchaseItems.reduce(
              (itemSum, item) => itemSum + Number(item.quantity),
              0
            );
            return totalTicketsInEntrance + ticketsInThisSpecificPurchase;
          }, 0);
        return { entranceName: name, count: ticketsForThisEntrance };
      });
      setTicketsPerEntrance(calculatedData);
      console.log("calc data: ", calculatedData);
    } else {
      setTicketsPerEntrance([]);
    }
  }, [match, uniqueEntranceNames]);

  const totalEarnings = match?.purchases
    .reduce((acc, purchase) => {
      return (
        acc +
        Number(
          purchase.purchaseItems.reduce((acc, item) => {
            return acc + Number(item.price_at_purchase);
          }, 0)
        )
      );
    }, 0)
    .toLocaleString("cs-CZ");

  const fullTicketsEarnings = match?.purchases
    .reduce((acc, purchase) => {
      return (
        acc +
        Number(
          purchase.purchaseItems.reduce((acc, item) => {
            if (item.ticket_type.name == "fullTicket") {
              return acc + Number(item.price_at_purchase);
            }

            return acc;
          }, 0)
        )
      );
    }, 0)
    .toLocaleString("cs-CZ");

  const halfTicketsEarnings = match?.purchases
    .reduce((acc, purchase) => {
      return (
        acc +
        Number(
          purchase.purchaseItems.reduce((acc, item) => {
            if (item.ticket_type.name == "halfTicket") {
              return acc + Number(item.price_at_purchase);
            }

            return acc;
          }, 0)
        )
      );
    }, 0)
    .toLocaleString("cs-CZ");

  const DashboardHeader = (
    <div>
      <h2 className="text-2xl font-bold mb-1">
        Přehled zápasu proti {match?.rival}
      </h2>
      <p className="text-gray-600">
        {match?.played_at &&
          new Date(match?.played_at).toLocaleDateString("cs-CZ", {
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <Spinner />
      </div>
    );
  }
  // TODO: use skeleton loader
  return (
    <ContentBoard
      cardAction={
        <Link
          to={`/admin/matches/${match?.id}/edit`}
          className="cursor-pointer text-gray-600 hover:text-gray-900"
        >
          <Settings2 />
        </Link>
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
              {numOfFullTickets + numOfHalfTickets} ks
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Celkem plné</CardDescription>
            <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl">
              {numOfFullTickets} ks &bull; {fullTicketsEarnings} Kč
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Celkem poloviční</CardDescription>
            <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl">
              {numOfHalfTickets} ks &bull; {halfTicketsEarnings} Kč
            </CardTitle>
          </CardHeader>
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
                    plne: numOfFullTickets,
                    polovicni: numOfHalfTickets,
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
                              {(
                                numOfFullTickets + numOfHalfTickets
                              ).toLocaleString()}
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
                  data={ticketsPerEntrance}
                  dataKey="count"
                  label
                  nameKey="entranceName"
                  className="border-4 border-background"
                >
                  {ticketsPerEntrance.map((_, idx) => (
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
              config={chartConfigTime}
              className="max-h-[500px] w-full"
            >
              <AreaChart
                accessibilityLayer
                data={chartDataTime}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Area
                  dataKey="desktop"
                  type="natural"
                  fill="var(--color-desktop)"
                  fillOpacity={0.4}
                  stroke="var(--color-desktop)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="@container/card">
          <CardHeader>
            <CardTitle className="text-xl font-bold tabular-nums ">
              Přední brána
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="grid xl:grid-cols-3 gap-6 grid-cols-1">
              <div className="col-span-1">
                {/* Výdělek za kasu
                    celkem prodaných vstupenek
                    počet Plných
                    výdělek za plné
                    počet polovičních
                    výděletk za poloviční
                */}
                <p className="text-lg">Utrženo celkem</p>
                <p className="text-3xl font-semibold mb-5">1350 Kč</p>

                <p className="text-lg">Celkem prodáno lístků</p>
                <p className="text-2xl font-semibold mb-3">17 ks</p>

                <p className="text-lg">7 ks polovičních</p>
                <p className="text-2xl font-semibold mb-3">350 Kč</p>

                <p className="text-lg">10 ks plných</p>
                <p className="text-2xl font-semibold">1000 Kč</p>
              </div>
              <div className="col-span-2">
                <ChartContainer
                  config={chartConfig}
                  className="mx-auto w-full min-h-[200px]"
                >
                  <RadialBarChart
                    data={[
                      {
                        plne: numOfFullTickets,
                        polovicni: numOfHalfTickets,
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
                                  {(
                                    numOfFullTickets + numOfHalfTickets
                                  ).toLocaleString()}
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
              </div>
            </div>
            <h4 className="text-xl font-medium">Prodeje v průběhu času</h4>
            <div>
              <ChartContainer
                config={chartConfigTime}
                className="max-h-[500px] w-full"
              >
                <AreaChart
                  accessibilityLayer
                  data={chartDataTime}
                  margin={{
                    left: 12,
                    right: 12,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Area
                    dataKey="desktop"
                    type="natural"
                    fill="var(--color-desktop)"
                    fillOpacity={0.4}
                    stroke="var(--color-desktop)"
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Celkem prodáno lístků</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              6350 Kč
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    </ContentBoard>
  );
};

export default MatchDashboard;
