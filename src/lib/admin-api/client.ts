import {
  AdminAuditLogItem,
  AdminDashboardSummary,
  AdminHealthResponse,
  AdminLoginResponse,
  AdminUser,
  AdminUserDetail,
  AuditLogQueryParams,
  EvaluationDetail,
  EvaluationListItem,
  ImportRunDetail,
  ImportRunListItem,
  InviteAdminUserParams,
  MemberListItem,
  MemberQueryParams,
  PageResponse,
  PlaceDetail,
  PlaceListItem,
  PlaceQueryParams,
  ProviderStatus,
  SyncJob,
  SyncRun,
  UserQueryParams,
} from "./contracts";
import {
  DEMO_AUDIT_LOGS,
  DEMO_EVALUATION_DETAIL,
  DEMO_EVALUATIONS,
  DEMO_HEALTH,
  DEMO_IMPORT_DETAIL,
  DEMO_IMPORTS,
  DEMO_MEMBERS,
  DEMO_PLACE_DETAIL,
  DEMO_PLACES,
  DEMO_PROVIDERS,
  DEMO_SUMMARY,
  DEMO_SYNC_JOBS,
  DEMO_SYNC_RUNS,
  DEMO_USERS,
} from "./demo-data";
import { AdminApiError, NetworkError, NotFoundError } from "./errors";
import { isDashboardSummary, isHealthResponse, isProviderStatus } from "./guards";

const ADMIN_API_URL =
  process.env.NEXT_PUBLIC_ADMIN_API_URL ?? "http://localhost:4100/api/admin";
const PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const IS_DEMO_MODE = process.env.NEXT_PUBLIC_ADMIN_DEMO_MODE === "true";

export function isDemoMode(): boolean {
  return IS_DEMO_MODE;
}

export function getAdminApiUrl(): string {
  return ADMIN_API_URL;
}

export function getPublicApiUrl(): string {
  return PUBLIC_API_URL;
}

async function request<T>(
  path: string,
  options?: {
    params?: Record<string, string | number | boolean | undefined>;
    signal?: AbortSignal;
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    body?: unknown;
  }
): Promise<T> {
  const url = new URL(`${ADMIN_API_URL.replace(/\/$/, "")}${path}`);
  if (options?.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: options?.method ?? "GET",
      headers: {
        Accept: "application/json",
        ...(options?.body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      body: options?.body === undefined ? undefined : JSON.stringify(options.body),
      credentials: "include",
      cache: "no-store",
      signal: options?.signal,
    });
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw err;
    }
    throw new NetworkError();
  }

  const requestId = response.headers.get("X-Request-Id") ?? undefined;

  if (!response.ok) {
    let errorData: { code?: string; message?: string } = {};
    try {
      errorData = (await response.json()) as { code?: string; message?: string };
    } catch {
      // Ignored non-json error responses
    }

    if (response.status === 404) {
      throw new NotFoundError(errorData.message, errorData.code, requestId);
    }
    throw new AdminApiError(
      errorData.message || `관리자 API 요청 실패 (HTTP ${response.status})`,
      errorData.code,
      response.status,
      requestId
    );
  }

  return (await response.json()) as T;
}

