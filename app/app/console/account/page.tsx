import { auth } from "@/lib/auth"
import prisma from "@/lib/db"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import DeleteSSHKey from "./DeleteSSHKey"
import AddSSHKeys from "./SSHKeys,"
import DownloadSSHKeys from "./DownloadSSHKey"
import { headers } from "next/headers"
import LogoutButton from "@/components/logout-button"

async function Profile() {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  const user = await prisma.user.findUnique({
    where: {
      email: session?.user?.email as string
    },
    include: {
      userData: {
        select: {
          SshKeys: true,
          username: true
        }
      }
    }
  })
  return (
    <div className="md:m-6 m-2 md:space-y-4 space-y-2">
      <div className="md:space-y-4 space-y-2">
        <div className="flex justify-between">
          <div className="text-2xl font-bold text-amber-500">Account</div>
          <LogoutButton />
        </div>
        <div className="md:p-6 p-3 rounded-xl border-2 space-y-4 flex flex-col">
          <div className="md:grid md:space-x-10 grid-cols-2 flex flex-col md:gap-4 gap-2">
            <div>
              <div className="font-bold">AccountID</div>
              <div>{user?.id}</div>
            </div>
            <div>
              <div className="font-bold">Account Name</div>
              <div>{user?.name}</div>
            </div>
          </div>
          <div className="md:grid md:space-x-10 grid-cols-2 flex flex-col gap-4">
            <div>
              <div className="font-bold">Email</div>
              <div>{user?.email}</div>
            </div>
            <div>
              <div className="font-bold">User Name</div>
              <div>{user?.userData?.username}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="md:space-y-4 space-y-2">
        <div className="text-2xl font-bold text-amber-500">Billing</div>
        <div className="md:p-6 p-3 rounded-xl border-2 space-y-4 flex flex-col">
          <div className="md:grid md:space-x-10 grid-cols-2 flex flex-col md:gap-4 gap-2">
            <div>
              <div className="font-bold">Billing ID</div>
              <div>{user?.id}</div>
            </div>
            <div>
              <div className="font-bold">Month</div>
              <div>2024-Jul</div>
            </div>
          </div>
          <div className="md:grid md:space-x-10 grid-cols-2 flex flex-col gap-4">
            <div>
              <div className="font-bold">Cost</div>
              <div>$00.00</div>
            </div>
            <div>
              <div className="font-bold">Plan</div>
              <div>Free</div>
            </div>
          </div>
        </div>
      </div>
      <div className="md:grid grid-cols-2 md:gap-4 gap-2 space-y-2">
        <div className="md:space-y-4 space-y-2 ">
          <div className="text-2xl font-bold flex items-center justify-between">
            <div className="text-amber-500">SSH Keys</div>
            <AddSSHKeys />
          </div>
          <div className="md:p-6 p-3 rounded-xl border-2 space-y-4 flex flex-col">
            <Table>
              <TableHeader className="">
                <TableRow>
                  <TableHead className="">Key Name</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user?.userData?.SshKeys.map((ssh_key) => (
                  <TableRow key={ssh_key.id}>
                    <TableCell className="font-medium">
                      {ssh_key.name}
                    </TableCell>
                    <TableCell className="flex justify-end md:gap-4 gap-2">
                      <DownloadSSHKeys
                        ssh_private_key={ssh_key.privateKey}
                        ssh_key_nick_name={ssh_key.name}
                        ssh_public_key={ssh_key.publicKey}
                      />
                      <DeleteSSHKey id={ssh_key.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="md:p-6 p-3 rounded-xl border-2 space-y-4 flex flex-col text-xl dark:bg-neutral-900 bg-muted"></div>
      </div>

      {/* <div className="bg-red-600 hover:bg-red-500 cursor-pointer py-1 px-4 rounded-full w-fit text-white text-lg text-center ">
        Delete Account
      </div> */}
    </div>
  )
}

export default Profile
