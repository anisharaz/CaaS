"use client";

import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Terminal,
  Edit,
  Save,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

function ContainerDetailTabs() {
  const [isEditing, setIsEditing] = useState(false);

  const configs = [
    {
      config_name: "a name",
      domain_name: "www.hashtag.com",
      protocol: "http",
      internalIP: "12.13.14.5",
      port: "8443",
    },
    {
      config_name: "a name",
      domain_name: "www.hashtag.com",
      protocol: "http",
      internalIP: "12.13.14.5",
      port: "8443",
    },
  ];

  return (
    <Tabs defaultValue="details">
      <TabsList>
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="network_rules">Network Rules</TabsTrigger>
      </TabsList>
      <TabsContent value="details" className="w-full space-y-4 px-2 pt-2">
        <div className="text-2xl font-bold">Actions</div>
        <div className="flex justify-between rounded-xl border-2 gap-14 py-2 px-4 items-center w-[700px] bg-gray-200 text-black">
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
          <div className="flex gap-2 p-1 rounded-md cursor-pointer hover:text-red-500">
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
          <div className=" text-lg text-gray-600">
            <span className="font-bold">Id - </span>
            jskdfhsd-f7s89df7uref-bydsiufs7d8-9fsf8
          </div>
          <Separator />
          <div className="text-lg text-gray-600">
            <span className="font-bold">Name - </span> daldia macleren
          </div>
          <Separator />
          <div className="text-lg text-gray-600">
            <span className="font-bold">Host Node -</span> oracle_arm
          </div>
          <Separator />
          <div className="text-lg text-gray-600">
            <span className="font-bold">Image -</span> aaraz/caas:1.1
          </div>
          <Separator />
          <div className="text-lg text-gray-600">
            <span className="font-bold">Internal IP - </span> 11.0.0.1
          </div>
          <Separator />
          <div className="text-lg text-gray-600">
            <span className="font-bold">Created -</span> 2027-20-55 12:02:12
          </div>
        </div>
      </TabsContent>
      <TabsContent value="network_rules" className="pl-2">
        <h1 className="text-2xl font-bold py-2">Inbound Rules</h1>
        <div className="max-h-[400px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="text-md font-extrabold">
                <TableHead>Config Name</TableHead>
                <TableHead>Domain Name</TableHead>
                <TableHead>Protocol</TableHead>
                <TableHead>Internal IP</TableHead>
                <TableHead>Container Port</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configs.map((config, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <input
                      type="text"
                      value={config.config_name}
                      disabled={isEditing ? false : true}
                      className="bg-white"
                    />
                  </TableCell>
                  <TableCell>
                    <input
                      type="text"
                      value={config.domain_name}
                      disabled={isEditing ? false : true}
                      className="bg-white"
                    />
                  </TableCell>
                  <TableCell>
                    <input
                      type="text"
                      value={config.protocol}
                      disabled={true}
                      className="bg-white"
                    />
                  </TableCell>
                  <TableCell>
                    <input
                      type="text"
                      value={config.internalIP}
                      disabled={true}
                      className="bg-white"
                    />
                  </TableCell>
                  <TableCell>
                    <input
                      type="text"
                      value={config.port}
                      disabled={isEditing ? false : true}
                      className="bg-white"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-4">
                      {isEditing && (
                        <Save
                          onClick={() => setIsEditing(false)}
                          className="hover:text-green-500 cursor-pointer"
                        />
                      )}
                      <Trash2 className="text-red-500 hover:text-red-600 cursor-pointer" />
                      <Edit
                        className="cursor-pointer hover:text-blue-500"
                        onClick={() => setIsEditing(true)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
    </Tabs>
  );
}

export default ContainerDetailTabs;
