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
import axios from "axios";

type cpuUsesData = {
  CpuUsesPercent: number;
}[];

export function CpuUsesChart() {
  const [cpuUses, setCpuUses] = useState<cpuUsesData>([]);

  useEffect(() => {
    (async function name() {
      // const data = axios.get("/api/cpu-uses");
    })().then(() => {
      console.log("Streaming Metrics");
    });
  }, []);

  return (
    <Card className="w-full lg:w-1/3">
      <CardHeader>
        <CardTitle>CPU Used</CardTitle>
      </CardHeader>
      <CardContent className="">
        <ChartContainer
          config={
            {
              CpuUsesPercent: {
                label: "CPU Used %",
                color: "hsl(var(--chart-4))",
              },
            } satisfies ChartConfig
          }
        >
          <AreaChart data={cpuUses} className="">
            <CartesianGrid />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="CpuUsesPercent"
              type="monotone"
              fill="var(--color-CpuUsesPercent)"
              fillOpacity={0.3}
              stroke="var(--color-CpuUsesPercent)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
