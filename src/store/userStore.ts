import { create } from "zustand";
import { User, UserState } from "../type/declarations/user.type";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

const userStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isLogin: false,
        setUser: (user: User) => set({ user }),
        clearUser: () => void set({ user: null }),
      }),
      {
        name: "user-storage",
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
);

export default userStore;
