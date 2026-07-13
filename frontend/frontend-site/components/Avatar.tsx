"use client";

import { initials } from "@/lib/useUser";
import type { UserResponse } from "@/lib/api";

export default function Avatar({
  user,
  size = 40,
}: {
  user: UserResponse | null;
  size?: number;
}) {
  const dimension = { width: size, height: size };

  if (user?.profileImageUrl) {
    return (
      <img
        src={user.profileImageUrl}
        alt={user.fullName}
        style={dimension}
        className="rounded-full object-cover ring-1 ring-gold/40"
      />
    );
  }

  return (
    <span
      style={{ ...dimension, fontSize: Math.round(size * 0.36) }}
      className="grid place-items-center rounded-full bg-gold/15 text-gold font-semibold ring-1 ring-gold/40 select-none"
    >
      {initials(user?.fullName) || "·"}
    </span>
  );
}
