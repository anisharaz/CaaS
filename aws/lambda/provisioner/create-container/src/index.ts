import { SQSEvent } from "aws-lambda";
import axios from "axios";
import * as https from "https";
export const handler = async (event: SQSEvent) => {
  // const body: {} = JSON.parse(event.Records[0].body);
  // console.log(body);
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

  const res = await axiosInstance.get("/networks");
  console.log(res.data);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Files deleted successfully",
    }),
  };
};
