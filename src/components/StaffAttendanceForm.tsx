import { useState, useEffect } from "react";
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
import * as Switch from "@radix-ui/react-switch";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { daysElapsed } from "../lib/utils";
import {
  NewStaffAttendanceRecord,
  newStaffAttendanceRecordZod,
  NewStaffAttendanceRecordForm,
  NewStaffMember,
  Site,
} from "../type";
import { trpc } from "../lib/trpc";
import userStore from "../store/userStore";

interface AttendanceFormProps {
  attendanceRecord: NewStaffAttendanceRecord | null;
  selectedDate: Date;
  showAttendanceForm: boolean;
  staffs: NewStaffMember[];
  formCallback: (show: boolean) => void;
}

export default function StaffAttendanceForm({
  attendanceRecord,
  selectedDate,
  formCallback,
  staffs,
}: AttendanceFormProps) {
  const SitesData = trpc.site.getSites.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const attendanceUpdateMutation = trpc.attendance.update.useMutation();
  const attendanceCreateMutation = trpc.attendance.add.useMutation();

  const user = userStore((state) => state.user);

  const [sites, setSites] = useState<Site[]>([]);
  const [hours, setHours] = useState<string>("0");
  const [lockEdit, setLockEdit] = useState(false);

  const form = useForm({
    resolver: zodResolver(newStaffAttendanceRecordZod),
    defaultValues: {
      date: selectedDate,
      siteId: attendanceRecord?.siteId || 0,
      staffId: attendanceRecord?.staffId || 0,
      checkIn: "",
      checkOut: "",
      breakTime: 0,
      travelAllowance: "0",
      hours: "",
      approvedBy: user?.id || 0,
      notes: "",
      status: "absent",
      hasPendingRequest: false,
    },
  });

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = form;

  const watchCheckIn = watch("checkIn");
  const watchCheckOut = watch("checkOut");
  const watchBreakTime = watch("breakTime");

  useEffect(() => {
    if (SitesData.data) {
      setSites(SitesData.data);
    }
  }, [SitesData.data]);

  useEffect(() => {
    if (attendanceRecord && staffs.length > 0 && sites.length > 0) {
      const days = daysElapsed(new Date(attendanceRecord.date));

      if (user?.role !== "admin" && days > 2) {
        setLockEdit(true);
      }

      form.reset({
        id: attendanceRecord.id || 0,
        date: attendanceRecord.date
          ? new Date(attendanceRecord.date)
          : selectedDate,
        staffId:
          typeof attendanceRecord?.staffId === "number"
            ? attendanceRecord.staffId
            : 0,
        siteId:
          typeof attendanceRecord?.siteId === "number"
            ? attendanceRecord.siteId
            : 0,
        checkIn: attendanceRecord.checkIn || "",
        checkOut: attendanceRecord.checkOut,
        breakTime: attendanceRecord.breakTime || 0,
        travelAllowance: attendanceRecord.travelAllowance?.toString() || "0",
        hours: attendanceRecord.hours?.toString() || "",
        approvedBy: attendanceRecord.approvedBy || user?.id || 0,
        notes: attendanceRecord.notes || "",
        status: attendanceRecord.status || "",
        hasPendingRequest: attendanceRecord.hasPendingRequest || false,
        createdAt: attendanceRecord.createdAt
          ? new Date(attendanceRecord.createdAt)
          : new Date(),
      });
    } else {
      form.reset({
        date: selectedDate,
        siteId: attendanceRecord?.siteId || 0,
        staffId: attendanceRecord?.staffId || 0,
        checkIn: "",
        checkOut: "",
        breakTime: 0,
        travelAllowance: "0",
        hours: "",
        approvedBy: user?.id || 0,
        notes: "",
        status: "",
        hasPendingRequest: false,
      });
    }
  }, [attendanceRecord, staffs, sites, user, form, selectedDate]);

  useEffect(() => {
    if (watchCheckIn && watchCheckOut) {
      setHours(hours.toString());
    }
  }, [watchCheckIn, watchCheckOut, watchBreakTime, hours]);

  const calculateHoursWorked = (
    watchCheckIn: string,
    watchCheckOut: string,
    watchBreakTime: number | undefined
  ) => {
    if (!watchCheckIn || !watchCheckOut) return "0.00";

    const [inHour, inMinute] = watchCheckIn.split(":").map(Number);
    const [outHour, outMinute] = watchCheckOut.split(":").map(Number);

    const inTotalMinutes = inHour * 60 + inMinute;
    let outTotalMinutes = outHour * 60 + outMinute;

    if (outTotalMinutes < inTotalMinutes) {
      outTotalMinutes += 24 * 60;
    }

    const workedMinutes = watchBreakTime
      ? outTotalMinutes - inTotalMinutes - watchBreakTime
      : outTotalMinutes - inTotalMinutes;

    const hours = Math.max(workedMinutes / 60, 0);

    return hours.toFixed(2);
  };

  const handleFormSubmit = (data: NewStaffAttendanceRecordForm) => {
    const hours = calculateHoursWorked(
      watchCheckIn,
      watchCheckOut,
      watchBreakTime
    );
    let status;
    if (Number(hours) >= 1) {
      status = "present";
    } else if (data.siteId === 12) {
      status = "off";
    } else {
      status = "absent";
    }

    data.hours = hours.toString();
    data.status = status;
    data.date = data.date instanceof Date ? data.date : new Date(data.date);

    if (!("id" in data)) {
      attendanceCreateMutation.mutate(data, {
        onSuccess: () => {
          toast.success("Attendance saved successfully!", { duration: 6000 });
          formCallback(false);
        },
        onError: (error) => {
          toast.error(error.message, { duration: 4000 });
        },
      });
    } else {
      attendanceUpdateMutation.mutate(data, {
        onSuccess: () => {
          toast.success("Attendance updated successfully!", { duration: 8000 });
          formCallback(false);
        },
        onError: (error) => {
          toast.error(error.message, { duration: 4000 });
        },
      });
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-6"
        noValidate
      >
        {lockEdit && user?.role !== "admin" && (
          <div className="flex items-center justify-end">
            <label
              className="pr-[15px] text-[14px]  leading-none "
              htmlFor="airplane-mode"
            >
              Request Admin
            </label>
            <Controller
              name="hasPendingRequest"
              control={control}
              render={({ field }) => (
                <Switch.Root
                  checked={field.value ?? false}
                  onCheckedChange={field.onChange}
                  id="hasPendingRequest"
                  className=" relative h-[20px] w-[32px] cursor-default rounded-full bg-primary/50 shadow-primary/70 outline-none focus:shadow-primary data-[state=checked]:bg-primary"
                >
                  <Switch.Thumb className="block size-[18px] translate-x-0.5 rounded-full bg-white shadow transition-transform duration-100 will-change-transform data-[state=checked]:translate-x-[13px]" />
                </Switch.Root>
              )}
            />
          </div>
        )}

        {/* Staff Select */}
        <div className="space-y-2">
          <Label htmlFor="staffSelect">Select Staff Member</Label>
          <Controller
            control={control}
            name="staffId"
            render={({ field }) => {
              return (
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  value={field.value ? field.value.toString() : ""}
                  disabled={!!attendanceRecord}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffs.map((staff: NewStaffMember) => (
                      <SelectItem key={staff.id} value={`${staff.id}`}>
                        {staff.employeeId} - {staff.firstName} {staff.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              );
            }}
          />
          {errors.staffId && <p className="error">{errors.staffId.message}</p>}
        </div>

        {/* Check-in / Check-out */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Check In Time</Label>
            <div className="flex gap-2 items-center">
              <Controller
                control={control}
                name="checkIn"
                render={({ field }) => (
                  <Input
                    type="time"
                    disabled={lockEdit}
                    pattern="^([01]\d|2[0-3]):([0-5][05])$"
                    {...field}
                    value={field.value || ""}
                  />
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Check Out Time</Label>
            <div className="flex gap-2 items-center">
              <Controller
                control={control}
                name="checkOut"
                render={({ field }) => (
                  <Input
                    type="time"
                    disabled={lockEdit}
                    pattern="^([01]\d|2[0-3]):([0-5][05])$"
                    {...field}
                    value={field.value || ""}
                  />
                )}
              />
            </div>
          </div>
        </div>

        {/* Break time and travel allowance */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="breakTime">Break Time (minutes)</Label>
            <div className="flex mt-2 items-center">
              <Controller
                control={control}
                name="breakTime"
                render={({ field }) => (
                  <Input
                    type="number"
                    disabled={lockEdit}
                    min={0}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    value={field.value || ""}
                  />
                )}
              />
            </div>
            {errors.breakTime && (
              <p className="error">{errors.breakTime.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="travelAllowance">Travel Allowance (Rs)</Label>
            <div className="flex mt-2 items-center">
              <Controller
                control={control}
                name="travelAllowance"
                render={({ field }) => (
                  <Input
                    type="number"
                    disabled={lockEdit}
                    step="0.01"
                    min={0}
                    {...field}
                    value={field.value || ""}
                  />
                )}
              />
            </div>
            {errors.travelAllowance && (
              <p className="error">{errors.travelAllowance.message}</p>
            )}
          </div>
        </div>

        {/* Hours Worked Preview */}
        {watchCheckIn && watchCheckOut && (
          <div className="p-3 bg-primary/15 rounded-lg">
            <p className="text-sm">
              <span className="text-muted-foreground">Hours Worked:</span>{" "}
              <span className="font-medium">{hours} hours</span>
            </p>
          </div>
        )}

        {/* Site Select */}
        <div className="space-y-2">
          <Label htmlFor="siteSelect">Site</Label>
          <Controller
            control={control}
            name="siteId"
            render={({ field }) => (
              <Select
                disabled={lockEdit}
                onValueChange={(val) => {
                  if (val === "12") {
                    form.setValue("checkIn", "00:00");
                    form.setValue("checkOut", "00:00");
                  }
                  return field.onChange(val ? Number(val) : undefined);
                }}
                value={field.value ? String(field.value) : ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((site) => (
                    <SelectItem key={site.id} value={`${site.id}`}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.siteId && <p className="error">{errors.siteId.message}</p>}
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Controller
            control={control}
            name="notes"
            render={({ field }) => (
              <Textarea
                {...field}
                value={field.value ?? ""}
                placeholder="Add any notes..."
              />
            )}
          />
        </div>

        <Button type="submit" className="w-full">
          {attendanceRecord ? "Update Attendance" : "Save Attendance"}
        </Button>
      </form>
    </div>
  );
}
