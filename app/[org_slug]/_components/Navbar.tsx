"use client";

import type { RefObject } from "react";
import { Menu } from "lucide-react";
import { useSessionStore } from "@/lib/sessionStore";
import type { SessionPayload } from "@/lib/auth/jwt";
import LogoutButton from "./LogoutButton";

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

interface NavbarProps {
  session: SessionPayload;
  orgSlug: string;
  drawerOpen: boolean;
  onToggleDrawer: () => void;
  onOpenProfile: () => void;
  menuButtonRef: RefObject<HTMLButtonElement>;
  avatarButtonRef: RefObject<HTMLButtonElement>;
}

export default function Navbar({
  session,
  orgSlug,
  drawerOpen,
  onToggleDrawer,
  onOpenProfile,
  menuButtonRef,
  avatarButtonRef,
}: NavbarProps) {
  // liveUser only overlays fields the JWT doesn't carry (avatarUrl) or that
  // may have changed since login (name) — session is always correct for
  // first paint, so there's no SSR/hydration flash.
  const liveUser = useSessionStore((s) => s.user);
  const displayName = liveUser?.name ?? session.name;
  const avatarUrl = liveUser?.avatarUrl ?? null;

  return (
    <header className="app-header">
      <div className="flex items-center gap-[15px]">
        <button
          ref={menuButtonRef}
          className="icon-btn"
          onClick={onToggleDrawer}
          aria-label={drawerOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={drawerOpen}
        >
          <Menu size={20} />
        </button>
        <h1>{orgSlug}</h1>
      </div>

      <div className="flex items-center gap-[15px]">
        <button
          ref={avatarButtonRef}
          className="avatar"
          onClick={onOpenProfile}
          aria-label="Open profile"
          title={`${displayName} (${session.role})`}
        >
          {avatarUrl ? <img src={avatarUrl} alt="" /> : initials(displayName)}
        </button>
        <span className="hidden sm:inline">{displayName}</span>
        <LogoutButton />
      </div>
    </header>
  );
}
