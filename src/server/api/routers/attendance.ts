import { router, protectedProcedure, errorHandler } from "../../trpc";
import { z } from "zod";
import {
  site,
  staffAttendanceRecords,
  staffMember,
} from "../../db/schema/userSchema";
import { eq, gte, lte, and, sql, getTableColumns, SQL, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { newStaffAttendanceRecordZod } from "@/type";
import { format } from "date-fns";

const attendanceCriteriaSchema = z.object({
  employee: z.string().optional(),
  date: z
    .string()
    .transform((str) => new Date(str))
    .optional(),

  date_from: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
  date_to: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
  month: z.string().optional(),
  siteId: z.number().optional(),
});

export const attendanceRouter = router({
  get: protectedProcedure
    .input(attendanceCriteriaSchema)
    .query(async ({ ctx, input }) => {
      try {
        const now = new Date();
        const year = now.getFullYear();
        const conditions = [
          eq(staffAttendanceRecords.active, true),
          "employee" in input && input.employee
            ? or(
                sql`LOWER(${
                  staffMember.employeeId
                }) LIKE LOWER(${`%${input.employee}%`})`,
                sql`LOWER(${
                  staffMember.firstName
                }) LIKE LOWER(${`%${input.employee}%`})`,
                sql`LOWER(${
                  staffMember.lastName
                }) LIKE LOWER(${`%${input.employee}%`})`
              )
            : undefined,
          "date" in input &&
          input.date &&
          !("date_from" in input) &&
          !("date_to" in input)
            ? sql`${staffAttendanceRecords.date} = ${format(
                input.date,
                "yyyy-MM-dd"
              )}`
            : undefined,
          "date_from" in input && input.date_from
            ? gte(
                staffAttendanceRecords.date,
                sql`${format(input.date_from, "yyyy-MM-dd")}`
              )
            : undefined,

          "date_to" in input && input.date_to
            ? lte(
                staffAttendanceRecords.date,
                sql`${format(input.date_to, "yyyy-MM-dd")}`
              )
            : undefined,
          "siteId" in input && input.siteId
            ? eq(staffAttendanceRecords.siteId, input.siteId)
            : undefined,
        ].filter(Boolean);

        if (
          "month" in input &&
          input.month &&
          !("date_from" in input) &&
          !("date_to" in input) &&
          !("date" in input)
        ) {
          const month = parseInt(input.month);
          conditions.push(
            sql`EXTRACT(YEAR FROM ${staffAttendanceRecords.updatedAt}) = ${year}`,
            sql`EXTRACT(MONTH FROM ${staffAttendanceRecords.updatedAt}) = ${month}`
          );
        }

        if (Object.keys(input).length === 0) {
          const now = new Date();
          const year = now.getFullYear();

          conditions.push(
            eq(sql`EXTRACT(YEAR FROM ${staffAttendanceRecords.date})`, year)
          );
        }

        const res = await ctx.db
          .select({
            ...getTableColumns(staffAttendanceRecords),
            employeeId: staffMember.employeeId,
            firstName: staffMember.firstName,
            lastName: staffMember.lastName,
            site: site.name,
          })
          .from(staffAttendanceRecords)
          .innerJoin(
            staffMember,
            and(
              eq(staffMember.id, staffAttendanceRecords.staffId),
              eq(staffMember.active, true)
            )
          )
          .innerJoin(site, and(eq(site.id, staffAttendanceRecords.siteId)))
          .orderBy(staffAttendanceRecords.id)
          .where(and(...conditions));

        return res;
      } catch (error) {
        errorHandler(error);
      }
    }),

  getAttendanceReport: protectedProcedure
    .input(attendanceCriteriaSchema)
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const year = now.getFullYear();
      try {
        const conditions = [
          eq(staffAttendanceRecords.active, true),
          "employee" in input && input.employee
            ? or(
                sql`LOWER(${
                  staffMember.employeeId
                }) LIKE LOWER(${`%${input.employee}%`})`,
                sql`LOWER(${
                  staffMember.firstName
                }) LIKE LOWER(${`%${input.employee}%`})`,
                sql`LOWER(${
                  staffMember.lastName
                }) LIKE LOWER(${`%${input.employee}%`})`
              )
            : undefined,
          "date_from" in input && input.date_from
            ? gte(
                staffAttendanceRecords.date,
                sql`${format(input.date_from, "yyyy-MM-dd")}`
              )
            : undefined,

          "date_to" in input && input.date_to
            ? lte(
                staffAttendanceRecords.date,
                sql`${format(input.date_to, "yyyy-MM-dd")}`
              )
            : undefined,
          "siteId" in input && input.siteId
            ? eq(staffAttendanceRecords.siteId, input.siteId)
            : undefined,
        ].filter(Boolean);

        if (
          "month" in input &&
          input.month &&
          !("date_from" in input) &&
          !("date_to" in input) &&
          !("date" in input)
        ) {
          const month = parseInt(input.month);
          conditions.push(
            sql`EXTRACT(YEAR FROM ${staffAttendanceRecords.updatedAt}) = ${year}`,
            sql`EXTRACT(MONTH FROM ${staffAttendanceRecords.updatedAt}) = ${month}`
          );
        }

        if (Object.keys(input).length === 0) {
          const now = new Date();
          const year = now.getFullYear();
          conditions.push(
            eq(sql`EXTRACT(YEAR FROM ${staffAttendanceRecords.date})`, year)
          );
        }

        let totalDays: number | SQL = sql`0`;
        if (input.date_from && input.date_to) {
          const dateFrom = new Date(input.date_from);
          const dateTo = new Date(input.date_to);

          const diffTime = dateTo.getTime() - dateFrom.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

          totalDays = diffDays;
        } else {
          const daysSinceMinDateQuery = await ctx.db
            .select({
              daysSinceMin: sql<number>`DATEDIFF(CURRENT_DATE, MIN(${staffAttendanceRecords.date})) + 1`,
            })
            .from(staffAttendanceRecords)
            .innerJoin(
              staffMember,
              eq(staffMember.id, staffAttendanceRecords.staffId)
            )
            .where(and(...conditions));

          totalDays = daysSinceMinDateQuery[0]?.daysSinceMin ?? 0;
        }

        const countQuery = await ctx.db
          .select({
            totalRecords: sql<number>`COUNT(*)`.as("totalRecords"),
          })
          .from(staffAttendanceRecords)
          .innerJoin(
            staffMember,
            eq(staffMember.id, staffAttendanceRecords.staffId)
          )
          .innerJoin(site, eq(site.id, staffAttendanceRecords.siteId))
          .where(and(...conditions))
          .execute();

        const totalRecords = countQuery[0]?.totalRecords ?? 0;

        const results = await ctx.db
          .select({
            ...getTableColumns(staffAttendanceRecords),
            staffId: staffAttendanceRecords.staffId,
            employeeId: staffMember.employeeId,
            firstName: staffMember.firstName,
            lastName: staffMember.lastName,
            // totalDays: totalDays,
            sumPresent: sql`SUM(CASE WHEN ${staffAttendanceRecords.status} = 'present' THEN 1 ELSE 0 END)`,
            sumAbsent: sql`SUM(CASE WHEN ${staffAttendanceRecords.status} = 'absent' THEN 1 ELSE 0 END)`,
            sumLate: sql`SUM(CASE WHEN ${staffAttendanceRecords.status} = 'late' THEN 1 ELSE 0 END)`,
            sumHours: sql`SUM(${staffAttendanceRecords.hours})`,
            avgHours: sql`AVG(${staffAttendanceRecords.hours})`,
            sumTravelAllowance: sql`SUM(${staffAttendanceRecords.travelAllowance})`,
            sites: sql`GROUP_CONCAT(DISTINCT ${site.name} SEPARATOR ', ')`,
            site: site.name,
            attendanceRate: sql`
            COALESCE(
              (SUM(CASE WHEN ${staffAttendanceRecords.status} = 'present' THEN 1 ELSE 0 END)
              + SUM(CASE WHEN ${staffAttendanceRecords.status} = 'late' THEN 1 ELSE 0 END))
              / NULLIF(${totalDays},0), 0
            )
          `,
          })
          .from(staffAttendanceRecords)
          .innerJoin(
            staffMember,
            eq(staffMember.id, staffAttendanceRecords.staffId)
          )
          .innerJoin(site, eq(site.id, staffAttendanceRecords.siteId))
          .where(and(...conditions))
          .groupBy(
            staffAttendanceRecords.staffId,
            staffMember.employeeId,
            staffMember.firstName,
            staffMember.lastName
          );

        return {
          totalRecords,
          totalDays: typeof totalDays === "number" ? totalDays : null,
          results,
        };
      } catch (error) {
        console.error("Error in getAttendanceReport:", error);
        errorHandler(error);
      }
    }),

  add: protectedProcedure
    .input(newStaffAttendanceRecordZod)
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await ctx.db
          .insert(staffAttendanceRecords)
          .values(input);
        return { success: true, data: result };
      } catch (error) {
        errorHandler(error);
      }
    }),

  update: protectedProcedure
    .input(newStaffAttendanceRecordZod)
    .mutation(async ({ input, ctx }) => {
      try {
        if (!input.id) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "ID is required for update",
          });
        }

        const result = await ctx.db
          .update(staffAttendanceRecords)
          .set({
            staffId: input.staffId,
            date: input.date,
            status: input.status,
            checkIn: input.checkIn,
            checkOut: input.checkOut,
            breakTime: input.breakTime,
            hours: input.hours,
            siteId: input.siteId,
            travelAllowance: input.travelAllowance,
            notes: input.notes,
            hasPendingRequest: input.hasPendingRequest,
            approvedBy: input.approvedBy,
            approvedAt: input.approvedAt,
            createdAt: input.createdAt,
            active: input.active,
          })
          .where(
            and(
              eq(staffAttendanceRecords.id, input.id),
              eq(staffAttendanceRecords.active, true)
            )
          );

        return { success: true, data: result };
      } catch (error) {
        errorHandler(error);
      }
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        if (!input.id) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "ID is required for update",
          });
        }

        const result = await ctx.db
          .update(staffAttendanceRecords)
          .set({
            active: false,
          })
          .where(eq(staffAttendanceRecords.id, input.id));

        return { success: true, data: result };
      } catch (error) {
        errorHandler(error);
      }
    }),
});
