import {
  AdminDashboardSummary,
  AdminHealthResponse,
  ProviderStatus,
} from "./contracts";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isHealthResponse(value: unknown): value is AdminHealthResponse {
  if (!isRecord(value)) return false;
  return (
    (value.status === "ok" || value.status === "degraded") &&
    (value.database === "connected" || value.database === "unavailable") &&
    (value.publicApi === "connected" || value.publicApi === "unavailable") &&
    typeof value.timestamp === "string"
  );
}

export function isDashboardSummary(value: unknown): value is AdminDashboardSummary {
  if (!isRecord(value)) return false;
  return (
    isRecord(value.places) &&
    typeof value.places.total === "number" &&
    typeof value.places.kakao === "number" &&
    typeof value.places.mock === "number" &&
    typeof value.places.verifiedPriceRecords === "number" &&
    typeof value.places.unverifiedPriceRecords === "number" &&
    isRecord(value.places.bySource) &&
    isRecord(value.tourismMetrics) &&
    typeof value.tourismMetrics.total === "number" &&
    isRecord(value.imports) &&
    isRecord(value.evaluations) &&
    typeof value.evaluations.total === "number" &&
    isRecord(value.members) &&
    typeof value.members.total === "number"
  );
}

export function isProviderStatus(value: unknown): value is ProviderStatus {
  if (!isRecord(value)) return false;
  return (
    typeof value.place === "string" &&
    typeof value.kto === "string" &&
    typeof value.tourismDataLab === "string" &&
    typeof value.crowd === "string" &&
    typeof value.llm === "string" &&
    typeof value.routing === "string" &&
    typeof value.accessibility === "string" &&
    typeof value.checkedAt === "string" &&
    (value.publicApiStatus === "connected" || value.publicApiStatus === "unavailable")
  );
}
