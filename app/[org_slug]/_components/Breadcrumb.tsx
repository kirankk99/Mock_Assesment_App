"use client";

import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const LABELS: Record<string, string> = {
  home: "Home",
  dashboard: "Dashboard",
  settings: "Settings",
  reports: "Reports",
  help: "Help",
  feedback: "Help & Feedback",
  administration: "Administration",
};

export default function Breadcrumb({ orgSlug }: { orgSlug: string }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean).slice(1); // drop org_slug

  const crumbs = segments.reduce<string[]>((acc, seg) => {
    if (seg === "help" && segments[segments.indexOf(seg) + 1] === "feedback") {
      return acc; // collapse "help/feedback" into a single "Help & Feedback" crumb
    }
    if (seg === "feedback" && segments.includes("help")) {
      acc.push(LABELS.feedback);
      return acc;
    }
    acc.push(LABELS[seg] ?? seg);
    return acc;
  }, []);

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <span>{orgSlug}</span>
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-2">
          <ChevronRight size={14} className="breadcrumb-sep" />
          <span className={i === crumbs.length - 1 ? "breadcrumb-current" : undefined}>
            {crumb}
          </span>
        </span>
      ))}
    </nav>
  );
}
