import { z } from "zod";

export const inbound_rules_schema = z.object({
  config_name: z.string({ message: "Minimum 3 character" }).min(3),
  domain_name: z.string({ message: "invalid Domain" }),
  port: z.number({ message: "only number" }).max(65536),
});

export const vpc_schema = z.object({
  name: z.string({ message: "Minimum 3 character" }).min(3),
  cidr: z.string({ message: "invalid CIDR" }).cidr({
    version: "v4",
  }),
  gateway: z.string({ message: "invalid Gateway" }).ip({
    version: "v4",
  }),
});

export const container_create_schema = z.object({
  container_name: z.string({ message: "Minimum 3 character" }).min(3),
  vpc: z.string({ message: "Minimum 3 character" }),
});

export const add_inbound_rule_schema = z.object({
  rule_name: z.string({ message: "Minimum 3 character" }).min(3),
  domain_name: z
    .string()
    .min(3, { message: "domain is required" })
    .refine(
      async (username) => {
        const isAvailable = await checkDomainNameAvailability({ username });
        return isAvailable;
      },
      { message: "Domain Name is already taken" }
    ),
  port: z.number({ message: "port ranges from 0 - 65536" }).max(65536),
});

/// Validation Function//////
async function checkDomainNameAvailability({ username }: { username: string }) {
  try {
    // TODO: update to make api calls
    // const response = await fetch(`/api/check-username?username=${username}`);
    // const data = await response.json();
    // return data.available;
    // await new Promise((resolve) => setTimeout(resolve, 1000));
    if (username === "admin") return false;
    return true;
  } catch (error) {
    console.error("Error checking username:", error);
    return false; // Consider unavailable on error
  }
}
