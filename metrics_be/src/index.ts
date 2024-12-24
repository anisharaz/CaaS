import { createServer } from "http";
import axios from "axios";
import fs from "fs";
import https from "https";

const httpsAgent = new https.Agent({
  cert: fs.readFileSync("/home/manish/docker-certs-local/cert.pem"),
  key: fs.readFileSync("/home/manish/docker-certs-local/key.pem"),
  ca: fs.readFileSync("/home/manish/docker-certs-local/ca.pem"),
});

const containerStatsEndpoint =
  "https://localhost:2376/containers/e499260944cf4ea9a1ee0339b981cc571210594b64f3c191e9d22a6995674915/stats";

const server = createServer(async (req, res) => {
  try {
    const incomingResponse = await axios({
      method: "GET",
      url: containerStatsEndpoint,
      responseType: "stream",
      httpsAgent,
    });
    console.log(incomingResponse);

    res.setHeader("Transfer-Encoding", "chunked");

    const incomingStream = incomingResponse.data;
    // readable.pipe(writable) - syntax
    incomingStream.pipe(res);

    incomingStream.on("error", (error: Error) => {
      console.log("Error with incomingresponse", error);
      res.writeHead(500);
      res.end("Failed to fetch data from endpoint");
    });

    req.on("close", () => {
      console.log("Client disconnected");
      incomingStream.destroy();
    });
  } catch (error: unknown) {
    console.error("Error in server", error);
    res.writeHead(500);
    res.end("Error in server");
  }
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
