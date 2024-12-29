import { Request } from "express";
import { WebSocket } from "ws";
import axios from "axios";
import https from "https";
import fs from "fs";
import { calculateStats } from "./utils/stats";

const httpsAgent = new https.Agent({
  ca: fs.readFileSync("/home/manish/docker-certs-local/ca.pem"),
  cert: fs.readFileSync("/home/manish/docker-certs-local/cert.pem"),
  key: fs.readFileSync("/home/manish/docker-certs-local/key.pem"),
});

export async function getMetrics(ws: WebSocket, req: Request) {
  console.log("New client connected!");
  const { container_id } = req.query;
  console.log(container_id);

  const endpoint = `https://localhost:2376/containers/${container_id}/stats`;

  const response = await axios({
    method: "GET",
    url: endpoint,
    responseType: "stream",
    httpsAgent,
  });
  if (!response) {
    throw new Error(`Failed to fetch data: ${response}`);
  }

  const incomingStream = response.data;

  for await (const chunk of incomingStream) {
    if (ws.readyState === ws.OPEN) {
      const data = calculateStats(chunk);
      ws.send(JSON.stringify(data));
    }
  }

  console.log("Data streaming finished.");

  ws.on("close", () => {
    console.log("Client disconnected.");
  });

  ws.on("error", (error: Error) => {
    console.error("WebSocket error:", error.message);
  });
}
