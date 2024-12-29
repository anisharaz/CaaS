"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Area, AreaChart, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type ramUsesData = {
  RamUsedPercent: number;
}[];

export function MemoryUsesChart() {
  const { container_id } = useParams();
  const [ramUses, setRamUses] = useState<ramUsesData>([]);
  useEffect(() => {
    const ws = new WebSocket(
      `http://localhost:4000/metrics/container/?container_id=${container_id}`
    );

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log(data);

        const memoryUsage = data.memory_usage_percentage;
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
        ws.onerror = (error) => {
          console.log("Websocket error", error);
        };
        ws.onclose = () => {
          console.log("Websocket connection closed");
        };
        return () => {
          ws.close();
        };
      } catch (error) {
        console.error(error);
      }
    };
  }, [container_id]);

  return (
    <Card className="w-full ">
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
