import { createInboundRule } from "@/app/actions/infra";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { add_inbound_rule_schema } from "@/lib/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export function AddInboundRule({ container_name }: { container_name: string }) {
  const router = useRouter();
  type AddInboundRuleSchema = z.infer<typeof add_inbound_rule_schema>;
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, isValid, errors },
  } = useForm<AddInboundRuleSchema>({
    resolver: zodResolver(add_inbound_rule_schema),
    mode: "onBlur",
  });
  const onSubmit: SubmitHandler<AddInboundRuleSchema> = async (FormData) => {
    const res = await createInboundRule({
      config_name: FormData.rule_name,
      domain_name: FormData.domain_name,
      container_port: FormData.port,
      container_name: container_name,
    });
    if (res.success) {
      router.refresh();
    } else {
      toast.error(res.message);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size={"sm"} className="w-28">
          Add
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[90vw]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <SheetHeader>
            <SheetTitle>Add Inbound Rule</SheetTitle>
            <SheetDescription>
              Make changes Click Create when you&apos;re done.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rule_name" className="text-right text-base">
                  Rule Name <span className="text-red-600">*</span>
                </Label>
                <div className="col-span-3">
                  <Input id="rule_name" {...register("rule_name")} />
                </div>
              </div>
              {errors.rule_name && (
                <div className={`text-right ${"text-red-500"}`}>
                  {errors.rule_name.message}
                </div>
              )}
              {<div className={`text-right ${"text-red-500"}`}>{isValid}</div>}
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="domain_name" className="text-right text-base">
                  Domain Name <span className="text-red-600">*</span>
                </Label>
                <div className="col-span-3 flex gap-2 items-center">
                  <Input id="domain_name" {...register("domain_name")} />
                  <span className="text-lg">.opendev.me</span>
                </div>
              </div>
              <div
                className={`text-right ${errors.domain_name && "text-red-500"}`}
              >
                {errors.domain_name?.message}
              </div>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="" className="text-right text-base">
                  Port <span className="text-red-600">*</span>
                </Label>
                <Input
                  id=""
                  className="col-span-3"
                  {...register("port", {
                    valueAsNumber: true,
                  })}
                />
              </div>
              {errors.port && (
                <div className={`text-right text-red-500`}>
                  {errors.port.message}
                </div>
              )}
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild></SheetClose>
            {isSubmitting ? (
              <Button disabled size={"lg"} className="w-full md:w-fit text-lg">
                <Loader2 className="h-4 w-4 animate-spin" />
                <div>Hold on</div>
              </Button>
            ) : (
              <Button
                disabled={!isValid}
                size={"lg"}
                className="w-full md:w-fit text-lg"
                type="submit"
              >
                Add
              </Button>
            )}
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
