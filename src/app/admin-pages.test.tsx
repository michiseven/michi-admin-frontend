import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DashboardPage from "./page";
import PlacesPage from "./places/page";
import SyncPage from "./sync/page";
import EvaluationsPage from "./evaluations/page";
import ImportsPage from "./imports/page";
import SettingsPage from "./settings/page";
import UsersPage from "./users/page";
import AuditLogsPage from "./audit/page";
import MembersPage from "./members/page";

vi.mock("@/components/health-overview", () => ({
  HealthOverview: () => <div data-testid="health-overview">Health Overview</div>,
}));

vi.mock("@/lib/admin-api", () => {
  return {
    isDemoMode: () => true,
    getAdminApiUrl: () => "http://localhost:4100/api/admin",
    getPublicApiUrl: () => "http://localhost:4000/api",
    getAdminHealth: vi.fn().mockResolvedValue({
      status: "ok",
      database: "connected",
      publicApi: "connected",
      timestamp: "2026-08-22T00:00:00Z",
    }),
    getAdminSummary: vi.fn().mockResolvedValue({
      places: {
        total: 100,
        withoutLocation: 5,
        kto: 80,
        naver: 10,
        kakao: 10,
        mock: 0,
        other: 0,
        verifiedPriceRecords: 10,
        unverifiedPriceRecords: 20,
        bySource: { "kto-tour-jpn": 80, "naver-local": 10, "kakao-local": 10 },
      },
      tourismMetrics: { total: 300, linkedPlaces: 75, latestReferencePeriod: "2026-07" },
      imports: { latestCompletedAt: "2026-08-20T00:00:00Z", latestStatus: "completed", recentRejectCount: 0 },
      evaluations: { total: 10, latestGeneratedAt: "2026-08-21T00:00:00Z" },
      members: { total: 12, active: 11, savedTrips: 8, latestRegisteredAt: "2026-08-21T00:00:00Z" },
    }),
    getProviderStatus: vi.fn().mockResolvedValue({
      place: "mock",
      kto: "live",
      tourismDataLab: "live",
      crowd: "mock",
      llm: "mock",
      routing: "live",
      accessibility: "unavailable",
      placeSource: "kakao-local",
      crowdSource: "seoul-open-data",
      checkedAt: "2026-08-22T00:00:00Z",
      publicApiStatus: "connected",
    }),
    getPlaces: vi.fn().mockResolvedValue({
      items: [
        {
          id: "p1",
          name: "경복궁",
          source: "kto",
          sourcePlaceId: "kto-1",
          category: "관광지",
          address: "서울 종로구",
          roadAddress: "사직로 161",
          latitude: 37.5796,
          longitude: 126.977,
          coordinateStatus: "present",
          estimatedCostKrw: 3000,
          priceEvidenceSource: "manual",
          priceEvidenceVerificationStatus: "verified",
          tourismMetricCount: 2,
          latestTourismPeriod: "2026-07",
          createdAt: "2026-08-01T00:00:00Z",
          updatedAt: "2026-08-20T00:00:00Z",
        },
      ],
      page: 1,
      pageSize: 20,
      totalItems: 1,
      totalPages: 1,
    }),
    getPlaceDetail: vi.fn(),
    getMembers: vi.fn().mockResolvedValue({
      items: [
        {
          id: "member-1",
          displayName: "Tokyo Traveler",
          email: "traveler@example.jp",
          locale: "ja",
          status: "active",
          savedTripCount: 2,
          latestSavedAt: "2026-08-21T00:00:00Z",
          createdAt: "2026-08-01T00:00:00Z",
          updatedAt: "2026-08-21T00:00:00Z",
        },
      ],
      page: 1,
      pageSize: 20,
      totalItems: 1,
      totalPages: 1,
    }),
    getSyncJobs: vi.fn().mockResolvedValue([
      {
        key: "kto-seoul-poi",
        name: "KTO 서울 관광지 POI 동기화",
        description: "TourAPI 동기화",
        schedule: "수동",
        historyStatus: "unavailable",
        lastRunAt: null,
        lastStatus: null,
        mutationEnabled: false,
        mutationDisabledReason: "인증 필요",
      },
    ]),
    getSyncRuns: vi.fn().mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 20,
      totalItems: 0,
      totalPages: 0,
    }),
    getEvaluations: vi.fn().mockResolvedValue({
      items: [
        {
          id: "eval-1",
          createdAt: "2026-08-21T00:00:00Z",
          area: "종로구",
          travelDate: "2026-08-22",
          dataMode: "live",
          evidenceStatus: "available",
          candidateCount: 10,
          baselineAlgorithmVersion: "b-1",
          michiAlgorithmVersion: "m-1",
        },
      ],
      page: 1,
      pageSize: 20,
      totalItems: 1,
      totalPages: 1,
    }),
    getEvaluationDetail: vi.fn(),
    getImportRuns: vi.fn().mockResolvedValue({
      items: [
        {
          id: "imp-1",
          datasetKey: "kto-datalab",
          datasetName: "데이터랩",
          sourceName: "한국관광공사",
          referencePeriod: "2026-07",
          mode: "live",
          status: "completed",
          fileName: "data.csv",
          acceptedCount: 100,
          rejectedCount: 0,
          startedAt: "2026-08-20T00:00:00Z",
          completedAt: "2026-08-20T01:00:00Z",
        },
      ],
      page: 1,
      pageSize: 20,
      totalItems: 1,
      totalPages: 1,
    }),
    getImportRunDetail: vi.fn(),
    getAdminUsers: vi.fn().mockResolvedValue({
      items: [
        {
          id: "u1",
          email: "owner@michi.local",
          displayName: "Michi Owner",
          role: "owner",
          status: "active",
          authProvider: "password",
          lastLoginAt: null,
          createdAt: "2026-08-01T00:00:00Z",
          createdBy: null,
        },
      ],
      page: 1,
      pageSize: 20,
      totalItems: 1,
      totalPages: 1,
    }),
    inviteAdminUser: vi.fn(),
    updateAdminUserRole: vi.fn(),
    updateAdminUserStatus: vi.fn(),
    getAdminAuditLogs: vi.fn().mockResolvedValue({
      items: [
        {
          id: "al-1",
          adminUserId: "u1",
          adminUserEmail: "owner@michi.local",
          adminUserDisplayName: "Michi Owner",
          action: "admin.login",
          resourceType: "admin_session",
          resourceId: null,
          result: "success",
          requestId: "req-1",
          ipAddress: "127.0.0.1",
          createdAt: "2026-08-23T00:00:00Z",
        },
      ],
      page: 1,
      pageSize: 20,
      totalItems: 1,
      totalPages: 1,
    }),
  };
});

