"use client";

import { useEffect, useState } from "react";
import { USER_EVENT, currentUser, type UserResponse } from "@/lib/api";

export function useUser(): UserResponse | null {
  const [user, setUser] = useState<UserResponse | null>(null);

  useEffect(() => {
    const sync = () => setUser(currentUser());
    sync();
    window.addEventListener(USER_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(USER_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return user;
}

export function roleLabel(role: UserResponse["role"] | undefined): string {
  return role === "ADMIN" ? "Administrator" : "Member";
}

export function initials(fullName: string | undefined): string {
  if (!fullName) return "";
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
