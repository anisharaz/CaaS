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
  { month: "February", mobile: 200 },
  { month: "March", mobile: 120 },
  { month: "April", mobile: 190 },
  { month: "May", mobile: 130 },
  { month: "June", mobile: 140 },
  { month: "June", mobile: 140 },
  { month: "June", mobile: 140 },
  { month: "May", mobile: 130 },
  { month: "June", mobile: 140 },
  { month: "June", mobile: 140 },
  { month: "June", mobile: 140 },
  { month: "June", mobile: 140 },
  { month: "June", mobile: 140 },
  { month: "June", mobile: 140 },
  { month: "June", mobile: 140 },
  { month: "June", mobile: 140 },
  { month: "June", mobile: 140 },
  { month: "58:02", mobile: 140 },
  { month: "January", mobile: 100 },
  { month: "February", mobile: 200 },
  { month: "March", mobile: 120 },
  { month: "April", mobile: 190 },
  { month: "May", mobile: 130 },
  { month: "June", mobile: 140 },
  { month: "June", mobile: 140 },
  { month: "June", mobile: 140 },
  { month: "June", mobile: 140 },
  { month: "June", mobile: 140 },
  { month: "June", mobile: 140 },
  { month: "June", mobile: 140 },
];

const chartConfig = {
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function MemoryUsesChart() {
  return (
    <Card className="w-full md:w-1/3">
      <CardHeader>
        <CardTitle>RAM Used</CardTitle>
      </CardHeader>
      <CardContent className="">
        <ChartContainer config={chartConfig}>
          <AreaChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="mobile"
              type="natural"
              fill="var(--color-mobile)"
              fillOpacity={0.4}
              stroke="var(--color-mobile)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
