import { Separator } from "@/components/ui/separator";
import { Trash2, Edit } from "lucide-react";

function VpcPage() {
  let vpcs = [
    {
      name: "Default",
    },
    {
      name: "extra",
    },
    {
      name: "test",
    },
    {
      name: "dev",
    },
  ];
  vpcs = vpcs.filter((vpc) => vpc.name !== "Default");
  return (
    <div className="m-2 md:m-6 space-y-2 md:space-y-4">
      <div className="text-2xl font-bold">VPCs</div>
      <div className="p-3 lg:p-4 rounded-xl border-2 space-y-4 max-h-[800px]">
        <div className="flex">
          <div className="flex-1">Default</div>
          <div className="lg:border-l-2 md:px-6 flex gap-4">
            <Trash2 className="text-red-500 hover:text-red-600 cursor-pointer" />
            <Edit className="cursor-pointer hover:text-blue-500" />
          </div>
        </div>
        {vpcs.map((vpc) => {
          return (
            <>
              <Separator />
              <div className="flex">
                <div className="flex-1">{vpc.name}</div>
                <div className="lg:border-l-2 md:px-6 flex gap-4">
                  <Trash2 className="text-red-500 hover:text-red-600 cursor-pointer" />
                  <Edit className="cursor-pointer hover:text-blue-500" />
                </div>
              </div>
            </>
          );
        })}
      </div>
    </div>
  );
}

export default VpcPage;
