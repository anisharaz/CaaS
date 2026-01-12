import axios, { AxiosResponse } from "axios"
import * as https from "https"
import * as fs from "fs"
const baseUrl = process.env.INCUS_HOST + "/1.0"

// Create axios instance with SSL configuration
const axiosInstance = axios.create({
  baseURL: baseUrl,
  httpsAgent: new https.Agent({
    cert: fs.readFileSync("./lib/client.crt"),
    key: fs.readFileSync("./lib/client.key"),
    rejectUnauthorized: false // Equivalent to verify=False
  })
})

/**
 * Create a network with the given name.
 */
async function createNetwork(name: string): Promise<AxiosResponse> {
  const payload = {
    name: name,
    type: "bridge"
  }

  const resp = await axiosInstance.post("/networks", payload)
  return resp
}

/**
 * Create an Incus project with the given network.
 */
async function createProject(projectName: string): Promise<AxiosResponse> {
  const payload = {
    name: projectName
  }

  const resp = await axiosInstance.post("/projects", payload)
  return resp
}

/**
 * Update the default profile for a project with network configuration.
 */
async function setDefaultProfileNetworkAndVolume(
  projectName: string,
  networkName: string
): Promise<AxiosResponse> {
  const payload = {
    config: {},
    description: `Default Incus profile for project ${projectName}`,
    devices: {
      root: {
        path: "/",
        pool: "default",
        type: "disk"
      },
      eth0: {
        name: "eth0",
        network: networkName,
        type: "nic"
      }
    },
    name: "default",
    used_by: [],
    project: projectName
  }

  const resp = await axiosInstance.put(
    `/profiles/default?project=${projectName}`,
    payload
  )
  return resp
}

export { createNetwork, createProject, setDefaultProfileNetworkAndVolume }
