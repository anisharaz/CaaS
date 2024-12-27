import { Trash2, Edit } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

import AddVpc from "./AddVpc";
import EditVpc from "./EditVpc";
import VPCDeleteButton from "./action";

function VpcPage() {
  let vpcs = [
    {
      id: "xyz",
      vpc_name: "Default",
      cidr: "11.0.0.0/24",
      gateway: "11.0.0.1",
    },
    {
      id: "xyz",
      vpc_name: "extra",
      cidr: "12.0.0.1/24",
      gateway: "11.0.0.1",
    },
    {
      id: "xyz",
      vpc_name: "test",
      cidr: "15.2.2.5/24",
      gateway: "11.0.0.1",
    },
    {
      id: "xyz",
      vpc_name: "dev",
      cidr: "20.0.0.5/24",
      gateway: "11.0.0.1",
    },
  ];
  vpcs = vpcs.filter((vpc) => vpc.vpc_name !== "Default");

  return (
    <div className="m-2 md:m-6 space-y-2 md:space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-2xl font-bold">VPCs</div>
        <AddVpc />
      </div>
      <div className="border-2 rounded-xl md:p-6 p-2 max-w-[95vw] overflow-auto">
        <Table className="">
          <TableHeader className="dark:bg-zinc-800 bg-muted">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>CIDR</TableHead>
              <TableHead>Gateway</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Default</TableCell>
              <TableCell>{"10.1.2.10/24"}</TableCell>
              <TableCell>{"10.1.2.10"}</TableCell>
              <TableCell className="text-right flex gap-4 justify-end">
                <Trash2 className="text-red-500/20 " />
                <Edit className="dark:text-white/20 text-black/20" />
              </TableCell>
            </TableRow>
            {vpcs.map((vpc) => (
              <TableRow key={vpc.cidr}>
                <TableCell className="font-medium">{vpc.vpc_name}</TableCell>
                <TableCell>{vpc.cidr}</TableCell>
                <TableCell>{vpc.gateway}</TableCell>
                <TableCell className="text-right flex gap-4 justify-end">
                  <AlertDialog>
                    <AlertDialogTrigger>
                      <Trash2 className="text-red-500 hover:text-red-600 cursor-pointer" />
                    </AlertDialogTrigger>
                    <AlertDialogContent className="">
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This will delete VPC {"' " + vpc.vpc_name + " '"}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex items-center">
                        <VPCDeleteButton vpc_id={vpc.id} />
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <EditVpc VpcName={vpc.vpc_name} vpc_id={vpc.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default VpcPage;
