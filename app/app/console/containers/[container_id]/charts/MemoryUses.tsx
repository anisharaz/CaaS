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
import { useParams } from "next/navigation";

type ramUsesData = {
  RamUsedPercent: number;
}[];

export function MemoryUsesChart() {
  const [ramUses, setRamUses] = useState<ramUsesData>([]);
  const { container_id } = useParams();
  useEffect(() => {
    const asyncFetch = async () => {
      const response = await fetch(
        `http://localhost:4000?container_id=${container_id}`
      );
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
              // console.log("Received data:", parsedData.memory_usage_percentage);

              const memoryUsage =
                parsedData.memory_usage_percentage === null
                  ? 0
                  : parsedData.memory_usage_percentage;

              setRamUses((prev) => {
                if (prev.length < 30) {
                  return [
                    ...prev,
                    {
                      RamUsedPercent: memoryUsage,
                    },
                  ];
                } else {
                  const array = prev.slice(1);
                  array.push({ RamUsedPercent: memoryUsage });
                  return array;
                }
              });
            } catch (error) {
              console.error("Failed to parse JSON chunk", error);
            }
          }
        }
        ({ done, value } = await reader.read());
      }
    };
    asyncFetch();
  }, [ramUses]);

  useEffect(() => {
    console.log("Updated memory usage data:", ramUses);
  }, [ramUses]);

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
