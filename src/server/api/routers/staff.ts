import { router, protectedProcedure } from "../../trpc";
import { staffMember, NewStaffMember } from "../../db/schema/userSchema";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import type { DrizzleError } from "drizzle-orm";
import { staffMemberchema } from "@/type/declarations/user.type";

export const staffRouter = router({
  getSatffs: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .select()
      .from(staffMember)
      .where(eq(staffMember.active, true))
      .orderBy(desc(staffMember.id));
  }),

  addStaff: protectedProcedure
    .input(staffMemberchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await ctx.db
          .insert(staffMember)
          .values(input as NewStaffMember);
        return { success: true, data: result };
      } catch (error) {
        const err = error as DrizzleError;
        let mysqlErr = undefined;
        if (
          err.cause &&
          typeof err.cause === "object" &&
          "sqlMessage" in err.cause
        ) {
          mysqlErr = err.cause as { sqlMessage: string; code?: string };
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: mysqlErr?.sqlMessage || "Failed to add staff member",
          cause: mysqlErr?.code,
        });
      }
    }),
});
