export type ProviderMode = "live" | "mock" | "unavailable";
export type EvidenceStatus = "available" | "partial" | "unavailable";
export type CoordinateStatus = "all" | "present" | "missing";
export type TourismMetricStatus = "all" | "linked" | "unlinked";

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: "owner" | "admin" | "operator" | "viewer";
  status: "active" | "invited" | "suspended" | "disabled";
}

export interface AdminUserDetail {
  id: string;
  email: string;
  displayName: string;
  role: "owner" | "admin" | "operator" | "viewer";
  status: "active" | "invited" | "suspended" | "disabled";
  authProvider: string;
  lastLoginAt: string | null;
  createdAt: string;
  createdBy: string | null;
}

export interface InviteAdminUserParams {
  email: string;
  displayName: string;
  role: "owner" | "admin" | "operator" | "viewer";
}

export interface AdminAuditLogItem {
  id: string;
  adminUserId: string | null;
  adminUserEmail: string | null;
  adminUserDisplayName: string | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  result: "success" | "failure" | "denied";
  requestId: string | null;
  ipAddress: string | null;
  beforeData?: unknown;
  afterData?: unknown;
  metadata?: unknown;
  createdAt: string;
}

export interface AuditLogQueryParams {
  adminUserId?: string;
  action?: string;
  resourceType?: string;
  result?: string;
  requestId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
  direction?: "asc" | "desc";
}

export interface UserQueryParams {
  query?: string;
  role?: string;
  status?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
  direction?: "asc" | "desc";
}

export interface AdminLoginResponse {
  user: AdminUser;
  expiresAt: string;
}

export interface PageResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface AdminHealthResponse {
  status: "ok" | "degraded";
  database: "connected" | "unavailable";
  publicApi: "connected" | "unavailable";
  timestamp: string;
}

export interface PlaceSummary {
  total: number;
  withoutLocation: number;
  kto: number;
  naver: number;
  kakao: number;
  mock: number;
  other: number;
  verifiedPriceRecords: number;
  unverifiedPriceRecords: number;
  bySource: Record<string, number>;
}

export interface TourismMetricsSummary {
  total: number;
  linkedPlaces: number;
  latestReferencePeriod: string | null;
}

export interface ImportsSummary {
  latestCompletedAt: string | null;
  latestStatus: string | null;
  recentRejectCount: number | null;
}

export interface EvaluationsSummary {
  total: number;
  latestGeneratedAt: string | null;
}

export interface AdminDashboardSummary {
  places: PlaceSummary;
  tourismMetrics: TourismMetricsSummary;
  imports: ImportsSummary;
  evaluations: EvaluationsSummary;
  members: {
    total: number;
    active: number;
    savedTrips: number;
    latestRegisteredAt: string | null;
  };
}

export interface PlaceListItem {
  id: string;
  name: string;
  source: string;
  sourcePlaceId: string;
  category: string | null;
  address: string | null;
  roadAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  coordinateStatus: "present" | "missing";
  estimatedCostKrw: number | null;
  priceEvidenceSource: string | null;
  priceEvidenceVerificationStatus: string | null;
  tourismMetricCount: number;
  latestTourismPeriod: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TourismMetricSummary {
  metricType: string;
  value: number;
  unit: string;
  periodStart: string | null;
  periodEnd: string | null;
  sourceName: string | null;
}

export interface PlaceDetail extends PlaceListItem {
  rawCategory: string | null;
  district: string | null;
  tourismMetrics: TourismMetricSummary[];
  priceEvidence: Record<string, unknown> | null;
  safeMetadata: unknown;
}

export interface MemberListItem {
  id: string;
  displayName: string;
  email: string;
  locale: string;
  status: "active" | "inactive";
  savedTripCount: number;
  latestSavedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MemberQueryParams {
  query?: string;
  locale?: string;
  status?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
  direction?: "asc" | "desc";
}

export interface ImportRunListItem {
  id: string;
  datasetKey: string;
  datasetName: string;
  sourceName: string;
  referencePeriod: string | null;
  mode: "live" | "mock";
  status: "processing" | "completed" | "failed";
  fileName: string;
  acceptedCount: number;
  rejectedCount: number;
  startedAt: string;
  completedAt: string | null;
}

export interface ImportRunDetail extends ImportRunListItem {
  sourceUrl: string | null;
  licenseUseCondition: string | null;
  spatialGranularity: string | null;
  temporalGranularity: string | null;
  checksumPrefix: string;
  rejectionCodeCounts: Record<string, number>;
  safeMetadata: unknown;
}

export interface ExpectedDispersionEffect {
  algorithmVersion: string;
  claimScope: string;
  evidenceStatus: EvidenceStatus;
  concentrationReduction: number | null;
  nonHotspotInclusionLift: number | null;
  preferenceChange: number | null;
  extraTravelDistanceKm: number | null;
  extraTravelTimeMinutes: number | null;
  localImpactLift: number | null;
}

export interface EvaluationListItem {
  id: string;
  createdAt: string;
  area: string | null;
  travelDate: string | null;
  dataMode: "live" | "mock" | "mixed" | "unavailable";
  evidenceStatus: EvidenceStatus;
  candidateCount: number;
  baselineAlgorithmVersion: string;
  michiAlgorithmVersion: string;
}

export interface EvaluationDetail {
  id: string;
  createdAt: string;
  area: string | null;
  travelDate: string | null;
  dataMode: "live" | "mock" | "mixed" | "unavailable";
  preferenceSnapshot: Record<string, unknown> | null;
  candidateSnapshotSummary: {
    totalCandidates: number;
    withTourismConcentration: number;
    sources: string[];
  };
  baselineAlgorithmVersion: string;
  michiAlgorithmVersion: string;
  baselineMetrics: Record<string, number | null>;
  michiMetrics: Record<string, number | null>;
  delta: Record<string, number | null>;
  expectedEffect: ExpectedDispersionEffect;
  dataSources: unknown;
  warnings: string[];
  randomSeed: number | null;
}

export interface SyncJob {
  key: string;
  name: string;
  description: string;
  schedule: string;
  historyStatus: "available" | "partial" | "unavailable";
  lastRunAt: string | null;
  lastStatus: string | null;
  mutationEnabled: boolean;
  mutationDisabledReason: string;
}

export interface SyncRun {
  id: string;
  jobKey: string;
  startedAt: string;
  completedAt: string | null;
  status: string;
  message: string | null;
}

export interface ProviderStatus {
  place: ProviderMode;
  kto: ProviderMode;
  tourismDataLab: ProviderMode;
  crowd: ProviderMode;
  llm: ProviderMode;
  routing: ProviderMode;
  accessibility: "live" | "unavailable";
  placeSource: string | null;
  crowdSource: string | null;
  checkedAt: string;
  publicApiStatus: "connected" | "unavailable";
}

export interface PlaceQueryParams {
  query?: string;
  provider?: string;
  category?: string;
  coordinateStatus?: string;
  tourismMetricStatus?: string;
  priceEvidenceStatus?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
  direction?: "asc" | "desc";
}
