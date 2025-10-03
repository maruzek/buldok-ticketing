import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

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

type MatchSalesChartProps = {
  earningsPerGame: {
    rival: string;
    fullTicketsEarnings: number;
    halfTicketsEarnings: number;
  }[];
};

const MatchSalesChart = ({ earningsPerGame }: MatchSalesChartProps) => {
  return (
    <ChartContainer config={earningsChartConfig} className="w-full h-72">
      <BarChart data={earningsPerGame} stackOffset="sign">
        <CartesianGrid vertical={false} />
        <XAxis dataKey="rival" tickLine={false} axisLine={false} />
        <YAxis
          tickFormatter={(value) => `${Number(value).toLocaleString()} Kč`}
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
                const total: number = fullTicketsEarnings + halfTicketsEarnings;
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
  );
};

export default MatchSalesChart;
