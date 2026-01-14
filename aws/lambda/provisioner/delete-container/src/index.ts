import { SQSEvent } from "aws-lambda";
import { Client } from "pg";
import axios from "axios";
import * as https from "https";
export const handler = async (event: SQSEvent) => {
  const body: {
    action: string;
    sshProxyAvailablePortsId: string;
    containerId: string;
    resourcesAndLimitsId: string;
    incusProjectId: string;
  } = JSON.parse(event.Records[0].body);
  console.log(body);

  const incusClientCrtBase64 = process.env.INCUS_CLIENT_CRT_BASE64;
  const incusClientKeyBase64 = process.env.INCUS_CLIENT_KEY_BASE64;

  // decode
  const incusClientCrt = Buffer.from(incusClientCrtBase64!, "base64").toString(
    "utf-8"
  );
  const incusClientKey = Buffer.from(incusClientKeyBase64!, "base64").toString(
    "utf-8"
  );

  const baseUrl = process.env.INCUS_HOST_BASE_URL;
  const axiosInstance = axios.create({
    baseURL: baseUrl,
    httpsAgent: new https.Agent({
      cert: incusClientCrt,
      key: incusClientKey,
      rejectUnauthorized: false, // verify=False
    }),
  });

  const stopRes = await axiosInstance.put(
    `/instances/${body.containerId}/state?project=${body.incusProjectId}`,
    {
      action: "stop",
      force: true,
    }
  );
  await axiosInstance.get(
    `/operations/${stopRes.data.metadata.id}/wait?timeout=60`
  );
  const res = await axiosInstance.delete(
    `/instances/${body.containerId}?project=${body.incusProjectId}`
  );

  if (res.data.status_code == 100) {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });

    await client.connect();

    await client.query(
      `UPDATE "SshProxyAvailablePorts" SET "used" = false WHERE "id" = $1`,
      [body.sshProxyAvailablePortsId]
    );

    await client.query(
      `UPDATE "ResourcesAndLimits" SET "container" = "container" - 1 WHERE "id" = $1`,
      [body.resourcesAndLimitsId]
    );

    // TODO: delete the caddy config and cloudflare subdomain before this deletion
    // await client.query(`DELETE FROM "InboundRules" WHERE "containersId" = $1`, [
    //   body.containerId,
    // ]);

    await client.query(`DELETE FROM "containers" WHERE "id" = $1`, [
      body.containerId,
    ]);

    await client.end();
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Container deleted successfully",
    }),
  };
};
