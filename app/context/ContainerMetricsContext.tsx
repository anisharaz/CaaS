"use client"

import { createContext, useEffect, useState } from "react"

export const ContainerMetricsContext = createContext({
  cpuUsesPercentage: 0,
  ramUsesPercentage: 0
})

export function ContainerMetricsContextProvider({
  children,
  container_id
}: {
  children: React.ReactNode
  container_id: string
}) {
  const [metricsData, setMetricsData] = useState({
    cpuUsesPercentage: 0,
    ramUsesPercentage: 0
  })
  useEffect(() => {
    const ws = new WebSocket(
      `/ws/metrics/container/?container_id=${container_id}`
    )

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        const cpuUsage =
          data.cpu_usage_percentage === null ? 0 : data.cpu_usage_percentage
        const memoryUsage = data.memory_usage_percentage
        setMetricsData(() => {
          return {
            cpuUsesPercentage: cpuUsage,
            ramUsesPercentage: memoryUsage
          }
        })
        ws.onerror = (error) => {
          console.log("Websocket error:", error)
        }
        ws.onclose = () => {
          console.log("Websocket connection closed")
        }
      } catch (error) {
        console.error(error)
      }
    }

    return () => {
      ws.close()
    }
  }, [container_id])

  return (
    <ContainerMetricsContext.Provider value={metricsData}>
      {children}
    </ContainerMetricsContext.Provider>
  )
}
