"use client";

import { useEffect, useState } from "react";
import { DemoBadge } from "@/components/demo-badge";
import { HealthOverview } from "@/components/health-overview";
import { PageHeader } from "@/components/page-header";
import { SectionLink } from "@/components/section-link";
import { StatusBadge } from "@/components/status-badge";
import { AdminDashboardSummary, getAdminSummary } from "@/lib/admin-api";

export default function DashboardPage() {
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    getAdminSummary(signal)
      .then((data) => {
        setSummary(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "대시보드 통계를 불러오지 못했습니다.");
        setLoading(false);
      });
  };

  useEffect(() => {
    const controller = new AbortController();
    getAdminSummary(controller.signal)
      .then((data) => {
        setSummary(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "대시보드 통계를 불러오지 못했습니다.");
        setLoading(false);
      });
    return () => controller.abort();
  }, []);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Overview"
        title="운영 대시보드"
        description="Michi의 장소·가격 근거·회원·관광 데이터와 추천 평가 상태를 한곳에서 확인합니다."
        actions={<DemoBadge />}
      />

      <div className="notice" role="note">
        <strong>운영 안전 모드</strong>
        <span>
          조회·관리자 인증은 연결되어 있습니다. 데이터 동기화·삭제 mutation은 감사 가능한 실행 API가 준비될 때까지 비활성입니다.
        </span>
      </div>

      <HealthOverview />

      <section aria-labelledby="summary-title" style={{ marginTop: "24px" }}>
        <div className="section-heading">
          <div>
            <p className="section-kicker">Statistics</p>
            <h2 id="summary-title">데이터 요약 통계</h2>
          </div>
          {error && (
            <button className="button" type="button" onClick={() => fetchSummary()}>
              다시 시도
            </button>
          )}
        </div>

        {loading ? (
          <div className="notice">통계 정보를 불러오는 중입니다...</div>
        ) : error ? (
          <div className="notice notice-warning">
            <strong>통계 조회 실패</strong>: {error}
          </div>
        ) : summary ? (
          <div className="metric-grid" aria-label="데이터 통계 요약">
            <div>
              <span>총 장소</span>
              <strong>
                {summary.places.total}
              </strong>
              <small>KTO {summary.places.kto} · NAVER {summary.places.naver} · Kakao {summary.places.kakao}</small>
              <small>좌표 누락 {summary.places.withoutLocation}건 · Mock {summary.places.mock}건 · 기타 {summary.places.other}건</small>
            </div>
            <div>
              <span>검증된 가격 근거</span>
              <strong>{summary.places.verifiedPriceRecords}</strong>
              <small>미검증·레거시 가격 {summary.places.unverifiedPriceRecords}개소</small>
              <small>출처와 검증 상태가 없는 값은 추천 예산에 사용하지 않습니다.</small>
            </div>
            <div>
              <span>서비스 회원</span>
              <strong>{summary.members.total}</strong>
              <small>활성 {summary.members.active}명 · 저장 일정 {summary.members.savedTrips}건</small>
              <small>최근 가입 {summary.members.latestRegisteredAt ? new Date(summary.members.latestRegisteredAt).toLocaleString("ko-KR") : "없음"}</small>
            </div>
            <div>
              <span>관광 지표 (연결 장소)</span>
              <strong>
                {summary.tourismMetrics.total}
                <small style={{ marginLeft: "6px", fontSize: "14px", fontWeight: 400 }}>
                  ({summary.tourismMetrics.linkedPlaces}개소)
                </small>
              </strong>
              <small>최근 기간: {summary.tourismMetrics.latestReferencePeriod ?? "없음"}</small>
            </div>
            <div>
              <span>추천 평가 실행</span>
              <strong>{summary.evaluations.total}</strong>
              <small>
                최근 생성:{" "}
                {summary.evaluations.latestGeneratedAt
                  ? new Date(summary.evaluations.latestGeneratedAt).toLocaleString("ko-KR")
                  : "없음"}
              </small>
            </div>
            <div>
              <span>최근 Import 상태</span>
              <strong>
                {summary.imports.latestStatus ? (
                  <StatusBadge
                    tone={
                      summary.imports.latestStatus === "completed"
                        ? "success"
                        : summary.imports.latestStatus === "processing"
                        ? "warning"
                        : "danger"
                    }
                  >
                    {summary.imports.latestStatus}
                  </StatusBadge>
                ) : (
                  "—"
                )}
              </strong>
              <small>
                최근 거절 건수:{" "}
                {summary.imports.recentRejectCount !== null
                  ? `${summary.imports.recentRejectCount}건`
                  : "없음"}
              </small>
            </div>
          </div>
        ) : null}
      </section>

      <section aria-labelledby="operations-title" style={{ marginTop: "32px" }}>
        <div className="section-heading">
          <div>
            <p className="section-kicker">Workspace</p>
            <h2 id="operations-title">운영 영역</h2>
          </div>
          <p>각 화면은 실제 관리자 API가 준비되는 순서대로 연결합니다.</p>
        </div>
        <div className="section-link-grid">
          <SectionLink
            href="/places"
            icon="places"
            title="장소 데이터"
            description="KTO·NAVER·Kakao 장소, 좌표와 가격 근거"
          />
          <SectionLink
            href="/members"
            icon="users"
            title="서비스 회원"
            description="가입 상태와 저장 일정 이용 현황"
          />
          <SectionLink
            href="/sync"
            icon="sync"
            title="데이터 동기화"
            description="POI와 관광 지표 수집 실행 이력"
          />
          <SectionLink
            href="/evaluations"
            icon="evaluation"
            title="추천 평가"
            description="Baseline과 Michi 비교 결과"
          />
          <SectionLink
            href="/imports"
            icon="imports"
            title="Import 이력"
            description="출처·기간·수락 및 거부 결과"
          />
        </div>
      </section>
    </div>
  );
}
