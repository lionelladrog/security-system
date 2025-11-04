import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server";
import { createContext } from "@/server/context";

const handler = (req: Request) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
    req,
  });
};

export { handler as GET, handler as POST, handler as PUT, handler as DELETE };
