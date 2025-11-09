import { NewStaffAttendanceRecord } from "@/server/db/schema";
import { z } from "zod";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import { LucideProps } from "lucide-react";

export const newStaffAttendanceRecordZod = z.object({
  id: z.number().optional(),
  date: z.coerce.date().default(() => new Date()),
  staffId: z.number().min(1, "Please select a staff member"),
  status: z.string().optional().nullable().default("absent"),
  checkIn: z.string().min(1, "Please select Check In time"),
  checkOut: z.string().min(1, "Please select Check Out time"),
  breakTime: z
    .number()
    .min(0, "Break time cannot be negative")
    .max(480, "Break time cannot exceed 8 hours")
    .default(0),
  travelAllowance: z.string().nullable().optional().default("0"),
  siteId: z.number().min(1, "Please select a site"),
  notes: z.string().nullable().optional(),
  hours: z.string().nullable().optional(),
  approvedBy: z.number(),
  approvedAt: z.coerce.date().default(() => new Date()),
  hasPendingRequest: z.boolean().nullable().optional().default(false),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  active: z.boolean().optional().default(true),
});

export interface AttendanceTableRecord extends NewStaffAttendanceRecord {
  employeeId: string;
  firstName: string;
  lastName: string;
  site: string;
}
export interface AttendanceStatsReport {
  staffId: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  status?: string;
  sumPresent?: number;
  sumAbsent?: number;
  sumLate?: number;
  sumHours?: number;
  avgHours?: number;
  sumTravelAllowance?: number;
  attendanceRate?: number;
  sites?: string;
  siteId?: number;
  hours?: number;
}

export interface AttendanceDailyStats {
  title: string;
  value: string;
  total: string;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  color: string;
  bgColor: string;
}

export interface AttendanceStatsResponse {
  totalRecords: number;
  totalDays: number;
  results: AttendanceStatsReport[];
}

export type NewStaffAttendanceRecordForm = z.infer<
  typeof newStaffAttendanceRecordZod
>;
export type { NewStaffAttendanceRecord };

export interface StaffAttendanceRecord {
  staffId: number;
  date: string;
  status: "present" | "absent" | "late";
  checkIn?: string;
  checkOut?: string;
  breakTime?: number;
  travelAllowance?: number;
  hours?: number;
  site?: string;
  notes?: string;
  hasPendingRequest?: boolean;
}

export interface AttendanceRecord {
  id: number;
  date: string;
  checkIn: string;
  checkOut: string;
  status: string;
  hours: string;
  notes: string;
}

export type StatAccumulator = {
  presentCount: number;
  lateCount: number;
  absentCount: number;
  total: number;
};
