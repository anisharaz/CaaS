import Cloudflare from "cloudflare"

export const CfClient = new Cloudflare({
  apiToken: process.env.CLOUDFLARE_API_TOKEN!
})
