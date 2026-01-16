import { z } from "zod"

export const inbound_rules_schema = z.object({
  domainName: z.string({ message: "invalid Domain" }),
  port: z.number({ message: "only number" }).max(65536)
})

export const add_vpc_schema = z.object({
  name: z.string({ message: "Minimum 3 character" }).min(3)
})

export const edit_vpc_schema = z.object({
  id: z.string({ message: "Minimum 3 character" }),
  name: z.string({ message: "Minimum 3 character" }).min(3)
})

export const container_create_schema = z.object({
  container_name: z.string({ message: "Minimum 3 character" }).min(3),
  vpc_id: z.string({ message: "VPC id required" }),
  ssh_key_id: z.string({ message: "Invalid SSH Key ID" })
})

export const add_inbound_rule_schema = z.object({
  rule_name: z.string({ message: "Minimum 3 character" }).min(3),
  domainName: z
    .string()
    .min(1, "Subdomain is required")
    .max(63, "Subdomain must be at most 63 characters")
    .regex(
      /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/,
      "Subdomain must contain only lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen"
    ),
  port: z.number({ message: "port ranges from 0 - 65536" }).max(65536)
})
