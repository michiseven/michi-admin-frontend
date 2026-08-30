import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DashboardPage from "./page";

vi.mock("@/components/health-overview", () => ({
  HealthOverview: () => <div data-testid="health-overview">Health Overview Component</div>,
}));

vi.mock("@/lib/admin-api", () => ({
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
  isDemoMode: () => false,
}));

describe("DashboardPage", () => {
  it("renders page header and health overview without crashing", async () => {
    render(<DashboardPage />);
    expect(screen.getByRole("heading", { level: 1, name: "운영 대시보드" })).toBeInTheDocument();
    expect(screen.getByTestId("health-overview")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "운영 영역" })).toBeInTheDocument();
  });
});
