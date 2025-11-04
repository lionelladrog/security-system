import { router, protectedProcedure } from "../../trpc";
import { site } from "../../db/schema/userSchema";
import { eq } from "drizzle-orm";

export const siteRouter = router({
  getSites: protectedProcedure.query(async ({ ctx }) => {
    const sites = await ctx.db.select().from(site).where(eq(site.active, true));

    return sites;
  }),
});
