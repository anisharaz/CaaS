import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"

async function VpcPage() {
  return (
    <div className="m-2 md:m-6 space-y-2 md:space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-2xl font-bold">VPCs</div>
      </div>
      <div className="border-2 rounded-xl md:p-6 p-2 max-w-[95vw] overflow-auto">
        <Table className="">
          <TableHeader className="dark:bg-zinc-800 bg-muted">
            <TableRow>
              <TableHead>Name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Default</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default VpcPage
