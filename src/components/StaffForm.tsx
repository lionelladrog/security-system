"use client";
import { useCallback, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { NewStaffMember } from "../type";
import { positions } from "@/constant/dummy/position";
import { trpc } from "../lib/trpc";
import userStore from "../store/userStore";

interface StaffFormProps {
  showAddStaffForm: boolean;
  callback: (show: boolean) => void;
}

export const StaffForm = ({ callback }: StaffFormProps) => {
  const Staff = trpc.user.addStaff.useMutation();
  const user = userStore((state) => state.user);
  const [userID] = useState<number>(user?.id || 0);

  const staffValidationSchema = z.object({
    employeeId: z.string().min(1, "Employee ID is required"),
    firstName: z.string().min(1, "First Name is required"),
    lastName: z.string().min(1, "Last Name is required"),
    phone: z
      .string()
      .regex(/^\+?[0-9]{8,14}$/, { message: "Invalid phone number format" })
      .optional()
      .or(z.literal("")),
    position: z.string().optional(),
    email: z
      .string()
      .email("Invalid email address")
      .optional()
      .or(z.literal("")),
    userId: z.number(),
  });

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(staffValidationSchema),
    defaultValues: {
      position: "",
      userId: userID,
      email: "",
      phone: "",
    },
  });

  const onSubmit = useCallback(
    (data: NewStaffMember) => {
      const payload = {
        ...data,
        email: data.email?.trim() || "",
        phone: data.phone?.trim() || "",
      };

      Staff.mutate(payload, {
        onSuccess: () => {
          toast.success("Staff member added successfully");
          callback(false);
        },
        onError: (error) => {
          toast.error(error.message, { duration: 10000 });
        },
      });
    },
    [Staff, callback]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="employeeId">Employee ID</Label>
        <Input
          id="employeeId"
          {...register("employeeId")}
          placeholder="EMP001"
        />
        {errors.employeeId && (
          <p className="error">{errors.employeeId.message}</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" {...register("firstName")} placeholder="John" />
          {errors.firstName && (
            <p className="error">{errors.firstName.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" {...register("lastName")} placeholder="Doe" />
          {errors.lastName && (
            <p className="error">{errors.lastName.message}</p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          placeholder="john.doe@company.com"
        />
        {errors.email && <p className="error">{errors.email.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register("phone")} placeholder="52324243" />
          {errors.phone && <p className="error">{errors.phone.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="position">Position</Label>
          <Controller
            name="position"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="position">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((position) => (
                    <SelectItem key={position.id} value={`${position.id}`}>
                      {position.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.position && (
            <p className="error">{errors.position.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full">
        Add Staff Member
      </Button>
    </form>
  );
};
