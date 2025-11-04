import { z } from "zod";
import { NewStaffMember } from "@/server/db/schema";
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  role?: "admin" | "editor" | "viewer";
  created_at?: string;
  updated_at?: string;
  active?: boolean;
}
export interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export interface StaffMember {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  site: string;
}

export const staffMemberchema = z.object({
  id: z.number().optional().nullable(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.enum(["admin", "editor", "viewer"]).optional(),
  employeeId: z.string(),
  phone: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  hireDate: z.date().optional().nullable(),
  userId: z.number(),
  active: z.boolean().optional(),
});

export type { NewStaffMember };
