import { LambdaClient } from "@aws-sdk/client-lambda"

export const lambdaClient = new LambdaClient({
  region: "us-east-1"
  // TODO: Enable credentials for production use
  //   credentials: {
  //     accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
  //     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
  //   }
})
