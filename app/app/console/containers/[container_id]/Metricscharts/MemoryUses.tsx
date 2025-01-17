"use client"
import { useContext, useEffect, useState } from "react"
import { Area, AreaChart, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart"
import { ContainerMetricsContext } from "@/context/ContainerMetricsContext"

export function MemoryUsesChart() {
  const MetrcsData = useContext(ContainerMetricsContext)
  const [ramUses, setRamUses] = useState<
    {
      RamUsedPercent: number
    }[]
  >([])
  useEffect(() => {
    setRamUses((prev) => {
      if (prev.length < 30) {
        return [
          ...prev,
          {
            RamUsedPercent: MetrcsData.ramUsesPercentage
          }
        ]
      } else {
        const array = prev.slice(1)
        array.push({ RamUsedPercent: MetrcsData.ramUsesPercentage })
        return array
      }
    })
  }, [MetrcsData])

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
                color: "hsl(var(--chart-2))"
              }
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
  )
}
