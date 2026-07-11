export type RegisterRequest = { email: string; fullName: string; password: string };
export type LoginRequest = { email: string; password: string };
export type ClaimRequest = { email: string; claimToken: string; newPassword: string };
export type CreateAdminRequest = { email: string; fullName: string; password: string };
export type ResetPasswordRequest = { email: string; resetToken: string; newPassword: string };
export type VerifyEmailRequest = { email: string; verificationToken: string };

export type UserResponse = {
  id: number;
  email: string;
  fullName: string;
  role: "USER" | "ADMIN";
  enabled: boolean;
  createdAt: string;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
};

export type LoginResponse = {
  twoFactorRequired: boolean;
  auth: AuthResponse | null;
};

export type ApiError = { status: number; message: string; fields?: Record<string, string> };
export type ClaimStatusResponse = { needsClaim: boolean };

const ACCESS_KEY = "ufb_access";
const REFRESH_KEY = "ufb_refresh";
const USER_KEY = "ufb_user";

function getAccess(): string | null {
  return typeof window === "undefined" ? null : localStorage.getItem(ACCESS_KEY);
}
function getRefresh(): string | null {
  return typeof window === "undefined" ? null : localStorage.getItem(REFRESH_KEY);
}
function storeAuth(auth: AuthResponse) {
  localStorage.setItem(ACCESS_KEY, auth.accessToken);
  localStorage.setItem(REFRESH_KEY, auth.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
}

export function logout() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

export function currentUser(): UserResponse | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as UserResponse) : null;
}

export function isLoggedIn(): boolean {
  return !!getAccess();
}

async function parse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw {
      status: res.status,
      message: (data as ApiError).message ?? "Request failed",
      fields: (data as ApiError).fields,
    } as ApiError;
  }
  return data as T;
}

async function postPublic<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parse<T>(res);
}

export function registerUser(body: RegisterRequest): Promise<UserResponse> {
  return postPublic<UserResponse>("/api/auth/register", body);
}

export async function loginUser(body: LoginRequest): Promise<LoginResponse> {
  const result = await postPublic<LoginResponse>("/api/auth/login", body);
  if (!result.twoFactorRequired && result.auth) {
    storeAuth(result.auth);
  }
  return result;
}

export async function verifyTwoFactor(email: string, code: string): Promise<AuthResponse> {
  const auth = await postPublic<AuthResponse>("/api/auth/verify-2fa", { email, code });
  storeAuth(auth);
  return auth;
}

export function resendTwoFactor(email: string): Promise<{ message: string }> {
  return postPublic<{ message: string }>("/api/auth/resend-2fa", { email });
}

export async function claimAccount(body: ClaimRequest): Promise<AuthResponse> {
  const auth = await postPublic<AuthResponse>("/api/auth/claim", body);
  storeAuth(auth);
  return auth;
}

export async function claimStatus(): Promise<ClaimStatusResponse> {
  return parse<ClaimStatusResponse>(await fetch("/api/auth/claim-status"));
}

export function forgotPassword(email: string): Promise<{ message: string }> {
  return postPublic<{ message: string }>("/api/auth/forgot-password", { email });
}

export async function resetPassword(body: ResetPasswordRequest): Promise<AuthResponse> {
  const auth = await postPublic<AuthResponse>("/api/auth/reset-password", body);
  storeAuth(auth);
  return auth;
}

export async function checkEmailDeliverable(email: string): Promise<boolean> {
  const res = await fetch(`/api/auth/email-check?email=${encodeURIComponent(email)}`);
  const data = await parse<{ deliverable: boolean }>(res);
  return data.deliverable;
}

export async function verifyEmail(body: VerifyEmailRequest): Promise<AuthResponse> {
  const auth = await postPublic<AuthResponse>("/api/auth/verify-email", body);
  storeAuth(auth);
  return auth;
}

export function resendVerification(email: string): Promise<{ message: string }> {
  return postPublic<{ message: string }>("/api/auth/resend-verification", { email });
}

async function tryRefresh(): Promise<boolean> {
  const refreshToken = getRefresh();
  if (!refreshToken) return false;
  try {
    const auth = await postPublic<AuthResponse>("/api/auth/refresh", { refreshToken });
    storeAuth(auth);
    return true;
  } catch {
    logout();
    return false;
  }
}

async function authFetch(path: string, init: RequestInit, retry = true): Promise<Response> {
  const token = getAccess();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body) headers.set("Content-Type", "application/json");

  const res = await fetch(path, { ...init, headers });

  if (res.status === 401 && retry) {
    const refreshed = await tryRefresh();
    if (refreshed) return authFetch(path, init, false);
  }
  return res;
}

async function authGet<T>(path: string): Promise<T> {
  return parse<T>(await authFetch(path, { method: "GET" }));
}
async function authSend<T>(path: string, method: string, body?: unknown): Promise<T> {
  return parse<T>(
    await authFetch(path, { method, body: body ? JSON.stringify(body) : undefined })
  );
}

