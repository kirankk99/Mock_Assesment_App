"use client";

import { useRouter } from "next/navigation";
import { useSessionStore } from "@/lib/sessionStore";

export default function LogoutButton() {
  const router = useRouter();
  const clearUser = useSessionStore((s) => s.clearUser);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    clearUser();
    router.push("/login");
  }

  return (
    <button className="btn btn-secondary" onClick={handleLogout}>
      Log Out
    </button>
  );
}
