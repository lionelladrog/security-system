"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { trpc } from "./trpc";
import { ReactNode, useState } from "react";

function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  if (process.env.PROD_URL) return `https://${process.env.PROD_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export function TRPCProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          async fetch(input, init) {
            const headers = new Headers(init?.headers);
            if (!headers.has("Content-Type")) {
              headers.set("Content-Type", "application/json");
            }

            let response = await fetch(input, {
              ...init,
              credentials: "include",
              headers,
            });

            if (response.status === 401) {
              console.warn(
                "[tRPC] Access token expired. Attempting refresh..."
              );

              const refreshResponse = await fetch(
                `${getBaseUrl()}/api/trpc/auth.refreshToken`,
                {
                  method: "POST",
                  credentials: "include",
                  headers: { "Content-Type": "application/json" },
                }
              );

              if (refreshResponse.ok) {
                console.info("[tRPC] Token refreshed. Retrying request...");

                response = await fetch(input, {
                  ...init,
                  credentials: "include",
                });
              } else {
                console.error("[tRPC] Token refresh failed.");
              }
            }

            return response;
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
