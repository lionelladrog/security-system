import React from "react";
import { Badge } from "@/components/ui/badge";

const siteColors: Record<string, string> = {
  "London PAS": "bg-sky-100 text-sky-800",
  "London MHG": "bg-blue-100 text-blue-800",
  "London VAC": "bg-fuchsia-100 text-fuchsia-800",
  "Garage CDD": "bg-indigo-100 text-indigo-800",
  "BGN CPE": "bg-purple-100 text-purple-800",
  "SPM PL": "bg-pink-100 text-pink-800",
  "Crown Court FL": "bg-indigo-100 text-indigo-800",
  "Shell CPE": "bg-orange-100 text-orange-800",
  "Shell FL": "bg-teal-100 text-teal-800",
  GCC: "bg-orange-100 text-orange-800",
  Off: "bg-gray-100 text-gray-800",
};

interface SiteBadgeProps {
  site: string;
}

export const SiteBadge: React.FC<SiteBadgeProps> = ({ site }) => {
  const colorClass = siteColors[site] || "bg-gray-100 text-gray-800";

  return (
    <Badge
      variant="outline"
      className={`${colorClass} border-transparent my-[2px] mx-[2px]`}
    >
      {site}
    </Badge>
  );
};
