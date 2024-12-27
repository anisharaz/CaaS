import { createServer } from "http";
import { WebSocketServer } from "ws";
import { docker } from "./lib/Docker";
const mainServer = createServer();
const wss = new WebSocketServer({ noServer: true });

wss.on("connection", async (ws, req) => {
  const CONTAINER_ID = req.url?.split("=")[1];
  try {
    const container = docker.getContainer(CONTAINER_ID as string);
    const exec = await container.exec({
      Cmd: ["/bin/sh"],
      AttachStdin: true,
      AttachStdout: true,
      User: "root",
      Tty: true,
    });
    const stream = await exec.start({
      stdin: true,
      hijack: true,
      Detach: false,
    });
    stream.on("data", (data) => {
      ws.send(data.toString());
    });
    ws.on("message", (msg) => {
      stream.write(msg);
    });
    ws.on("close", async () => {
      stream.write("exit\n");
    });
  } catch (error) {
    console.log(error);
    ws.close();
  }
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
