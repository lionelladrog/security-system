import { MenuItem } from "../type/declarations/menu.type";
import {
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  Settings,
  Users,
} from "lucide-react";

export const menuItems: MenuItem[] = [
  {
    id: 1,
    label: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: 2,
    label: "Staff Attendance",
    url: "/attendance",
    icon: Users,
  },
  {
    id: 3,
    label: "Reports",
    icon: BarChart3,
    children: [
      {
        id: 5,
        label: "Attendance",
        url: "/reports/attendance",
        icon: ClipboardList,
      },
    ],
  },
  {
    id: 4,
    label: "Settings",
    url: "/settings",
    icon: Settings,
  },
];
