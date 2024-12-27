"use client";
import { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import { Loader2 } from "lucide-react";
import axios from "axios";

function ContainerStatusBadge({ container_name }: { container_name: string }) {
  const [status, setStatus] = useState("fetching");
  useEffect(() => {
    axios
      .get(`/metrics/container/${container_name}/status`)
      .then((res) => {
        setStatus(() => {
          return res.data.status === "running" ? "running" : "stopped";
        });
      })
      .catch(() => {
        console.log("Failed to fetch container status");
      });
  }, []);
  return status === "fetching" ? (
    <Loader2 className="animate-spin text-right" />
  ) : (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Badge variant={status as any}>stopped</Badge>
  );
}

export default ContainerStatusBadge;
