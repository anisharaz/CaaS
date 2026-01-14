"use client"
import { useState, useEffect, useContext } from "react"
import { Area, AreaChart, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart"

export function CpuUsesChart() {
  const [cpuUses, setCpuUses] = useState<
    {
      CpuUsesPercent: number
    }[]
  >([])
  // useEffect(() => {
  //   setCpuUses((prev) => {
  //     if (prev.length < 30) {
  //       return [
  //         ...prev,
  //         {
  //           CpuUsesPercent: 0
  //         }
  //       ]
  //     } else {
  //       const array = prev.slice(1)
  //       array.push({ CpuUsesPercent: 0 })
  //       return array
  //     }
  //   })
  // }, [])

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
                color: "hsl(var(--chart-4))"
              }
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
  )
}
