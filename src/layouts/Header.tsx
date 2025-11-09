"use client";
import { useState } from "react";
import { Menu } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import userStore from "@/store/userStore";
import { MobileMenu } from "./mobileMenu";

export const Header = () => {
  const user = userStore((state) => state.user);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="">
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <SidebarTrigger />
            </div>
            <button
              onClick={() => setMenuOpen(true)}
              className="block sm:hidden p-2 rounded-md hover:bg-gray-200"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>

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
      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
    </div>
  );
};
