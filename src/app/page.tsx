"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import userStore from "@/store/userStore";
import { Toaster } from "@/components/ui/sonner";

export default function Home() {
  const user = userStore((state) => state.user);
  const [hasHydrated, setHasHydrated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsub = userStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });

    if (userStore.persist.hasHydrated()) {
      setHasHydrated(true);
    }

    return () => unsub();
  }, []);

  useEffect(() => {
    if (hasHydrated) {
      if (!user) {
        router.replace("/login");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [hasHydrated, user, router]);

  if (!hasHydrated) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
    </>
  );
}
