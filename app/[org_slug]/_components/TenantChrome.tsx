"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useSessionStore } from "@/lib/sessionStore";
import type { SessionPayload } from "@/lib/auth/jwt";
import Navbar from "./Navbar";
import SidebarDrawer from "./SidebarDrawer";
import ProfileDialog from "./ProfileDialog";
import Breadcrumb from "./Breadcrumb";

interface TenantChromeProps {
  session: SessionPayload;
  orgSlug: string;
  children: ReactNode;
}

export default function TenantChrome({ session, orgSlug, children }: TenantChromeProps) {
  const setUser = useSessionStore((s) => s.setUser);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const avatarButtonRef = useRef<HTMLButtonElement>(null);

  // One-time fetch of live profile data (name/avatarUrl can change without a
  // new login, so the JWT-derived `session` prop isn't a live source for
  // them). Fires once per tab, since this layout/component isn't remounted
  // when navigating between tenant pages.
  useEffect(() => {
    fetch("/api/auth/profile")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        setUser({
          id: session.sub,
          name: data.name,
          email: data.email,
          role: data.role,
          orgSlug: session.orgSlug,
          avatarUrl: data.avatarUrl,
        });
      })
      .catch(() => {
        // Transient failure: leave whatever's already in the store; Navbar
        // falls back to the session prop regardless.
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function closeDrawer() {
    setDrawerOpen(false);
    menuButtonRef.current?.focus();
  }

  function closeProfile() {
    setProfileOpen(false);
    avatarButtonRef.current?.focus();
  }

  useEffect(() => {
    if (!drawerOpen && !profileOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (profileOpen) closeProfile();
      else if (drawerOpen) closeDrawer();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawerOpen, profileOpen]);

  return (
    <div>
      <Navbar
        session={session}
        orgSlug={orgSlug}
        drawerOpen={drawerOpen}
        onToggleDrawer={() => setDrawerOpen((v) => !v)}
        onOpenProfile={() => setProfileOpen(true)}
        menuButtonRef={menuButtonRef}
        avatarButtonRef={avatarButtonRef}
      />
      <SidebarDrawer open={drawerOpen} onClose={closeDrawer} orgSlug={orgSlug} role={session.role} />
      <ProfileDialog open={profileOpen} onClose={closeProfile} />
      <div className="container">
        <Breadcrumb orgSlug={orgSlug} />
        <main>{children}</main>
      </div>
    </div>
  );
}
