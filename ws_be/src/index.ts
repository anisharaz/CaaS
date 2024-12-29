import express, { Request, Response } from "express";
import expressWs from "express-ws";
import { getMetrics } from "./metrics";
import { attachTerminal } from "./terminal";

const server = express();
const wsServer = expressWs(server);

const app = wsServer.app;

app.get("/", (req: Request, res: Response) => {
  res.json({ msg: "Hello from server" });
});

app.ws("/metrics/container", (ws, req: Request) => {
  getMetrics(ws, req);
});

app.ws("/terminal/container", (ws, req: Request) => {
  attachTerminal(ws, req);
});

server.listen(4000, () => {
  console.log("Server is running on port 4000");
});
