"use client";

import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, RotateCcw, Trash2, Terminal } from "lucide-react";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import InboundRulesRow from "./InboundRulesRow";

const configs = [
  {
    config_name: "one",
    domain_name: "www.hashtag.com",
    protocol: "http",
    container_ip: "12.13.14.5",
    port: 3000,
  },
  {
    config_name: "two",
    domain_name: "www.hashtag.com",
    protocol: "http",
    container_ip: "12.13.14.10",
    port: 8443,
  },
];

function ContainerDetailTabs() {
  return (
    <Tabs defaultValue="details">
      <TabsList>
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="network_rules">Network Rules</TabsTrigger>
      </TabsList>
      <TabsContent value="details" className="w-full space-y-4 px-2 pt-2">
        <div className="text-2xl font-bold">Actions</div>
        <div className="flex flex-wrap gap-y-8 gap-4 p-5 md:p-4 justify-between rounded-xl border-2 md:gap-14 md:px-4 lg:items-center md:w-[700px] bg-gray-100 text-black dark:bg-zinc-900 dark:text-white">
          <div className="flex gap-2 cursor-pointer group hover:text-green-600">
            <span>Start</span>
            <Play />
          </div>
          <div className="flex gap-2 cursor-pointer hover:text-amber-600">
            <span>Stop</span>
            <Pause />
          </div>
          <div className="flex gap-2 cursor-pointer hover:text-fuchsia-700">
            <span>Restart</span>
            <RotateCcw />
          </div>
          <div className="flex gap-2 cursor-pointer hover:text-red-500">
            <span>Delete</span>
            <Trash2 />
          </div>
          <Link
            href={""}
            className="flex gap-2 cursor-pointer hover:text-blue-500"
          >
            <span>Terminal</span>
            <Terminal />
          </Link>
        </div>
        <div className="text-2xl font-bold">Details</div>
        <div className="border-2 rounded-xl p-6 space-y-4">
          <div className=" text-lg text-gray-600 dark:text-white/80">
            <span className="font-bold">Id - </span>
            jskdfhsd-f7s89df7uref-bydsiufs7d8-9fsf8
          </div>
          <Separator />
          <div className="text-lg text-gray-600 dark:text-white/80">
            <span className="font-bold">Name - </span> daldia macleren
          </div>
          <Separator />
          <div className="text-lg text-gray-600 dark:text-white/80">
            <span className="font-bold">Host Node -</span> oracle_arm
          </div>
          <Separator />
          <div className="text-lg text-gray-600 dark:text-white/80">
            <span className="font-bold">Image -</span> aaraz/caas:1.1
          </div>
          <Separator />
          <div className="text-lg text-gray-600 dark:text-white/80">
            <span className="font-bold">Internal IP - </span> 11.0.0.1
          </div>
          <Separator />
          <div className="text-lg text-gray-600 dark:text-white/80">
            <span className="font-bold">Created -</span> 2027-20-55 12:02:12
          </div>
        </div>
      </TabsContent>
      <TabsContent value="network_rules" className="pl-2 space-y-4">
        <h1 className="text-2xl font-bold py-2">Inbound Rules</h1>
        <div className="max-h-[400px] max-w-[90vw] overflow-auto">
          <Table>
            <TableHeader className="dark:bg-zinc-800 bg-muted">
              <TableRow className="text-md font-extrabold">
                <TableHead>Config Name</TableHead>
                <TableHead>Domain Name</TableHead>
                <TableHead>Service Protocol</TableHead>
                <TableHead>Internal IP</TableHead>
                <TableHead>Container Port</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configs.map((config, index) => (
                <InboundRulesRow
                  key={index}
                  ConfigData={{
                    config_name: config.config_name,
                    domain_name: config.domain_name,
                    protocol: config.protocol,
                    container_ip: config.container_ip,
                    port: config.port,
                  }}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
    </Tabs>
  );
}

export default ContainerDetailTabs;
