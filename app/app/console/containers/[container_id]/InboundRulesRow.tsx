import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { inbound_rules_schema } from "@/lib/zod";
import { z } from "zod";
import { useState } from "react";
import { deleteInboundRule, editInboundRule } from "@/app/actions/infra";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function InboundRulesRow({
  ConfigData,
}: {
  ConfigData: {
    id: string;
    config_name: string;
    domain_name: string;
    protocol: string;
    container_ip: string;
    port: number;
  };
}) {
  const router = useRouter();
  type Schema = z.infer<typeof inbound_rules_schema>;
  const {
    register,
    handleSubmit,
    setError,
    formState: { isSubmitting, errors },
  } = useForm<Schema>({
    resolver: zodResolver(inbound_rules_schema),
    mode: "onChange",
    defaultValues: {
      config_name: ConfigData.config_name,
      domain_name: ConfigData.domain_name,
      port: ConfigData.port,
    },
  });

  const onSubmit: SubmitHandler<Schema> = async (formData) => {
    setError("root", {
      message: "",
    });
    const res = await editInboundRule({
      config_name: formData.config_name,
      domain_name: formData.domain_name,
      container_port: formData.port,
      inbound_rule_id: ConfigData.id,
    });
    if (res.success) {
      router.refresh();
      toast.success("Inbound rule updated successfully");
    } else {
      setError("root", {
        message: res.message,
      });
      toast.error(res.message);
    }
  };

  const [deleteInboundRuleState, setDeleteInboundRule] = useState({
    loading: false,
    error: "",
  });

  async function DeleteInboundRule() {
    setDeleteInboundRule({ ...deleteInboundRuleState, loading: true });
    const res = await deleteInboundRule({
      config_name: ConfigData.config_name,
      inbound_rule_id: ConfigData.id,
    });
    if (res.success) {
      router.refresh();
    } else {
      setDeleteInboundRule({
        loading: false,
        error: res.message,
      });
      toast.error(res.message);
    }
  }

  return (
    <TableRow>
      <TableCell>{ConfigData.config_name}</TableCell>
      <TableCell>{ConfigData.domain_name}</TableCell>
      <TableCell>{ConfigData.protocol}</TableCell>
      <TableCell>{ConfigData.container_ip}</TableCell>
      <TableCell>{ConfigData.port}</TableCell>
      <TableCell>
        <div className="flex gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Edit className="cursor-pointer hover:text-blue-500" />
            </DialogTrigger>
            <DialogContent className="overflow-auto">
              <DialogHeader>
                <DialogTitle>Update Details</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="overflow-x-auto"
              >
                <Table>
                  <TableHeader>
                    <TableRow className="text-md font-extrabold">
                      <TableHead className="min-w-60">
                        Rule Name <sub>(edit)</sub>
                      </TableHead>
                      <TableHead className="min-w-60">
                        Domain Name <sub>(edit)</sub>
                      </TableHead>
                      <TableHead className="min-w-60">
                        Service Protocol
                      </TableHead>
                      <TableHead className="min-w-60">Container IP</TableHead>
                      <TableHead className="min-w-60">
                        Container Port <sub>(edit)</sub>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="hover:bg-transparent">
                      <TableCell className="space-y-2">
                        <Input {...register("config_name")} />
                        {errors.config_name && (
                          <div className="text-red-600">
                            {errors.config_name.message}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input {...register("domain_name")} />
                      </TableCell>
                      <TableCell>{ConfigData.protocol}</TableCell>
                      <TableCell>{ConfigData.container_ip}</TableCell>
                      <TableCell className="space-y-2">
                        <Input {...register("port", { valueAsNumber: true })} />
                        {errors.port && (
                          <div className="text-red-600">
                            {errors.port?.message}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                {errors.root && (
                  <div className="text-right text-red-500 pb-2">
                    {errors.root.message}
                  </div>
                )}
                <DialogFooter>
                  {isSubmitting ? (
                    <Button disabled size={"lg"} className=" text-lg">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <div>Hold on..</div>
                    </Button>
                  ) : (
                    <Button size={"lg"} className="text-lg" type="submit">
                      Update
                    </Button>
                  )}
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <AlertDialog>
            <AlertDialogTrigger>
              <Trash2 className="text-red-500 hover:text-red-600 cursor-pointer" />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will delete the inbound rule
                </AlertDialogDescription>
              </AlertDialogHeader>
              {deleteInboundRuleState.error && (
                <div className="text-red-600">
                  {deleteInboundRuleState.error}
                </div>
              )}
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                {deleteInboundRuleState.loading ? (
                  <Button disabled variant={"destructive"}>
                    <Loader2 className="animate-spin m-auto" />
                  </Button>
                ) : (
                  <Button variant={"destructive"} onClick={DeleteInboundRule}>
                    Delete
                  </Button>
                )}
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default InboundRulesRow;
