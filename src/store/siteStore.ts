import { create } from "zustand";
import { Site, SiterState } from "../type";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

const siteStore = create<SiterState>()(
  devtools(
    persist(
      (set) => ({
        site: [],
        setSite: (site: Site[]) => set({ site: site }),
      }),
      {
        name: "site-storage",
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
);

export default siteStore;
