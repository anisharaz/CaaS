import { createServer } from "http";
import { WebSocketServer } from "ws";
import { docker } from "./lib/Docker";
const mainServer = createServer();
const wss = new WebSocketServer({ noServer: true });

wss.on("connection", async (ws, req) => {
  const CONTAINER_ID =
    "e499260944cf4ea9a1ee0339b981cc571210594b64f3c191e9d22a6995674915";
  const container = docker.getContainer(CONTAINER_ID);
  console.log("OPENED");
  const exec = await container.exec({
    Cmd: ["/bin/sh"],
    AttachStdin: true,
    AttachStdout: true,
    User: "root",
    Tty: true,
  });
  const stream = await exec.start({ stdin: true, hijack: true, Detach: false });
  stream.on("data", (data) => {
    ws.send(data.toString());
  });
  ws.on("message", (msg) => {
    stream.write(msg);
  });
  ws.on("close", async () => {
    let PID = "";
    let ps_output = "";
    const exec = await docker.getContainer(CONTAINER_ID).exec({
      Cmd: ["ps", "-e", "-o", "pid,comm"],
      AttachStdout: true,
      AttachStderr: true,
      User: "root",
    });
    const stream = await exec.start({ stdin: true });
    stream.on("data", (data) => {
      ps_output = data.toString();
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const lines = ps_output.split("\n");
    lines?.forEach((line) => {
      if (line.includes("sh")) {
        const parts = line.trim().split(/\s+/);
        PID = parts[0];
      }
    });
    if (PID) {
      const kill_exec = await docker.getContainer(CONTAINER_ID).exec({
        Cmd: ["kill", "-9", PID], // Send SIGKILL to the process
        AttachStdout: true,
        AttachStderr: true,
      });
      await kill_exec.start({ stdin: true });
    }
  });
});

mainServer.on("upgrade", function upgrade(request, socket, head) {
  socket.on("error", (err: any) => {
    console.error(err);
  });

  // CODE FOR AUTH CHECK
  // socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
  // socket.destroy();
  // return;

  socket.removeListener("error", (err: any) => {
    console.error(err);
  });
  wss.handleUpgrade(request, socket, head, function (ws) {
    wss.emit("connection", ws, request);
  });
});

mainServer.listen(5000, () => {
  console.log("Server is running on port 5000");
});
