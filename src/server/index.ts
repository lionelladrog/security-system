import { router } from "./trpc";

import {
  staffRouter,
  authRouter,
  attendanceRouter,
  siteRouter,
} from "./api/routers";

export const appRouter = router({
  auth: authRouter,
  user: staffRouter,
  attendance: attendanceRouter,
  site: siteRouter,
});

export type AppRouter = typeof appRouter;
