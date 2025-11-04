import { LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";
export interface MenuItem {
  id: number;
  label: string;
  url?: string;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  children?: MenuItem[];
}
