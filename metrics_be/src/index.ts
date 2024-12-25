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

const containerStatsEndpoint =
  "https://localhost:2376/containers/cb649cc6f112445402713748b5a/stats";

app.get("/", async (req, res) => {
  try {
    const incomingResponse = await axios({
      method: "GET",
      url: containerStatsEndpoint,
      responseType: "stream",
      httpsAgent,
    });

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

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