describe("Admin Pages integration", () => {
  it("renders DashboardPage with summary statistics", async () => {
    render(<DashboardPage />);
    expect(screen.getByRole("heading", { level: 1, name: "운영 대시보드" })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("총 장소")).toBeInTheDocument();
    });
  });

  it("renders MembersPage separately from admin accounts", async () => {
    render(<MembersPage />);
    expect(screen.getByRole("heading", { level: 1, name: "서비스 회원" })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("traveler@example.jp")).toBeInTheDocument();
    });
  });

  it("renders PlacesPage with place item and filters", async () => {
    render(<PlacesPage />);
    expect(screen.getByRole("heading", { level: 1, name: "장소 데이터" })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("경복궁")).toBeInTheDocument();
    });
  });

  it("renders SyncPage with unavailable history notice", async () => {
    render(<SyncPage />);
    expect(screen.getByRole("heading", { level: 1, name: "데이터 동기화" })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("KTO 서울 관광지 POI 동기화")).toBeInTheDocument();
      expect(screen.getByText("이력 미기록 (unavailable)")).toBeInTheDocument();
    });
  });

  it("renders EvaluationsPage with evaluation items", async () => {
    render(<EvaluationsPage />);
    expect(screen.getByRole("heading", { level: 1, name: "추천 평가" })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("종로구")).toBeInTheDocument();
    });
  });

  it("renders ImportsPage with import run item", async () => {
    render(<ImportsPage />);
    expect(screen.getByRole("heading", { level: 1, name: "Import 이력" })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("데이터랩")).toBeInTheDocument();
    });
  });

  it("renders UsersPage with user list and invite button", async () => {
    render(<UsersPage />);
    expect(screen.getByRole("heading", { level: 1, name: "관리자 계정 관리" })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("owner@michi.local")).toBeInTheDocument();
    });
  });

  it("renders AuditLogsPage with audit log records", async () => {
    render(<AuditLogsPage />);
    expect(screen.getByRole("heading", { level: 1, name: "감사 로그" })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("admin.login")).toBeInTheDocument();
    });
  });

  it("renders SettingsPage with API URLs and Provider modes", async () => {
    render(<SettingsPage />);
    expect(screen.getByRole("heading", { level: 1, name: "설정" })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("http://localhost:4100/api/admin")).toBeInTheDocument();
    });
  });
});
