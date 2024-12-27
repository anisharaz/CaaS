"use client";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Terminal,
  Loader2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import InboundRulesRow from "./InboundRulesRow";
import { AddInboundRule } from "./AddInboundRule";
import { useParams, useRouter } from "next/navigation";
import {
  startContainer,
  restartContainer,
  stopContainer,
  deleteContainer,
} from "@/app/actions/infra";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const configs = [
  {
    id: "id-dd",
    config_name: "one",
    domain_name: "www.hashtag.com",
    protocol: "http",
    container_ip: "12.13.14.5",
    port: 3000,
  },
  {
    id: "idsfdfs",
    config_name: "two",
    domain_name: "www.hashtag.com",
    protocol: "http",
    container_ip: "12.13.14.10",
    port: 8443,
  },
];

function ContainerDetailTabs({ container_name }: { container_name: string }) {
  const router = useRouter();
  const [deleteContainerError, setDeleteContainerError] = useState("");
  const params = useParams<{ container_id: string }>();
  const [loading, setLoading] = useState({
    start: false,
    restart: false,
    stop: false,
    delete: false,
  });
  async function StartContainer() {
    if (Object.values(loading).includes(true)) {
      alert("Please wait for the previous action to complete");
    } else {
      setLoading((prev) => ({ ...prev, start: true }));
      const res = await startContainer({
        container_name: container_name,
      });
      if (res.success) {
        toast.success("Container started successfully", {});
      } else {
        toast.error("Failed to start container", {});
      }
      setLoading((prev) => ({ ...prev, start: false }));
    }
  }
  async function ReStartContainer() {
    if (Object.values(loading).includes(true)) {
      alert("Please wait for the previous action to complete");
    } else {
      setLoading((prev) => ({ ...prev, restart: true }));
      const res = await restartContainer({
        container_name: container_name,
      });
      if (res.success) {
        toast.success("Container restarted successfully", {});
      } else {
        toast.error("Failed to restart container", {});
      }
      setLoading((prev) => ({ ...prev, restart: false }));
    }
  }
  async function StopContainer() {
    if (Object.values(loading).includes(true)) {
      alert("Please wait for the previous action to complete");
    } else {
      setLoading((prev) => ({ ...prev, stop: true }));
      const res = await stopContainer({
        container_name: container_name,
      });
      if (res.success) {
        toast.success("Container stopped successfully", {});
      } else {
        toast.error("Failed to stop container", {});
      }
      setLoading((prev) => ({ ...prev, stop: false }));
    }
  }
  async function DeleteContainer() {
    if (Object.values(loading).includes(true)) {
      alert("Please wait for the previous action to complete");
    } else {
      setDeleteContainerError("");
      setLoading((prev) => ({ ...prev, delete: true }));
      const res = await deleteContainer({
        container_name: container_name,
      });
      if (res.success) {
        toast.success("Container deleted successfully", {});
        router.push("/console/containers");
      } else {
        setDeleteContainerError(res.message);
      }
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  }

  return (
    <Tabs defaultValue="details">
      <TabsList>
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="network_rules">Network Rules</TabsTrigger>
      </TabsList>
      <TabsContent value="details" className="w-full space-y-4 px-2 pt-2">
        <div className="text-2xl font-bold">Actions</div>
        <div className="flex flex-wrap gap-y-8 gap-4 p-5 md:p-4 justify-between rounded-xl border-2 md:gap-14 md:px-4 lg:items-center md:w-[700px] bg-gray-100 text-black dark:bg-zinc-900 dark:text-white">
          <div
            className="flex gap-2 cursor-pointer group hover:text-green-600"
            onClick={StartContainer}
          >
            {loading.start ? (
              <Loader2 className="animate-spin m-auto" />
            ) : (
              <>
                <span>Start</span>
                <Play />
              </>
            )}
          </div>
          <div
            className="flex gap-2 cursor-pointer hover:text-amber-600"
            onClick={StopContainer}
          >
            {loading.stop ? (
              <Loader2 className="animate-spin m-auto" />
            ) : (
              <>
                <span>Stop</span>
                <Pause />
              </>
            )}
          </div>
          <div
            className="flex gap-2 cursor-pointer hover:text-fuchsia-700"
            onClick={ReStartContainer}
          >
            {loading.restart ? (
              <Loader2 className="animate-spin m-auto" />
            ) : (
              <>
                <span>Restart</span>
                <RotateCcw />
              </>
            )}
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <div className="flex gap-2 cursor-pointer hover:text-red-500">
                <span>Delete</span>
                <Trash2 />
              </div>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              {deleteContainerError && (
                <div className="text-red-600">{deleteContainerError}</div>
              )}
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                {loading.delete ? (
                  <Button disabled variant={"destructive"}>
                    <Loader2 className="animate-spin m-auto" />
                  </Button>
                ) : (
                  <Button variant={"destructive"} onClick={DeleteContainer}>
                    Delete
                  </Button>
                )}
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Link
            href={`${params.container_id}/terminal`}
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
        <div className="py-2 flex justify-between">
          <h1 className="text-2xl font-bold ">Inbound Rules</h1>
          <AddInboundRule container_name={container_name} />
        </div>
        <div className="max-h-[400px] max-w-[90vw] overflow-auto">
          <Table>
            <TableHeader className="dark:bg-zinc-800 bg-muted">
              <TableRow className="text-md font-extrabold">
                <TableHead>Rule Name</TableHead>
                <TableHead>Domain Name</TableHead>
                <TableHead>Service Protocol</TableHead>
                <TableHead>Container IP</TableHead>
                <TableHead>Container Port</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configs.map((config, index) => (
                <InboundRulesRow
                  key={index}
                  ConfigData={{
                    id: config.id,
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
