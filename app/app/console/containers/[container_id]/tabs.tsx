"use client"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Pause, RotateCcw, Trash2, Terminal, Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import Link from "next/link"
import InboundRulesRow from "./InboundRulesRow"
import { AddInboundRule } from "./AddInboundRule"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { deleteContainer } from "@/app/actions/infra/container_actions"

function ContainerDetailTabs({
  container_name,
  nick_name,
  ip_address,
  createdAt,
  inbound_rules
}: {
  container_name: string
  nick_name: string
  ip_address: string
  createdAt: Date
  inbound_rules: {
    id: string
    domain_name: string
    protocol: string
    container_ip: string
    port: number
  }[]
}) {
  const router = useRouter()
  const [deleteContainerError, setDeleteContainerError] = useState("")
  const params = useParams<{ container_id: string }>()
  const [loading, setLoading] = useState({
    start: false,
    stop: false,
    delete: false
  })

  async function DeleteContainer() {
    setDeleteContainerError("")
    setLoading((prev) => ({ ...prev, delete: true }))
    const res = await deleteContainer({
      containerId: params.container_id
    })
    if (res.success) {
      toast.success("Container scheduled for deletion", {})
      router.push("/console/containers")
    } else {
      setDeleteContainerError(res.message)
    }
    setLoading((prev) => ({ ...prev, delete: false }))
  }

  return (
    <Tabs defaultValue="details">
      <TabsList>
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="network_rules">Network Rules</TabsTrigger>
      </TabsList>
      <TabsContent value="details" className="w-full space-y-4 px-2 pt-2">
        <div className="text-2xl font-bold">Actions</div>
        <div className="flex flex-wrap gap-y-8 gap-4 p-5 md:p-4 justify-between rounded-xl border-2 md:gap-14 md:px-4 lg:items-center md:w-fit bg-gray-100 text-black dark:bg-zinc-900 dark:text-white">
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
        </div>
        <div className="text-2xl font-bold">Details</div>
        <div className="border-2 rounded-xl p-6 space-y-4">
          <div className=" text-lg text-gray-600 dark:text-white/80">
            <span className="font-bold">Id - </span>
            {container_name}
          </div>
          <Separator />
          <div className="text-lg text-gray-600 dark:text-white/80">
            <span className="font-bold">Name - </span> {nick_name}
          </div>

          <Separator />
          <div className="text-lg text-gray-600 dark:text-white/80">
            <span className="font-bold">Internal IP - </span>{" "}
            {ip_address || "Pending"}
          </div>
          <Separator />
          <div className="text-lg text-gray-600 dark:text-white/80">
            <span className="font-bold">Created -</span>{" "}
            {new Date(createdAt).toUTCString()}
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
              {inbound_rules.length === 0 && (
                <TableRow>
                  <td colSpan={6} className="text-center text-xl py-4">
                    Create Some Inbound Rules
                  </td>
                </TableRow>
              )}
              {inbound_rules.map((config, index) => (
                <InboundRulesRow
                  key={index}
                  ConfigData={{
                    id: config.id,
                    domain_name: config.domain_name,
                    protocol: config.protocol,
                    container_ip: config.container_ip,
                    port: config.port
                  }}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
    </Tabs>
  )
}

export default ContainerDetailTabs
