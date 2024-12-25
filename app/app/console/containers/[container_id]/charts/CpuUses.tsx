"use client";
import { useState, useEffect } from "react";
import { Area, AreaChart, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

type cpuUsesData = {
  CpuUsesPercent: number;
}[];

export function CpuUsesChart() {
  const [cpuUses, setCpuUses] = useState<cpuUsesData>([]);
  useEffect(() => {
    const asyncFetch = async () => {
      const response = await fetch("http://localhost:4000");
      if (!response.body) {
        console.error("No response body");
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let { done, value } = await reader.read();
      while (!done) {
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (line.trim()) {
            try {
              const parsedData = JSON.parse(line);
              // console.log("Received data:", parsedData.cpu_usage_percentage);
              const cpuUsage =
                parsedData.cpu_usage_percentage === null
                  ? 0
                  : parsedData.cpu_usage_percentage;
              setCpuUses((prev) => {
                if (prev.length < 30) {
                  return [
                    ...prev,
                    {
                      CpuUsesPercent: cpuUsage,
                    },
                  ];
                } else {
                  const res = prev.slice(1);
                  res.push({
                    CpuUsesPercent: cpuUsage,
                  });
                  return res;
                }
              });
              console.log(cpuUses);
            } catch (error) {
              console.error("Failed to parse JSON chunk", error);
            }
          }
        }
        ({ done, value } = await reader.read());
      }
    };
    asyncFetch();
  }, [cpuUses]);

  useEffect(() => {
    console.log("Updated CPU usage data:", cpuUses);
  }, [cpuUses]);

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
              animationDuration={0}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