export function listUsers(): Promise<UserResponse[]> {
  return authGet<UserResponse[]>("/api/admin/users");
}
export function disableUser(id: number): Promise<UserResponse> {
  return authSend<UserResponse>(`/api/admin/users/${id}/disable`, "PATCH");
}
export function enableUser(id: number): Promise<UserResponse> {
  return authSend<UserResponse>(`/api/admin/users/${id}/enable`, "PATCH");
}
export function deleteUser(id: number): Promise<void> {
  return authFetch(`/api/admin/users/${id}`, { method: "DELETE" }).then((res) => {
    if (!res.ok && res.status !== 204) throw { status: res.status, message: "Delete failed" } as ApiError;
  });
}
export function createAdmin(body: CreateAdminRequest): Promise<UserResponse> {
  return authSend<UserResponse>("/api/admin/admins", "POST", body);
}

// ---- consultation-service ----

export type Sector = "RETAIL" | "TECHNOLOGY" | "AGRICULTURE" | "MANUFACTURING" | "FINANCE"
  | "HEALTHCARE" | "EDUCATION" | "HOSPITALITY" | "CONSTRUCTION" | "TRANSPORTATION"
  | "PROFESSIONAL_SERVICES" | "OTHER";
export type Stage = "STARTUP" | "ONGOING" | "SCALING";
export type ConsultationStatus = "PENDING" | "IN_REVIEW" | "ADVISED";

export const SECTORS: Sector[] = [
  "RETAIL", "TECHNOLOGY", "AGRICULTURE", "MANUFACTURING", "FINANCE",
  "HEALTHCARE", "EDUCATION", "HOSPITALITY", "CONSTRUCTION", "TRANSPORTATION",
  "PROFESSIONAL_SERVICES", "OTHER",
];
export const STAGES: Stage[] = ["STARTUP", "ONGOING", "SCALING"];

export type ConsultationSummary = { id: number; status: ConsultationStatus };

export type BusinessResponse = {
  id: number;
  ownerEmail: string;
  name: string;
  sector: Sector;
  stage: Stage;
  description: string;
  needs: string | null;
  consultation: ConsultationSummary | null;
  createdAt: string;
  updatedAt: string;
};

export type BusinessCreateRequest = {
  name: string;
  sector: Sector;
  stage: Stage;
  description: string;
  needs?: string;
};

export type ConsultationMessageResponse = {
  id: number;
  authorEmail: string;
  authorRole: "USER" | "ADMIN";
  body: string;
  createdAt: string;
};

export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

export function listMyBusinesses(): Promise<BusinessResponse[]> {
  return authGet<BusinessResponse[]>("/api/consultation/businesses");
}
export function createBusiness(body: BusinessCreateRequest): Promise<BusinessResponse> {
  return authSend<BusinessResponse>("/api/consultation/businesses", "POST", body);
}
export function getMyBusiness(id: number): Promise<BusinessResponse> {
  return authGet<BusinessResponse>(`/api/consultation/businesses/${id}`);
}
export function updateBusiness(id: number, body: BusinessCreateRequest): Promise<BusinessResponse> {
  return authSend<BusinessResponse>(`/api/consultation/businesses/${id}`, "PUT", body);
}
export function requestConsultation(businessId: number): Promise<void> {
  return authSend<void>(`/api/consultation/businesses/${businessId}/request`, "POST");
}
export function listMessages(businessId: number): Promise<ConsultationMessageResponse[]> {
  return authGet<ConsultationMessageResponse[]>(`/api/consultation/businesses/${businessId}/messages`);
}
export function postMessage(businessId: number, body: string): Promise<ConsultationMessageResponse> {
  return authSend<ConsultationMessageResponse>(`/api/consultation/businesses/${businessId}/messages`, "POST", { body });
}

export type AdminBusinessFilters = { sector?: Sector; stage?: Stage; sort?: string; dir?: "asc" | "desc" };

export function listAllBusinesses(filters: AdminBusinessFilters = {}): Promise<PageResponse<BusinessResponse>> {
  const params = new URLSearchParams();
  if (filters.sector) params.set("sector", filters.sector);
  if (filters.stage) params.set("stage", filters.stage);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.dir) params.set("dir", filters.dir);
  const qs = params.toString();
  return authGet<PageResponse<BusinessResponse>>(`/api/admin/consultation/businesses${qs ? `?${qs}` : ""}`);
}
export function getAdminBusiness(id: number): Promise<BusinessResponse> {
  return authGet<BusinessResponse>(`/api/admin/consultation/businesses/${id}`);
}
export function updateConsultationStatus(consultationId: number, status: ConsultationStatus): Promise<void> {
  return authSend<void>(`/api/admin/consultation/${consultationId}/status`, "PATCH", { status });
}
