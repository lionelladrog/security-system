"use client";
import { useState, useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
} from "../components/ui/sidebar";

import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { LogOut } from "lucide-react";
import { MenuItem } from "../type/declarations/menu.type";
import Image from "next/image";
import { menuItems } from "../constant/menu";
import userStore from "../store/userStore";
import { User } from "../type";
import { trpc } from "../lib/trpc";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export const LeftSidebar = () => {
  const router = useRouter();
  const user = userStore((state) => state.user);
  const clearUser = userStore((state) => state.clearUser);

  const logout = trpc.auth.logout.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Logged out successfully");
        clearUser();
        router.push("/login");
      }
    },
  });

  const [userInitials, setUserInitials] = useState<string>("");
  const [activeView, setActiveView] = useState<number | undefined>(undefined);
  const [User, setUser] = useState<User>({
    id: 0,
    firstName: "",
    lastName: "",
    email: "",
  });

  useEffect(() => {
    if (user) {
      setUser(user);
      const userInitials =
        (user.firstName ? user.firstName[0].toUpperCase() : "") +
        (user.lastName ? user.lastName[0].toUpperCase() : "");
      setUserInitials(userInitials);
    }
  }, [user]);

  const pathname = usePathname();

  useEffect(() => {
    const found = menuItems.find(
      (item) =>
        item.url === pathname || item.children?.some((c) => c.url === pathname)
    );
    if (found) setActiveView(found.id);
  }, [pathname]);

  const handleClick = (item: MenuItem) => {
    setActiveView(item.id);
    if (!item.url && item.children?.[0]) {
      item = item.children[0];
    }
    router.push(item.url?.toString() || "/");
  };
  const handleLogout = async () => {
    logout.mutate();
  };

  return (
    <div>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-8  py-2">
              <div className=" flex items-center justify-center">
                <Link href="/dashboard">
                  <Image
                    src="/logo.png"
                    alt="alt"
                    width={180}
                    height={50}
                    priority
                    style={{ width: "auto", height: "50px" }}
                  />
                </Link>
              </div>
              {/* <SidebarTrigger /> */}
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => handleClick(item)}
                        isActive={item.id === activeView}
                        className=" "
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                      {item.id === activeView && (
                        <SidebarMenuSub>
                          {item.children?.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.id}>
                              <SidebarMenuSubButton
                                onClick={() => handleClick(subItem)}
                                isActive={item.id === activeView}
                              >
                                <subItem.icon className="h-4 w-4" />
                                <span>{subItem.label}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <div className="flex items-center gap-3  py-2">
                  <Avatar>
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">
                      {User.firstName + " " + User.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {User.email}
                    </p>
                  </div>
                </div>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
      </SidebarProvider>
    </div>
  );
};
