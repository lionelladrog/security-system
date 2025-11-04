"use client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import userStore from "@/store/userStore";

export const Header = () => {
  const user = userStore((state) => state.user);

  return (
    <div className="">
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <SidebarTrigger />

            <div className="flex-1">
              <h1>Dashboard</h1>
            </div>
            <div>
              <p className="text-muted-foreground">
                Welcome back, {user?.firstName + " " + user?.lastName}
              </p>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};