export async function loginAdmin(email: string, password: string): Promise<AdminLoginResponse> {
  return request<AdminLoginResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export async function getCurrentAdmin(signal?: AbortSignal): Promise<AdminUser> {
  return request<AdminUser>("/auth/me", { signal });
}

export async function logoutAdmin(): Promise<void> {
  await request<{ loggedOut: boolean }>("/auth/logout", { method: "POST" });
}

export async function getAdminUsers(
  params?: UserQueryParams,
  signal?: AbortSignal
): Promise<PageResponse<AdminUserDetail>> {
  if (isDemoMode()) return DEMO_USERS;
  return request<PageResponse<AdminUserDetail>>("/users", {
    params: {
      query: params?.query,
      role: params?.role,
      status: params?.status,
      page: params?.page,
      pageSize: params?.pageSize,
      sort: params?.sort,
      direction: params?.direction,
    },
    signal,
  });
}

export async function inviteAdminUser(params: InviteAdminUserParams): Promise<AdminUserDetail> {
  if (isDemoMode()) {
    return {
      id: `demo-u-${Date.now()}`,
      email: params.email,
      displayName: params.displayName,
      role: params.role,
      status: "invited",
      authProvider: "password",
      lastLoginAt: null,
      createdAt: new Date().toISOString(),
      createdBy: "demo-current",
    };
  }
  return request<AdminUserDetail>("/users/invite", {
    method: "POST",
    body: params,
  });
}

export async function updateAdminUserRole(userId: string, role: string): Promise<AdminUserDetail> {
  if (isDemoMode()) {
    const user = DEMO_USERS.items.find((u) => u.id === userId);
    return {
      ...(user ?? DEMO_USERS.items[0]),
      role: role as "owner" | "admin" | "operator" | "viewer",
    };
  }
  return request<AdminUserDetail>(`/users/${encodeURIComponent(userId)}/role`, {
    method: "PATCH",
    body: { role },
  });
}

export async function updateAdminUserStatus(userId: string, status: string): Promise<AdminUserDetail> {
  if (isDemoMode()) {
    const user = DEMO_USERS.items.find((u) => u.id === userId);
    return {
      ...(user ?? DEMO_USERS.items[0]),
      status: status as "active" | "invited" | "suspended" | "disabled",
    };
  }
  return request<AdminUserDetail>(`/users/${encodeURIComponent(userId)}/status`, {
    method: "PATCH",
    body: { status },
  });
}

export async function getAdminAuditLogs(
  params?: AuditLogQueryParams,
  signal?: AbortSignal
): Promise<PageResponse<AdminAuditLogItem>> {
  if (isDemoMode()) return DEMO_AUDIT_LOGS;
  return request<PageResponse<AdminAuditLogItem>>("/audit-logs", {
    params: {
      adminUserId: params?.adminUserId,
      action: params?.action,
      resourceType: params?.resourceType,
      result: params?.result,
      requestId: params?.requestId,
      dateFrom: params?.dateFrom,
      dateTo: params?.dateTo,
      page: params?.page,
      pageSize: params?.pageSize,
      sort: params?.sort,
      direction: params?.direction,
    },
    signal,
  });
}

export async function getAdminHealth(signal?: AbortSignal): Promise<AdminHealthResponse> {
  if (isDemoMode()) return DEMO_HEALTH;
  const res = await request<AdminHealthResponse>("/health", { signal });
  if (!isHealthResponse(res)) {
    throw new AdminApiError("Health 응답 규격이 올바르지 않습니다.");
  }
  return res;
}

export async function getAdminSummary(signal?: AbortSignal): Promise<AdminDashboardSummary> {
  if (isDemoMode()) return DEMO_SUMMARY;
  const res = await request<AdminDashboardSummary>("/summary", { signal });
  if (!isDashboardSummary(res)) {
    throw new AdminApiError("Summary 응답 규격이 올바르지 않습니다.");
  }
  return res;
}

export async function getProviderStatus(signal?: AbortSignal): Promise<ProviderStatus> {
  if (isDemoMode()) return DEMO_PROVIDERS;
  const res = await request<ProviderStatus>("/providers", { signal });
  if (!isProviderStatus(res)) {
    throw new AdminApiError("Provider 상태 응답 규격이 올바르지 않습니다.");
  }
  return res;
}

export async function getPlaces(
  params?: PlaceQueryParams,
  signal?: AbortSignal
): Promise<PageResponse<PlaceListItem>> {
  if (isDemoMode()) return DEMO_PLACES;
  return request<PageResponse<PlaceListItem>>("/places", {
    params: {
      query: params?.query,
      provider: params?.provider,
      category: params?.category,
      coordinateStatus: params?.coordinateStatus,
      tourismMetricStatus: params?.tourismMetricStatus,
      priceEvidenceStatus: params?.priceEvidenceStatus,
      page: params?.page,
      pageSize: params?.pageSize,
      sort: params?.sort,
      direction: params?.direction,
    },
    signal,
  });
}

export async function getMembers(
  params?: MemberQueryParams,
  signal?: AbortSignal
): Promise<PageResponse<MemberListItem>> {
  if (isDemoMode()) return DEMO_MEMBERS;
  return request<PageResponse<MemberListItem>>("/members", {
    params: {
      query: params?.query,
      locale: params?.locale,
      status: params?.status,
      page: params?.page,
      pageSize: params?.pageSize,
      sort: params?.sort,
      direction: params?.direction,
    },
    signal,
  });
}

export async function getPlaceDetail(id: string, signal?: AbortSignal): Promise<PlaceDetail> {
  if (isDemoMode()) return DEMO_PLACE_DETAIL;
  return request<PlaceDetail>(`/places/${encodeURIComponent(id)}`, { signal });
}

export async function getImportRuns(
  params?: { datasetKey?: string; mode?: string; status?: string; page?: number; pageSize?: number },
  signal?: AbortSignal
): Promise<PageResponse<ImportRunListItem>> {
  if (isDemoMode()) return DEMO_IMPORTS;
  return request<PageResponse<ImportRunListItem>>("/import-runs", {
    params: {
      datasetKey: params?.datasetKey,
      mode: params?.mode,
      status: params?.status,
      page: params?.page,
      pageSize: params?.pageSize,
    },
    signal,
  });
}

export async function getImportRunDetail(id: string, signal?: AbortSignal): Promise<ImportRunDetail> {
  if (isDemoMode()) return DEMO_IMPORT_DETAIL;
  return request<ImportRunDetail>(`/import-runs/${encodeURIComponent(id)}`, { signal });
}

export async function getEvaluations(
  params?: { dataMode?: string; page?: number; pageSize?: number },
  signal?: AbortSignal
): Promise<PageResponse<EvaluationListItem>> {
  if (isDemoMode()) return DEMO_EVALUATIONS;
  return request<PageResponse<EvaluationListItem>>("/evaluations", {
    params: {
      dataMode: params?.dataMode,
      page: params?.page,
      pageSize: params?.pageSize,
    },
    signal,
  });
}

export async function getEvaluationDetail(id: string, signal?: AbortSignal): Promise<EvaluationDetail> {
  if (isDemoMode()) return DEMO_EVALUATION_DETAIL;
  return request<EvaluationDetail>(`/evaluations/${encodeURIComponent(id)}`, { signal });
}

export async function getSyncJobs(signal?: AbortSignal): Promise<SyncJob[]> {
  if (isDemoMode()) return DEMO_SYNC_JOBS;
  return request<SyncJob[]>("/sync-jobs", { signal });
}

export async function getSyncRuns(
  jobKey?: string,
  page = 1,
  pageSize = 20,
  signal?: AbortSignal
): Promise<PageResponse<SyncRun>> {
  if (isDemoMode()) return DEMO_SYNC_RUNS;
  return request<PageResponse<SyncRun>>("/sync-runs", {
    params: { jobKey, page, pageSize },
    signal,
  });
}
