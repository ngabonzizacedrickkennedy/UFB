export type RegisterRequest = { email: string; fullName: string; password: string };

export type UserResponse = {
  id: number;
  email: string;
  fullName: string;
  role: "USER" | "ADMIN";
  enabled: boolean;
  createdAt: string;
};

export type ApiError = { status: number; message: string; fields?: Record<string, string> };

export async function registerUser(body: RegisterRequest): Promise<UserResponse> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw { status: res.status, message: data.message ?? "Request failed", fields: data.fields } as ApiError;
  }
  return data as UserResponse;
}
