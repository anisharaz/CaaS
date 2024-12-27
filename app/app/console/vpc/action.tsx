"use client";
import { deleteVPC } from "@/app/actions/infra";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

function VPCDeleteButton({ vpc_id }: { vpc_id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function handleDelete() {
    setLoading(true);
    const res = await deleteVPC({
      vpc_id: vpc_id,
    });
    if (res.success) {
      router.refresh();
    } else {
      toast.error(res.message);
      setError(res.message);
    }
    setLoading(false);
  }
  return loading ? (
    <Button disabled>
      <Loader2 className="h-4 w-4 animate-spin" />
      <div>Hold on</div>
    </Button>
  ) : (
    <>
      {error && <div className="text-red-600">{error}</div>}
      <Button onClick={handleDelete} variant={"destructive"}>
        Delete
      </Button>
    </>
  );
}

export default VPCDeleteButton;
