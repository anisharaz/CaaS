"use client";
import { Area, AreaChart, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useEffect, useState } from "react";

type ramUsesData = {
  RamUsedPercent: number;
}[];

export function MemoryUsesChart() {
  const [ramUses, setRamUses] = useState<ramUsesData>([]);

  useEffect(() => {
    (async function name() {
      // const data = axios.get("/api/cpu-uses");
    })().then(() => {
      console.log("Streaming Metrics");
    });
  }, []);

  return (
    <Card className="w-full md:w-1/3">
      <CardHeader>
        <CardTitle>RAM Used</CardTitle>
      </CardHeader>
      <CardContent className="">
        <ChartContainer
          config={
            {
              RamUsedPercent: {
                label: "RAM Used %",
                color: "hsl(var(--chart-2))",
              },
            } satisfies ChartConfig
          }
        >
          <AreaChart data={ramUses}>
            <CartesianGrid />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="RamUsedPercent"
              type="monotone"
              fill="var(--color-RamUsedPercent)"
              fillOpacity={0.3}
              stroke="var(--color-RamUsedPercent)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
