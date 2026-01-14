import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import CreateNewSSHKeys from "./CreateNewSSHKEY"
function AddSSHKeys() {
  return (
    <Sheet>
      <SheetTrigger className="text-base" asChild>
        <Button size={"sm"}>
          <Plus />
          <div>Add Keys</div>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[90vw]">
        <SheetHeader>
          <SheetTitle>SSH Key</SheetTitle>
        </SheetHeader>
        <Tabs defaultValue="create" className="w-[100%]">
          <TabsList>
            <TabsTrigger value="create">Create New</TabsTrigger>
          </TabsList>
          <TabsContent value="create">
            <CreateNewSSHKeys />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}

export default AddSSHKeys
