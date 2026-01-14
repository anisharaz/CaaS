"use client"
// import { deleteSSHKey } from "@/app/actions/database"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Loader2, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

function DeleteSSHKey({ id }: { id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  async function Deletesshkey() {
    setLoading(true)
    // const res = await deleteSSHKey({
    //   id: id
    // })
    // if (res.success) {
    //   router.refresh()
    // } else {
    //   alert(res.message)
    // }
    setLoading(false)
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Trash2 className="cursor-pointer hover:text-red-700" />
      </DialogTrigger>
      <DialogContent className="w-full md:max-w-md">
        <DialogHeader>
          <DialogTitle>Are you Sure ?</DialogTitle>
          <DialogDescription>
            Once delete cannot be revocered !!
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          {loading ? (
            <Button disabled variant={"destructive"}>
              <Loader2 className="h-4 w-4 animate-spin" />
            </Button>
          ) : (
            <Button variant={"destructive"} onClick={Deletesshkey}>
              Delete
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteSSHKey
