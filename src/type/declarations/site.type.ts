import { Site } from "@/server/db/schema";

export interface SiterState {
  site: Site[] | null;
  setSite: (site: Site[]) => void;
}

// export interface Site {
//   id: number;
//   name: string;
//   geolocation?: string | null;
//   owner_id?: number | null;
// }

export type { Site };

export type NewSite = Omit<Site, "id">;
