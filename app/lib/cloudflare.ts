import Cloudflare from "cloudflare"

export const CfClient = new Cloudflare({
  apiEmail: process.env.CLOUDFLARE_EMAIL,
  apiKey: process.env.CLOUDFLARE_API_KEY
})
