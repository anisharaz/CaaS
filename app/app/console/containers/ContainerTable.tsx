"use client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { useEffect, useState } from "react"
import { DEFAULT_VPC_NAME } from "@/lib/vars"
import axios from "axios"
import { Loader2, RotateCcw, Copy } from "lucide-react"
import Link from "next/link"
import ContainerStatusBadge from "@/components/ContainerStatusBadge"
import { toast } from "sonner"
import Image from "next/image"

// TODO: update the code to show provisioning state containers
function ContainerTable({
  vpcs
}: {
  vpcs:
    | {
        vpc_name: string
        id: string
      }[]
    | undefined
}) {
  const [vpc, setVpc] = useState(() => {
    return vpcs?.filter((vpc) => vpc.vpc_name === DEFAULT_VPC_NAME)[0]?.id
  })
  const [vpcFetchLoading, setVpcFetchLoading] = useState(false)
  const [triggetFetch, setTriggerFetch] = useState(false)
  const [container, setContainer] = useState<
    {
      container_name: string
      container_nick_name: string
      container_ip: string
      node: string
      created_at: string
      ssh_port: string
    }[]
  >([])
  const DefaultVPCID = vpcs?.filter(
    (vpc) => vpc.vpc_name === DEFAULT_VPC_NAME
  )[0]?.id
  useEffect(() => {
    async function getContainers() {
      setVpcFetchLoading(true)
      if (vpc) {
        const res = await axios.get(`/api/v1/app/containers?vpc_id=${vpc}`)
        const data = res.data
        setContainer(data)
      }
      toast.success("Containers fetched")
      setVpcFetchLoading(false)
    }
    getContainers().then(() => {
      console.log("Containers fetched")
    })
  }, [vpc, triggetFetch])
  return (
    <>
      <div className="flex gap-2 items-center">
        <div>VPC</div>
        <Select
          defaultValue={DefaultVPCID}
          onValueChange={(e) => {
            setVpc(e)
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a Vpc" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {vpcs?.map((vpc) => (
                <SelectItem key={vpc.id} value={vpc.id}>
                  {vpc.vpc_name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {vpcFetchLoading && <Loader2 className="w-6 h-6 animate-spin" />}
        {!vpcFetchLoading && (
          <RotateCcw
            className="w-6 h-6 cursor-pointer hover:text-blue-600 transform transition-transform duration-300 hover:-rotate-180"
            onClick={() => {
              setTriggerFetch(!triggetFetch)
            }}
          />
        )}
      </div>
      <div className="max-h-[600px] overflow-auto max-w-[90vw]">
        <Table>
          <TableHeader className="dark:bg-zinc-800 bg-muted">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Node</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Internal IP</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {container.map((detail) => {
              return (
                <>
                  <TableRow>
                    <TableCell className="font-medium  text-blue-600 underline underline-offset-2 hover:text-blue-700">
                      <Link
                        href={`containers/${detail.container_name}`}
                        className="cursor-pointer"
                      >
                        {detail.container_nick_name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <ContainerStatusBadge
                        container_name={detail.container_name}
                      />
                    </TableCell>
                    <TableCell>{detail.node}</TableCell>
                    <TableCell className="md:hidden">
                      {new Date(detail.created_at).toISOString().split("T")[0]}
                    </TableCell>
                    <TableCell className="hidden md:block">
                      {new Date(detail.created_at).toUTCString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {detail.container_ip}
                    </TableCell>
                    <TableCell className="text-right flex justify-end items-center">
                      <Dialog>
                        <DialogTrigger className="flex items-center space-x-2 hover:bg-zinc-600 p-1 rounded-lg ">
                          <div>SSH</div>
                          <Image
                            src={"https://static.aaraz.me/caas/ssh.png"}
                            height={64}
                            width={64}
                            alt=""
                            className="w-6"
                          />
                        </DialogTrigger>
                        <DialogContent className="md:w-fit">
                          <DialogHeader>
                            <DialogTitle className="md:text-2xl text-left">
                              Instruction for ssh !
                            </DialogTitle>
                            <DialogDescription className="text-left">
                              Download the ssh keys from account section
                            </DialogDescription>
                          </DialogHeader>
                          <div className="md:text-xl font-bold">
                            1. changing permission of the key file
                          </div>
                          <div className="flex justify-between md:gap-6 items-center bg-black text-white md:p-4 p-2 rounded-lg font-mono text-sm dark:bg-zinc-900">
                            <pre>
                              <code>chmod 600 path/to/your/keyfile.pem</code>
                            </pre>
                            <Copy
                              className="cursor-pointer w-4 md:w-6"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  `chmod 600 path/to/your/keyfile.pem`
                                )
                                toast.success("Copied")
                              }}
                            />
                          </div>
                          <div className="md:text-xl font-bold">
                            2. SSH into the container
                          </div>
                          <div className="flex justify-between md:gap-6 items-center bg-black text-white md:p-4 p-2 rounded-lg font-mono text-sm dark:bg-zinc-900">
                            <pre>
                              <code className="text-wrap">
                                ssh root@52.172.192.35 -p {detail.ssh_port}{" "}
                                path/to/your/keyfile.pem
                              </code>
                            </pre>
                            <Copy
                              className="cursor-pointer w-6 md:w-6"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  `ssh root@52.172.192.35 -p ${detail.ssh_port} path/to/your/keyfile.pem`
                                )
                                toast.success("Copied")
                              }}
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                </>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </>
  )
}

export default ContainerTable
