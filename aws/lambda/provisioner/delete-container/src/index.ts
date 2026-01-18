import { SQSEvent } from "aws-lambda";
import { Client } from "pg";
import axios from "axios";
import * as https from "https";
import * as fs from "fs";
import {
  DeleteScheduleCommand,
  SchedulerClient,
} from "@aws-sdk/client-scheduler";
import Cloudflare from "cloudflare";

// Cloudflare client
const CfClient = new Cloudflare({
  apiToken: process.env.CLOUDFLARE_API_TOKEN,
});

// Caddy API configuration
const caddyApiBaseUrl = `https://${new URL(process.env.INCUS_HOST_BASE_URL as string).hostname}:2020`;
const caddyClientCrt = fs.readFileSync("/opt/client.crt", "utf-8");
const caddyClientKey = fs.readFileSync("/opt/client.key", "utf-8");

const caddyHttpsAgent = new https.Agent({
  cert: caddyClientCrt,
  key: caddyClientKey,
  rejectUnauthorized: false,
});

const caddyApiAxiosClient = axios.create({
  httpsAgent: caddyHttpsAgent,
});

async function deleteCaddyRoute(routeId: string) {
  const apiUrl = `${caddyApiBaseUrl}/id/${routeId}`;
  const response = await caddyApiAxiosClient.delete(apiUrl, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  console.log("Deleted Caddy route:", routeId);
  return response.data;
}

export const handler = async (event: SQSEvent) => {
  const body: {
    action: string;
    sshProxyAvailablePortsId: string;
    containerId: string;
    resourcesAndLimitsId: string;
    incusProjectId: string;
    fromAutoDeleteScheduler: boolean;
  } = JSON.parse(event.Records[0].body);
  console.log(body);

  const incusClientCrtBase64 = process.env.INCUS_CLIENT_CRT_BASE64;
  const incusClientKeyBase64 = process.env.INCUS_CLIENT_KEY_BASE64;

  // decode
  const incusClientCrt = Buffer.from(incusClientCrtBase64!, "base64").toString(
    "utf-8",
  );
  const incusClientKey = Buffer.from(incusClientKeyBase64!, "base64").toString(
    "utf-8",
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
    },
  );
  await axiosInstance.get(
    `/operations/${stopRes.data.metadata.id}/wait?timeout=60`,
  );
  const res = await axiosInstance.delete(
    `/instances/${body.containerId}?project=${body.incusProjectId}`,
  );

  if (res.data.status_code == 100) {
    // No need to delete if the command is from scheduler because schedular auto-delete itself
    if (!body.fromAutoDeleteScheduler) {
      const schedulerClient = new SchedulerClient({ region: "us-east-1" });
      const command = new DeleteScheduleCommand({
        Name: `ct-id-${body.containerId}`,
        GroupName: "default",
      });

      await schedulerClient.send(command);
    }

    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });

    await client.connect();

    await client.query(
      `UPDATE "SshProxyAvailablePorts" SET "used" = false WHERE "id" = $1`,
      [body.sshProxyAvailablePortsId],
    );

    await client.query(
      `UPDATE "ResourcesAndLimits" SET "container" = "container" - 1 WHERE "id" = $1`,
      [body.resourcesAndLimitsId],
    );

    // Delete all inbound rules associated with this container
    const inboundRulesResult = await client.query(
      `SELECT "id", "cloudflareRecordId" FROM "InboundRules" WHERE "containersId" = $1`,
      [body.containerId],
    );

    // Delete Caddy routes and Cloudflare DNS records for each inbound rule
    for (const rule of inboundRulesResult.rows) {
      try {
        await deleteCaddyRoute(rule.id);
      } catch (error) {
        console.error(
          `Failed to delete Caddy route for rule ${rule.id}:`,
          error,
        );
      }

      try {
        await CfClient.dns.records.delete(rule.cloudflareRecordId, {
          zone_id: process.env.CLOUDFLARE_ZONE_ID as string,
        });
        console.log("Deleted Cloudflare DNS record:", rule.cloudflareRecordId);
      } catch (error) {
        console.error(
          `Failed to delete Cloudflare DNS record ${rule.cloudflareRecordId}:`,
          error,
        );
      }
    }

    // Delete inbound rules from database
    await client.query(`DELETE FROM "InboundRules" WHERE "containersId" = $1`, [
      body.containerId,
    ]);

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
