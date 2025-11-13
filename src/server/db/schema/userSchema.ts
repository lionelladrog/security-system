import {
  mysqlTable,
  varchar,
  text,
  timestamp,
  int,
  decimal,
  boolean,
  date,
  time,
  uniqueIndex,
  index,
} from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";

// user table for authentication
export const user = mysqlTable(
  "user",
  {
    id: int("id").primaryKey().autoincrement(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    firstName: varchar("first_name", { length: 255 }).notNull(),
    lastName: varchar("last_name", { length: 255 }).notNull(),
    password: text("password").notNull(),
    role: varchar("role", { length: 50 }).notNull().default("user"), // 'admin', 'user', 'manager'
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull().onUpdateNow(),
    active: boolean("active").notNull().default(true),
  },
  (user) => ({
    emailIndex: uniqueIndex("idx_user_email").on(user.email),
  })
);

// site table
export const site = mysqlTable(
  "site",
  {
    id: int("id").primaryKey().autoincrement(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    geolocation: varchar("geolocation", { length: 255 }),
    ownerID: int("owner_id"),
    active: boolean("active").notNull().default(true),
  },
  (site) => ({
    name: uniqueIndex("idx_site_name").on(site.name),
  })
);

// Staff members table
export const staffMember = mysqlTable(
  "staff_member",
  {
    id: int("id").primaryKey().autoincrement(),
    employeeId: varchar("employee_id", { length: 50 }).notNull().unique(),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).default(""),
    phone: varchar("phone", { length: 20 }),
    position: varchar("position", { length: 100 }),
    department: varchar("department", { length: 100 }),
    hireDate: date("hire_date").default(sql`CURRENT_TIMESTAMP`),
    userId: int("user_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull().onUpdateNow(),
    active: boolean("active").notNull().default(true),
  },
  (staffMember) => ({
    employeeIdIndex: uniqueIndex("idx_staff_members_employee_id").on(
      staffMember.employeeId
    ),
    userIdIndex: index("idx_staff_members_user_id").on(staffMember.userId),
    // emailIndex: uniqueIndex("idx_staff_members_email").on(staffMember.email),
  })
);

// Staff attendance records (for staff management)
export const staffAttendanceRecords = mysqlTable(
  "staff_attendance_record",
  {
    id: int("id").primaryKey().autoincrement(),
    staffId: int("staff_id").notNull(),
    date: date("date").notNull(),
    status: varchar("status", { length: 20 }), // 'present', 'late', 'absent', 'half-day', 'leave'
    checkIn: time("check_in").notNull(),
    checkOut: time("check_out").notNull(),
    breakTime: int("break_time").notNull().default(0), // in minutes
    hours: decimal("hours", { precision: 4, scale: 2 }),
    siteId: int("site_id").notNull(),
    travelAllowance: decimal("travel_allowance", {
      precision: 10,
      scale: 2,
    }).default("0"),
    notes: text("notes"),
    hasPendingRequest: boolean("has_pending_request").default(false),
    approvedBy: int("approved_by").notNull(),
    approvedAt: timestamp("approved_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull().onUpdateNow(),
    active: boolean("active").notNull().default(true),
  },
  (staffAttendanceRecords) => ({
    staffIdIndex: index("idx_staff_attendance_records_staff_id").on(
      staffAttendanceRecords.staffId
    ),
    siteIdIndex: index("idx_site_attendance_records_site_id").on(
      staffAttendanceRecords.siteId
    ),
  })
);

// export type StaffAttendanceRecordsInsert = InferInsertModel<
//   typeof staffAttendanceRecords
// >;
// Define relations
export const userRelations = relations(user, ({ many, one }) => ({
  staffMember: one(staffMember, {
    fields: [user.id],
    references: [staffMember.userId],
  }),
  approvedStaffAttendance: many(staffAttendanceRecords),
}));

export const staffMemberRelations = relations(staffMember, ({ many, one }) => ({
  user: one(user, {
    fields: [staffMember.userId],
    references: [user.id],
  }),
  attendanceRecords: many(staffAttendanceRecords),
}));

export const staffAttendanceRecordsRelations = relations(
  staffAttendanceRecords,
  ({ one }) => ({
    staff: one(staffMember, {
      fields: [staffAttendanceRecords.staffId],
      references: [staffMember.id],
    }),

    site: one(site, {
      fields: [staffAttendanceRecords.siteId],
      references: [site.id],
    }),
    approver: one(user, {
      fields: [staffAttendanceRecords.approvedBy],
      references: [user.id],
    }),
  })
);

// Type exports for TypeScript
export type User = typeof user.$inferSelect;
export type Site = typeof site.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export type StaffMember = typeof staffMember.$inferSelect;
export type NewStaffMember = typeof staffMember.$inferInsert;

export type StaffAttendanceRecord = typeof staffAttendanceRecords.$inferSelect;
export type NewStaffAttendanceRecord =
  typeof staffAttendanceRecords.$inferInsert;
