"use client";
import { useEffect, useState } from "react";
import { LeftSidebar } from "./SideBar";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import LoginForm from "@/components/LoginForm";
import { Button } from "@/components/ui/button";
import { Header } from "./Header";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import siteStore from "@/store/siteStore";
import userStore from "@/store/userStore";
export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const user = userStore((state) => state.user);
  const [hydrated, setHydrated] = useState(false);
  const [open, setOpen] = useState(false);
  const [showLoginFrom, setShowLoginFrom] = useState(false);

  const setSite = siteStore((state) => state.setSite);
  const siteQuery = trpc.site.getSites.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const me = trpc.auth.getMe.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    // refetchInterval: 15 * 60 * 1000,
  });

  useEffect(() => {
    if (hydrated && !me.isLoading && me.isFetched) {
      if (!me.data?.userID) {
        setOpen(true);
      } else {
        setOpen(false);
      }
    }
  }, [hydrated, me.data, me.isLoading, me.isFetched]);

  useEffect(() => {
    const unsub = userStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    if (userStore.persist.hasHydrated()) {
      setHydrated(true);
    }

    return () => unsub();
  }, []);

  useEffect(() => {
    if (hydrated && !user) {
      router.replace("/login");
    }
  }, [hydrated, user, router]);

  useEffect(() => {
    if (siteQuery.data) {
      setSite(siteQuery.data);
    }
  }, [siteQuery.data, setSite]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full ">
        <LeftSidebar />

        <div className="flex-1 flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-50">
          <Header />
          {(!hydrated || !user) && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-50">
              Loading...
            </div>
          )}
          <AlertDialog open={open}>
            <AlertDialogContent className="fixed top-1/3 left-1/2 -translate-x-1/2 transform ">
              <div className=" ">
                {showLoginFrom ? (
                  <LoginForm relogin={true} afterLogin={() => setOpen(false)} />
                ) : (
                  <div className="">
                    <div className="text-sm text-center">
                      <AlertDialogTitle className="text-md pb-3">
                        Session Expired
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Your session has expired, please log in again.
                      </AlertDialogDescription>
                    </div>

                    <div className="flex justify-center mt-4">
                      <AlertDialogAction asChild>
                        <Button onClick={() => setShowLoginFrom(true)}>
                          Log In
                        </Button>
                      </AlertDialogAction>
                    </div>
                  </div>
                )}
              </div>
            </AlertDialogContent>
          </AlertDialog>
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 ">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
