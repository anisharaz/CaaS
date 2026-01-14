"use client"
import { CreateAndSaveSSHKey } from "@/app/actions/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

function CreateNewSSHKeys() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [name, setName] = useState("")
  const router = useRouter()
  async function CreateSSHKeys() {
    setLoading(true)
    const res = await CreateAndSaveSSHKey({
      key_name: name
    })
    if (res.success) {
      setName("")
      setError("")
      alert("Key Created Successfully")
      router.refresh()
    } else {
      setError("Creating Key Failed, Try again!")
    }
    setLoading(false)
  }
  return (
    <div>
      <form className="space-y-4 md:p-4">
        <div className="space-y-2">
          <Label htmlFor="sshkeyname" className="text-lg font-bold">
            Key Name{" "}
            <span className="text-red-600">
              * <sub> (min 3)</sub>
            </span>
          </Label>
          <Input
            id="sshkeyname"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
            }}
          />
          {error && <div className="text-red-500">{error}</div>}
        </div>
        {loading ? (
          <Button disabled size={"sm"} className="w-full">
            <Loader2 className="animate-spin" />
          </Button>
        ) : (
          <Button
            size={"sm"}
            disabled={name.length < 3 ? true : false}
            onClick={CreateSSHKeys}
            className="w-full"
          >
            Create
          </Button>
        )}
      </form>
    </div>
  )
}

export default CreateNewSSHKeys
