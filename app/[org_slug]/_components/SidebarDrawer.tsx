"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutDashboard,
  Settings,
  BarChart3,
  HelpCircle,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import type { UserRole } from "@/models/User";

interface NavLink {
  href: string;
  label: string;
  icon: typeof Home;
  roles?: UserRole[];
}

const LINKS: NavLink[] = [
  { href: "home", label: "Home", icon: Home },
  { href: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "settings", label: "Settings", icon: Settings },
  { href: "reports", label: "Reports", icon: BarChart3 },
  { href: "help", label: "Help", icon: HelpCircle },
  { href: "help/feedback", label: "Help & Feedback", icon: MessageSquare },
  { href: "administration", label: "Administration", icon: ShieldCheck, roles: ["ORG_ADMIN"] },
];

interface SidebarDrawerProps {
  open: boolean;
  onClose: () => void;
  orgSlug: string;
  role: UserRole;
}

export default function SidebarDrawer({ open, onClose, orgSlug, role }: SidebarDrawerProps) {
  const pathname = usePathname();
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (open) firstLinkRef.current?.focus();
  }, [open]);

  const visibleLinks = LINKS.filter((link) => !link.roles || link.roles.includes(role));

  return (
    <>
      <div
        className={`drawer-backdrop ${open ? "open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div className={`drawer-panel ${open ? "open" : ""}`} aria-hidden={!open}>
        <div className="drawer-header">
          <span className="font-semibold">{orgSlug}</span>
        </div>
        <nav className="drawer-nav">
          {visibleLinks.map((link, i) => {
            const href = `/${orgSlug}/${link.href}`;
            const isActive = pathname === href;
            const Icon = link.icon;
            return (
              <a
                key={link.href}
                ref={i === 0 ? firstLinkRef : undefined}
                href={href}
                className={`drawer-link ${isActive ? "active" : ""}`}
                tabIndex={open ? 0 : -1}
              >
                <Icon size={18} />
                {link.label}
              </a>
            );
          })}
        </nav>
      </div>
    </>
  );
}
