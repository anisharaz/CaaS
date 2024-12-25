"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { add_vpc_schema } from "@/lib/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

function AddVpc() {
  type Schema = z.infer<typeof add_vpc_schema>;
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors, isValid },
  } = useForm<Schema>({
    resolver: zodResolver(add_vpc_schema),
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<Schema> = async (formData) => {
    console.log(formData);
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size={"sm"} className="px-8">
          <Plus />
          Add VPC
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full md:w-fit">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Create New VPC</DialogTitle>
            <DialogDescription>
              Enter Details required or create a new VPC
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                VPC Name <span className="text-red-600">*</span>
              </Label>
              <div className="col-span-3 space-y-2">
                <Input id="name" {...register("name")} />
              </div>
            </div>
            <div className="text-sm text-amber-300 text-right">
              {errors.name && (
                <div className="text-red-600">{errors.name.message}</div>
              )}
              VPC CIDR will be allocated based on the availability
            </div>
          </div>
          <DialogFooter>
            {isSubmitting ? (
              <Button disabled size={"lg"} className="w-1/2 text-lg">
                <Loader2 className="h-4 w-4 animate-spin" />
                <div>Hold on</div>
              </Button>
            ) : (
              <Button
                disabled={!isValid}
                className="w-1/2 text-lg"
                type="submit"
              >
                Create
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddVpc;
