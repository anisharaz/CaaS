import * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

export function ConsoleOptions() {
  return (
    <div className="rounded-xl border-2 mb-4 lg:m-0">
      <div className="text-xl lg:text-2xl font-bold p-2 border-b-2">
        Services
      </div>
      <div className="p-4 text-md md:text-xl space-y-4">
        <Link href={"/console/account"} className="flex gap-4 items-center">
          <Image
            src={"https://static.aaraz.me/caas/profile_logo.png"}
            alt=""
            height={100}
            width={100}
            className="h-8 w-8"
          />
          <div className="text-blue-700 hover:text-blue-900 hover:underline underline-offset-2 cursor-pointer">
            Account
          </div>
        </Link>
        <Separator />
        <Link href={"/console/containers"} className="flex gap-4 items-center">
          <Image
            src={"https://static.aaraz.me/caas/container_logo.svg"}
            alt=""
            height={100}
            width={100}
            className="h-7 w-7"
          />
          <div className="text-blue-700 hover:text-blue-900 hover:underline underline-offset-2 cursor-pointer">
            My Containers
          </div>
        </Link>
        <Separator />
        <Link href={"/console/vpc"} className="flex gap-4 items-center">
          <Image
            src={"https://static.aaraz.me/caas/vpc_logo.svg"}
            alt=""
            height={100}
            width={100}
            className="h-8 w-8"
          />
          <div className="text-blue-700 hover:text-blue-900 hover:underline underline-offset-2 cursor-pointer">
            My VPCs
          </div>
        </Link>
        <Separator />
        {/* <Link href={"/console/metrics"} className="flex gap-4 items-center">
          <Image
            src={"https://static.aaraz.me/caas/metrics_logo.png"}
            alt=""
            height={100}
            width={100}
            className="h-8 w-8"
          />
          <div className="text-blue-700 hover:text-blue-900 hover:underline underline-offset-2 cursor-pointer">
            Metrics
          </div>
        </Link> */}
      </div>
    </div>
  );
}
const invoices = [
  {
    invoice: "INV001_INV001",
    totalAmount: "11.0.0.1",
  },
  {
    invoice: "INV001_INV001",
    totalAmount: "11.0.0.1",
  },
  {
    invoice: "INV001_INV001",
    totalAmount: "11.0.0.1",
  },
  {
    invoice: "INV001_INV001",
    totalAmount: "11.0.0.1",
  },
  {
    invoice: "INV001_INV001",
    totalAmount: "11.0.0.1",
  },
  {
    invoice: "INV001_INV001",
    totalAmount: "11.0.0.1",
  },
  {
    invoice: "INV001_INV001",
    totalAmount: "11.0.0.1",
  },
  {
    invoice: "INV001_INV001",
    totalAmount: "11.0.0.1",
  },
  {
    invoice: "INV001_INV001",
    totalAmount: "11.0.0.1",
  },
  {
    invoice: "INV001_INV001",
    totalAmount: "11.0.0.1",
  },
  {
    invoice: "INV001_INV001",
    totalAmount: "11.0.0.1",
  },
  {
    invoice: "INV001_INV001",
    totalAmount: "11.0.0.1",
  },
  {
    invoice: "INV001_INV001",
    totalAmount: "11.0.0.1",
  },
  {
    invoice: "INV001_INV001",
    totalAmount: "11.0.0.1",
  },
  {
    invoice: "INV001_INV001",
    totalAmount: "11.0.0.1",
  },
];

export function ConsoleContainers() {
  return (
    <div className="rounded-xl border-2">
      <div className="text-xl border-b-2 ">
        <div className="text-xl md:text-2xl font-bold p-2">Container</div>
        <div className="p-2 flex gap-2 items-center pb-4">
          <div>VPC</div>
          <Select defaultValue="default">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="dev">Dev</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="md:h-[600px] max-h-[300px] md:max-h-[600px] overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead className="">Internal IP</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.invoice}>
                <TableCell className="font-medium">{invoice.invoice}</TableCell>
                <TableCell className="">{invoice.totalAmount}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={"running"}>running</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-center border-t-2">
        <Link
          href={"/console/containers"}
          className="p-4 text-blue-600 hover:underline-offset-2 text-lg hover:underline"
        >
          Go to my Containers
        </Link>
      </div>
    </div>
  );
}
