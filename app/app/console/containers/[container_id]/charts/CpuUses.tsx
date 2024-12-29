"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Area, AreaChart, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// const chartConfig = {
//   mobile: {
//     label: "Mobile",
//     color: "hsl(var(--chart-4))",
//   },
// } satisfies ChartConfig;

type cpuUsesData = {
  CpuUsesPercent: number;
}[];

export function CpuUsesChart() {
  const { container_id } = useParams();
  const [cpuUses, setCpuUses] = useState<cpuUsesData>([]);
  useEffect(() => {
    const ws = new WebSocket(
      `http://localhost:4000/metrics/container/?container_id=${container_id}`
    );
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log(data);
        // endpoint returns null data initially
        const cpuUsage =
          data.cpu_usage_percentage === null ? 0 : data.cpu_usage_percentage;
        setCpuUses((prev) => {
          if (prev.length < 30) {
            return [
              ...prev,
              {
                CpuUsesPercent: cpuUsage,
              },
            ];
          } else {
            const array = prev.slice(1);
            array.push({ CpuUsesPercent: cpuUsage });
            return array;
          }
        });
        ws.onerror = (error) => {
          console.log("Websocket error:", error);
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
