import { createServer } from "http";
import axios from "axios";
import fs from "fs";
import https from "https";
import { calculateStats } from "../utils/stats";
import express from "express";

const app = express();
const server = createServer(app);

const httpsAgent = new https.Agent({
  cert: fs.readFileSync("/home/manish/docker-certs-local/cert.pem"),
  key: fs.readFileSync("/home/manish/docker-certs-local/key.pem"),
  ca: fs.readFileSync("/home/manish/docker-certs-local/ca.pem"),
});

// real-time metrics of container
// /metrics/container/stats/?container_id=container_id

app.get("/metrics/container/stats/", async (req, res) => {
  try {
    const { container_id } = req.query;
    const incomingResponse = await axios({
      method: "GET",
      url: `https://localhost:2376/containers/${container_id}/stats`,
      responseType: "stream",
      httpsAgent,
    });
    // change later
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Transfer-Encoding", "chunked");

    const incomingStream = incomingResponse.data;

    incomingStream.on("data", (chunk: Buffer) => {
      const stats = calculateStats(chunk);
      res.write(JSON.stringify(stats));
    });
    incomingStream.on("end", () => {
      res.end();
    });
    incomingStream.on("error", (error: Error) => {
      console.log("Error with incoming Response:", error);
      res.status(500).send("Failed to fetch data");
    });

    req.on("close", () => {
      console.log("Client disconnected");
      incomingStream.destroy();
    });
  } catch (error) {
    console.error("Error in server:", error);
    res.status(500).send("Error in server");
  }
});

// info about status of container (running or stopped)
// /metrics/container/status/?container_id=container_id

app.get("/metrics/container/status", async (req, res) => {
  try {
    const { container_id } = req.query;
    const containerStatusResponse = await axios({
      method: "GET",
      url: `https://localhost:2376/containers/${container_id}/json`,
      httpsAgent,
    });
    res.status(200).json(containerStatusResponse.data.State);
  } catch (error) {
    console.error("Error in server:", error);
    res.status(500).send("Error in server");
  }
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
