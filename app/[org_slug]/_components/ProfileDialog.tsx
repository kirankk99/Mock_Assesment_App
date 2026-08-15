"use client";

import { useEffect, useRef, useState } from "react";
import { X, Lock, Camera } from "lucide-react";
import { useSessionStore } from "@/lib/sessionStore";

interface ProfileDialogProps {
  open: boolean;
  onClose: () => void;
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function ProfileDialog({ open, onClose }: ProfileDialogProps) {
  const user = useSessionStore((s) => s.user);
  const setUser = useSessionStore((s) => s.setUser);
  const panelRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState(user?.name ?? "");
  const [nameStatus, setNameStatus] = useState<{ error?: string; success?: string }>({});
  const [nameSaving, setNameSaving] = useState(false);

  const [avatarStatus, setAvatarStatus] = useState<{ error?: string; success?: string }>({});
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<{ error?: string; success?: string }>({});
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(user?.name ?? "");
      setNameStatus({});
      setAvatarStatus({});
      setPasswordStatus({});
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      // Focus the first focusable element in the panel.
      const focusable = panelRef.current?.querySelector<HTMLElement>(
        'button, input, [href], textarea'
      );
      focusable?.focus();
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusables = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input:not(:disabled), [href], textarea'
        )
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (!open || !user) return null;

  async function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNameSaving(true);
    setNameStatus({});
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update name.");
      if (user) setUser({ ...user, name: data.name });
      setNameStatus({ success: "Name updated." });
    } catch (err) {
      setNameStatus({ error: err instanceof Error ? err.message : String(err) });
    } finally {
      setNameSaving(false);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    setAvatarStatus({});
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await fetch("/api/auth/avatar", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload avatar.");
      if (user) setUser({ ...user, avatarUrl: data.avatarUrl });
      setAvatarStatus({ success: "Avatar updated." });
    } catch (err) {
      setAvatarStatus({ error: err instanceof Error ? err.message : String(err) });
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordStatus({});
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ error: "New password and confirmation do not match." });
      return;
    }
    setPasswordSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change password.");
      setPasswordStatus({ success: "Password changed." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordStatus({ error: err instanceof Error ? err.message : String(err) });
    } finally {
      setPasswordSaving(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={panelRef}
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="profile-dialog-title" className="text-lg font-semibold">
            Profile
          </h2>
          <button className="icon-btn text-[#333] hover:bg-black/5" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="center mb-5">
          <label className="avatar avatar-lg mx-auto cursor-pointer" title="Change avatar">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" />
            ) : (
              initials(user.name)
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
              disabled={avatarUploading}
            />
          </label>
          <p className="muted mt-[6px] flex items-center justify-center gap-1">
            <Camera size={14} /> {avatarUploading ? "Uploading..." : "Click avatar to change"}
          </p>
          {avatarStatus.error && <p className="text-error-red text-sm">{avatarStatus.error}</p>}
          {avatarStatus.success && (
            <p className="text-success-green text-sm">{avatarStatus.success}</p>
          )}
        </div>

        <form className="mb-5" onSubmit={handleNameSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="profile-name">
              Name
            </label>
            <input
              id="profile-name"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" value={user.email} disabled />
          </div>
          {nameStatus.error && <p className="text-error-red text-sm mb-[10px]">{nameStatus.error}</p>}
          {nameStatus.success && (
            <p className="text-success-green text-sm mb-[10px]">{nameStatus.success}</p>
          )}
          <button className="btn btn-primary" type="submit" disabled={nameSaving}>
            {nameSaving ? "Saving..." : "Save Profile"}
          </button>
        </form>

        <form className="mb-5 border-t border-border-color pt-5" onSubmit={handlePasswordSubmit}>
          <h3 className="mb-[10px] flex items-center gap-2 text-sm font-semibold">
            <Lock size={16} /> Change Password
          </h3>
          <div className="form-group">
            <label className="form-label" htmlFor="current-password">
              Current Password
            </label>
            <input
              id="current-password"
              type="password"
              className="form-input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="new-password">
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              className="form-input"
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="confirm-password">
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              type="password"
              className="form-input"
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {passwordStatus.error && (
            <p className="text-error-red text-sm mb-[10px]">{passwordStatus.error}</p>
          )}
          {passwordStatus.success && (
            <p className="text-success-green text-sm mb-[10px]">{passwordStatus.success}</p>
          )}
          <button className="btn btn-primary" type="submit" disabled={passwordSaving}>
            {passwordSaving ? "Saving..." : "Change Password"}
          </button>
        </form>

        <div className="border-t border-border-color pt-5">
          <button
            className="btn btn-secondary"
            disabled
            aria-disabled="true"
            title="Coming soon — cross-org impersonation not yet built"
          >
            Log as Admin
          </button>
        </div>
      </div>
    </div>
  );
}
