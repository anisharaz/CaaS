import axios from "axios"
import * as https from "https"
const caddyApiBaseUrl = `https://${new URL(process.env.NEXT_PUBLIC_INCUS_HOST as string).hostname}:2020`

const caddyClientCrtBase64 = process.env.CADDY_API_CLIENT_CRT_BASE64
const caddyClientKeyBase64 = process.env.CADDY_API_CLIENT_KEY_BASE64

// decode
const caddyClientCrt = Buffer.from(caddyClientCrtBase64!, "base64").toString(
  "utf-8"
)
const caddyClientKey = Buffer.from(caddyClientKeyBase64!, "base64").toString(
  "utf-8"
)

const httpsAgent = new https.Agent({
  cert: caddyClientCrt,
  key: caddyClientKey,
  rejectUnauthorized: false
})

const caddyApiAxiosClient = axios.create({
  httpsAgent: httpsAgent
})

export async function deleteRoute(routeId: string) {
  const apiUrl = `${caddyApiBaseUrl}/id/${routeId}`
  const response = await caddyApiAxiosClient.delete(apiUrl, {
    headers: {
      "Content-Type": "application/json"
    }
  })

  console.log("Current routes:", JSON.stringify(response.data, null, 2))
  return response.data
}

export async function addRoute({
  routeId,
  domainName,
  upstreamHost,
  upstreamPort
}: {
  routeId: string
  domainName: string
  upstreamHost: string
  upstreamPort: number
}) {
  const routes = await caddyApiAxiosClient.get(
    `${caddyApiBaseUrl}/config/apps/http/servers/main/routes`
  )

  const newRoute = {
    "@id": routeId,
    match: [
      {
        host: [domainName]
      }
    ],
    handle: [
      {
        handler: "reverse_proxy",
        upstreams: [{ dial: `${upstreamHost}:${upstreamPort}` }]
      }
    ],
    terminal: true
  }

  routes.data.splice(routes.data.length - 1, 0, newRoute)

  const response = await caddyApiAxiosClient.patch(
    `${caddyApiBaseUrl}/config/apps/http/servers/main/routes`,
    routes.data,
    {
      headers: { "Content-Type": "application/json" }
    }
  )
  return response.data
}
