import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { UserRole } from "@/models/User";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  orgSlug: string | null;
}

interface SessionUiState {
  user: SessionUser | null;
  setUser: (user: SessionUser | null) => void;
  clearUser: () => void;
}

// UI-only mirror of the session, populated from the login API's JSON
// response. Never the source of truth for access control — that's always
// the httpOnly acn_session cookie, checked by middleware.ts and the
// lib/auth/session.ts helpers. Kept as a separate store/key from
// lib/store.ts's acn-assessment-store so the two concerns stay independent.
export const useSessionStore = create<SessionUiState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: "acn-session-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
