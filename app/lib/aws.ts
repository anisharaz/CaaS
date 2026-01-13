import { LambdaClient } from "@aws-sdk/client-lambda"
import { SNSClient } from "@aws-sdk/client-sns"

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || ""
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || ""

export const lambdaClient = new LambdaClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
  }
})

export const snsClient = new SNSClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
  }
})
