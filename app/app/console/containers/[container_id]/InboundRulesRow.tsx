import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
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
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { SubmitHandler, useForm } from "react-hook-form"
import { inbound_rules_schema } from "@/lib/zod"
import { z } from "zod"
import { useState } from "react"
import { deleteInboundRule } from "@/app/actions/infra"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"

function InboundRulesRow({
  ConfigData
}: {
  ConfigData: {
    id: string
    configName: string
    domainName: string
    port: number
  }
}) {
  const router = useRouter()

  const [deleteInboundRuleState, setDeleteInboundRule] = useState({
    loading: false,
    error: ""
  })

  async function DeleteInboundRule() {
    setDeleteInboundRule({ ...deleteInboundRuleState, loading: true })
    const res = await deleteInboundRule({
      inbound_rule_id: ConfigData.id
    })
    if (res.success) {
      router.refresh()
      toast.success("Inbound rule deleted successfully")
      setDeleteInboundRule({ ...deleteInboundRuleState, loading: false })
      alert("Inbound rule deleted successfully")
    } else {
      setDeleteInboundRule({
        loading: false,
        error: res.message
      })
      toast.error(res.message)
    }
  }

  return (
    <TableRow>
      <TableCell>{ConfigData.configName}</TableCell>
      <TableCell>
        <Link
          href={`https://${ConfigData.domainName + process.env.NEXT_PUBLIC_CLOUDFLARE_ROOT_DOMAIN}`}
          target="_blank"
          className="text-blue-500 hover:underline"
        >
          https://
          {ConfigData.domainName +
            process.env.NEXT_PUBLIC_CLOUDFLARE_ROOT_DOMAIN}
        </Link>
      </TableCell>
      <TableCell>{ConfigData.port}</TableCell>
      <TableCell>
        <div className="flex gap-4">
          <AlertDialog>
            <AlertDialogTrigger>
              <Trash2 className="text-red-500 hover:text-red-800 cursor-pointer" />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will delete the inbound rule
                </AlertDialogDescription>
              </AlertDialogHeader>
              {deleteInboundRuleState.error && (
                <div className="text-red-600">
                  {deleteInboundRuleState.error}
                </div>
              )}
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                {deleteInboundRuleState.loading ? (
                  <Button disabled variant={"destructive"}>
                    <Loader2 className="animate-spin m-auto" />
                  </Button>
                ) : (
                  <Button variant={"destructive"} onClick={DeleteInboundRule}>
                    Delete
                  </Button>
                )}
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  )
}

export default InboundRulesRow
