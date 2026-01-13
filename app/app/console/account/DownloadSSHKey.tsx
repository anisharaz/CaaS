import { Download } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

function DownloadSSHKeys({
  ssh_private_key,
  ssh_key_nick_name,
  ssh_public_key
}: {
  ssh_private_key: string
  ssh_key_nick_name: string
  ssh_public_key: string
}) {
  // This done this way to add new line character at the end of the key
  ssh_private_key = `${ssh_private_key}
  `
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Download className="text-blue-800 hover:text-blue-700 cursor-pointer" />
      </DialogTrigger>
      <DialogContent className="w-full md:max-w-md">
        <DialogHeader>
          <DialogTitle>Download SSH Keys</DialogTitle>
        </DialogHeader>
        <DialogFooter className="grid grid-cols-2">
          <a
            href={`data:text/plain;charset=utf-8,${encodeURIComponent(ssh_private_key)}`}
            download={`${ssh_key_nick_name}_private.pem`}
          >
            <Button size={"sm"}>Private Key</Button>
          </a>
          <a
            href={`data:text/plain;charset=utf-8,${ssh_public_key}`}
            download={`${ssh_key_nick_name}_public.pem`}
          >
            <Button size={"sm"} variant={"secondary"}>
              Public Key
            </Button>
          </a>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DownloadSSHKeys
