import { SQSEvent } from "aws-lambda";
import axios from "axios";
import * as https from "https";
import { Client } from "pg";

function GetCloudInitConfig(sshkey: string) {
  return `
#cloud-config

package_update: true
package_upgrade: false

packages:
  - openssh-server

users:
  - name: ubuntu
    sudo: ALL=(ALL) NOPASSWD:ALL
    shell: /bin/bash
    ssh_authorized_keys:
      - ${sshkey.trim()}

runcmd:
  - systemctl enable ssh
  - systemctl start ssh
  - systemctl restart ssh
`;
}
export const handler = async (event: SQSEvent) => {
  const body: {
    action: string;
    container: {
      id: string;
      name: string;
      createdAt: Date;
      updatedAt: Date;
      UserDataId: string;
      state: string;
      ipAddress: string | null;
      vpcId: string;
      SshKeysId: string;
      SshPortId: string;
    };
    sshkey: string;
    project: string;
    sshport: number;
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

  const containerData = {
    config: {
      "cloud-init.user-data": GetCloudInitConfig(body.sshkey),
    },
    ephemeral: false,
    name: body.container.id,
    profiles: ["default"],
    source: {
      project: body.project,
      properties: {
        os: "Ubuntu",
        release: "questing",
        variant: "cloud",
      },
      type: "image",
    },
    start: true,
    stateful: false,
  };
  const res = await axiosInstance.post(
    `/instances?project=${body.project}`,
    containerData
  );
  console.log("create container: ", JSON.stringify(res.data, null, 2));

  let containerIp = "";

  for (let i = 0; i < 5; i++) {
    const res = await axiosInstance.get(
      `/instances/${body.container.id}/state`
    );

    if (res.data.metadata.status == "Running") {
      containerIp = res.data.metadata.network.eth0.addresses[0].address;
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  const deviceName = "ssh";
  const proxyPortBody = {
    devices: {
      [deviceName]: {
        type: "proxy",
        listen: `tcp:0.0.0.0:${body.sshport}`,
        connect: `tcp:${containerIp}:22`,
      },
    },
  };

  await axiosInstance
    .patch(`/1.0/instances/${body.container.id}`, proxyPortBody)
    .then((response) => {
      console.log("create proxy port: ", response.data);
    });

  // Update the database with IP address and status
  const pgClient = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await pgClient.connect();
    await pgClient.query(
      `UPDATE "containers" SET "ipAddress" = $1, "state" = $2, "updatedAt" = $3 WHERE "id" = $4`,
      [containerIp, "RUNNING", new Date(), body.container.id]
    );
    console.log("Database updated successfully");
  } catch (error) {
    console.error("Failed to update database:", error);
    throw error;
  } finally {
    await pgClient.end();
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "successfully",
    }),
  };
};
