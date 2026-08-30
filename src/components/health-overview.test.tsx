import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HealthOverview } from "./health-overview";

afterEach(() => vi.unstubAllGlobals());

describe("HealthOverview", () => {
  it("renders validated admin backend states", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers(),
      json: async () => ({
        status: "ok",
        database: "connected",
      publicApi: "connected",
        timestamp: "2026-08-21T09:00:00.000Z",
      }),
    }));
    render(<HealthOverview />);
    expect(screen.getByText("백엔드 상태 확인 중")).toBeInTheDocument();
    expect(await screen.findByText("서비스 연결 상태")).toBeInTheDocument();
    expect(screen.getByText("관리자 Database")).toBeInTheDocument();
    expect(screen.getAllByText("연결됨")).toHaveLength(2);
  });

  it("shows an explicit error without fabricated values", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    render(<HealthOverview />);
    expect(await screen.findByText("백엔드에 연결할 수 없습니다")).toBeInTheDocument();
    expect(screen.getByText("운영 수치는 표시하지 않았습니다.", { exact: false })).toBeInTheDocument();
  });
});
