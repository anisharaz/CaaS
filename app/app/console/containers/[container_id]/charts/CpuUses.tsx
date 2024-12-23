"use client";
import { Area, AreaChart, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
const chartData = [
  { month: "January", mobile: 100 },
  { month: "February", mobile: 10 },
  { month: "February", mobile: 15 },
];

const chartConfig = {
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

export function CpuUsesChart() {
  return (
    <Card className="w-full lg:w-1/3">
      <CardHeader>
        <CardTitle>CPU Used</CardTitle>
      </CardHeader>
      <CardContent className="">
        <ChartContainer config={chartConfig}>
          <AreaChart data={chartData} className="">
            <CartesianGrid />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="mobile"
              type="linear"
              fill="var(--color-mobile)"
              fillOpacity={0.4}
              stroke="var(--color-mobile)"
              stackId="a"
              vertOriginY={0}
              horizOriginX={0}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
