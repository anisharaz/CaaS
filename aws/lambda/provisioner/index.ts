import { SQSEvent } from "aws-lambda";
export const handler = async (event: SQSEvent) => {
  console.log("Event: ", JSON.stringify(event, null, 2));
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Files deleted successfully",
    }),
  };
};

async function addTcpForward({
  adminUrl, // e.g. "https://caddy_host:2020"
  serverName, // e.g. "tcp_2222"
  listenPort, // e.g. 2222
  targetIp, // e.g. "10.22.0.12"
  targetPort, // e.g. 22
}: {
  adminUrl: string;
  serverName: string;
  listenPort: number;
  targetIp: string;
  targetPort: number;
}) {
  const payload = {
    [serverName]: {
      listen: [`:${listenPort}`],
      routes: [
        {
          handle: [
            {
              handler: "proxy",
              upstreams: [
                {
                  dial: [`${targetIp}:${targetPort}`],
                },
              ],
            },
          ],
        },
      ],
    },
  };

  const res = await fetch(`${adminUrl}/config/apps/layer4/servers`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Caddy API error: ${text}`);
  }

  return res.json();
}
