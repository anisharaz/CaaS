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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { container_create_schema } from "@/lib/zod";
import { Loader2 } from "lucide-react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { z } from "zod";
import { createContainer } from "@/app/actions/infra";
import { useRouter } from "next/navigation";

export function CreateContainer() {
  const router = useRouter();
  type ContainerCreationSchema = z.infer<typeof container_create_schema>;
  const {
    register,
    handleSubmit,
    clearErrors,
    setValue,
    control,
    formState: { isSubmitting, isValid, errors },
  } = useForm<ContainerCreationSchema>({
    mode: "onChange",
  });

  const UserVPCs = [
    {
      name: "Default",
      id: "1000",
    },
    {
      name: "vpc2",
      id: "1001",
    },
    {
      name: "vpc3",
      id: "1002",
    },
  ];
  const defaultVPCID = UserVPCs.filter((item) => item.name === "Default")[0].id;

  const onSubmit: SubmitHandler<ContainerCreationSchema> = async (FormData) => {
    const res = await createContainer({
      container_name: FormData.container_name,
      vpc_id: FormData.vpc_id,
    });
    if (res.success) {
      router.refresh();
    } else {
      alert("Failed to create container, Try again");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size={"sm"}>Add Container</Button>
      </DialogTrigger>
      <DialogContent className="w-fit">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Create Container</DialogTitle>
            <DialogDescription>
              Enter Details required or create a new container
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-nowrap text-base">
                Container Name <span className="text-red-600">*</span>
              </Label>
              <div className="col-span-3">
                <Input id="name" {...register("container_name")} />
                {errors.container_name && (
                  <div className="text-sm text-red-600">
                    {errors.container_name.message}
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vpc" className="text-nowrap text-base">
                VPC
              </Label>
              <Controller
                control={control}
                name="vpc_id"
                render={() => (
                  <Select
                    onValueChange={(e) => {
                      setValue("vpc_id", e);
                      clearErrors("vpc_id");
                    }}
                    defaultValue={defaultVPCID}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select VPC" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup id="vpc">
                        {UserVPCs.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <DialogFooter>
            {isSubmitting ? (
              <Button disabled size={"lg"} className="w-full text-lg">
                <Loader2 className="h-4 w-4 animate-spin" />
                <div>Hold on</div>
              </Button>
            ) : (
              <Button
                disabled={!isValid}
                size={"lg"}
                className="w-full text-lg"
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
