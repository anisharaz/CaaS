"use client";
import { editVPC } from "@/app/actions/infra";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

function EditVpc({ VpcName, vpc_id }: { VpcName: string; vpc_id: string }) {
  const router = useRouter();
  const [vpcNameState, setVpcName] = useState(VpcName);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submitHandler() {
    setLoading(true);
    const res = await editVPC({
      vpc_name: vpcNameState,
      vpc_id: vpc_id,
    });
    if (res.success) {
      router.refresh();
      setLoading(false);
    } else {
      setError(res.message);
      setLoading(false);
    }
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Edit className="hover:text-blue-500 cursor-pointer" />
      </DialogTrigger>
      <DialogContent className="md:w-fit">
        <DialogHeader>
          <DialogTitle>New Name of VPC</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <Label>Name: </Label>
            <Input
              value={vpcNameState}
              onChange={(e) => {
                setVpcName(e.target.value);
              }}
            />
          </div>
          {error && <div className="text-right text-red-500">{error}</div>}
          {vpcNameState.length < 3 && (
            <div className="text-red-600 text-right">Min 3 chars</div>
          )}
        </div>
        <DialogFooter>
          {loading ? (
            <Button disabled size={"lg"} className="w-1/2 text-lg">
              <Loader2 className="h-4 w-4 animate-spin" />
              <div>Hold on</div>
            </Button>
          ) : (
            <Button
              disabled={vpcNameState.length < 3}
              className="w-1/2 text-lg"
              type="submit"
              onClick={submitHandler}
            >
              Update
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EditVpc;
