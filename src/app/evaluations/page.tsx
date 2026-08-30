"use client";

import { useEffect, useState } from "react";
import { DemoBadge } from "@/components/demo-badge";
import { DetailDrawer } from "@/components/detail-drawer";
import { EmptyPanel } from "@/components/empty-panel";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { EvaluationDetail, EvaluationListItem, getEvaluationDetail, getEvaluations } from "@/lib/admin-api";

export default function EvaluationsPage() {
  const [evaluations, setEvaluations] = useState<EvaluationListItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [dataMode, setDataMode] = useState("all");

  // Detail drawer
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<EvaluationDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const executeFetch = (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    getEvaluations(
      {
        dataMode: dataMode !== "all" ? dataMode : undefined,
        page,
        pageSize: 20,
      },
      signal
    )
      .then((res) => {
        setEvaluations(res.items);
        setTotalItems(res.totalItems);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "추천 평가 목록을 불러오지 못했습니다.");
        setLoading(false);
      });
  };

  useEffect(() => {
    const controller = new AbortController();
    getEvaluations(
      {
        dataMode: dataMode !== "all" ? dataMode : undefined,
        page,
        pageSize: 20,
      },
      controller.signal
    )
      .then((res) => {
        setEvaluations(res.items);
        setTotalItems(res.totalItems);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "추천 평가 목록을 불러오지 못했습니다.");
        setLoading(false);
      });
    return () => controller.abort();
  }, [dataMode, page]);

  const handleOpenDetail = async (id: string) => {
    setSelectedId(id);
    setDetailLoading(true);
    try {
      const data = await getEvaluationDetail(id);
      setDetail(data);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "평가 상세 정보를 불러오지 못했습니다.");
      setSelectedId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Recommendation quality"
        title="추천 평가"
        description="동일 후보군에서 실행된 Baseline과 Michi 결과, 근거 상태와 결측률을 검토합니다."
        actions={<DemoBadge />}
      />

      <div className="toolbar" aria-label="평가 필터">
        <label>
          <span>데이터 모드</span>
          <select value={dataMode} onChange={(e) => { setDataMode(e.target.value); setPage(1); }}>
            <option value="all">전체 모드</option>
            <option value="live">LIVE</option>
            <option value="mock">MOCK</option>
            <option value="mixed">MIXED</option>
          </select>
        </label>
      </div>

      {error ? (
        <div className="notice notice-warning">
          <strong>조회 실패</strong>: {error}
          <button className="button" type="button" onClick={() => executeFetch()} style={{ marginLeft: "12px" }}>
            다시 시도
          </button>
        </div>
      ) : (
        <div className="table-frame">
          <table>
            <caption>추천 평가 실행 목록 (총 {totalItems}건)</caption>
            <thead>
              <tr>
                <th>생성 시각</th>
                <th>지역 / 여행일자</th>
                <th>후보 수</th>
                <th>데이터 모드</th>
                <th>근거 상태</th>
                <th>알고리즘 버전</th>
                <th>상세</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "32px" }}>
                    추천 평가 데이터를 불러오는 중입니다...
                  </td>
                </tr>
              ) : evaluations.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyPanel
                      title="평가 이력이 없습니다"
                      description="추천 비교 평가가 실행되면 결과가 이곳에 기록됩니다."
                    />
                  </td>
                </tr>
              ) : (
                evaluations.map((item) => (
                  <tr key={item.id}>
                    <td>{new Date(item.createdAt).toLocaleString("ko-KR")}</td>
                    <td>
                      <strong>{item.area ?? "미지정"}</strong>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>{item.travelDate ?? "날짜 없음"}</div>
                    </td>
                    <td>{item.candidateCount}개</td>
                    <td>
                      <StatusBadge tone={item.dataMode === "live" ? "success" : "warning"}>
                        {item.dataMode.toUpperCase()}
                      </StatusBadge>
                    </td>
                    <td>
                      <StatusBadge
                        tone={
                          item.evidenceStatus === "available"
                            ? "success"
                            : item.evidenceStatus === "partial"
                            ? "warning"
                            : "neutral"
                        }
                      >
                        {item.evidenceStatus}
                      </StatusBadge>
                    </td>
                    <td style={{ fontSize: "12px" }}>
                      <div>B: {item.baselineAlgorithmVersion}</div>
                      <div>M: {item.michiAlgorithmVersion}</div>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="button"
                        style={{ padding: "2px 8px", fontSize: "12px" }}
                        onClick={() => handleOpenDetail(item.id)}
                      >
                        결과 비교
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalItems > 20 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "16px" }}>
          <button
            type="button"
            className="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            이전
          </button>
          <span style={{ display: "flex", alignItems: "center", fontSize: "14px", padding: "0 8px" }}>
            페이지 {page} / {Math.ceil(totalItems / 20)}
          </span>
          <button
            type="button"
            className="button"
            disabled={page >= Math.ceil(totalItems / 20)}
            onClick={() => setPage((p) => p + 1)}
          >
            다음
          </button>
        </div>
      )}

      {/* Evaluation Detail Drawer */}
      <DetailDrawer
        isOpen={Boolean(selectedId)}
        title="추천 평가 비교 분석"
        onClose={() => { setSelectedId(null); setDetail(null); }}
      >
        {detailLoading ? (
          <div>평가 상세 데이터를 분석 중입니다...</div>
        ) : detail ? (
          <div>
            <div className="notice" style={{ marginBottom: "16px" }}>
              <strong>분산 효과 예측</strong>:{" "}
              {detail.expectedEffect.evidenceStatus === "available"
                ? "관광 집중도 감소와 비핫스팟 발굴 지표 산출 완료"
                : "일부 지표 결측 또는 산출 불가"}
            </div>

            <h3>Expected Dispersion Effect (예측 분산 효과)</h3>
            <table style={{ width: "100%", fontSize: "13px", marginBottom: "16px" }}>
              <thead>
                <tr style={{ background: "#f3f4f6" }}>
                  <th style={{ textAlign: "left", padding: "6px" }}>지표</th>
                  <th style={{ textAlign: "right", padding: "6px" }}>Baseline</th>
                  <th style={{ textAlign: "right", padding: "6px" }}>Michi</th>
                  <th style={{ textAlign: "right", padding: "6px" }}>Delta (효과)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: "6px" }}>관광 집중도</td>
                  <td style={{ textAlign: "right" }}>{detail.baselineMetrics["tourismConcentrationScore"]?.toFixed(3) ?? "—"}</td>
                  <td style={{ textAlign: "right" }}>{detail.michiMetrics["tourismConcentrationScore"]?.toFixed(3) ?? "—"}</td>
                  <td style={{ textAlign: "right", fontWeight: 600, color: (detail.expectedEffect.concentrationReduction ?? 0) > 0 ? "#059669" : "inherit" }}>
                    {detail.expectedEffect.concentrationReduction !== null ? `-${detail.expectedEffect.concentrationReduction}` : "—"}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "6px" }}>비핫스팟 포함률</td>
                  <td style={{ textAlign: "right" }}>{detail.baselineMetrics["nonHotspotInclusionRate"]?.toFixed(3) ?? "—"}</td>
                  <td style={{ textAlign: "right" }}>{detail.michiMetrics["nonHotspotInclusionRate"]?.toFixed(3) ?? "—"}</td>
                  <td style={{ textAlign: "right", fontWeight: 600, color: (detail.expectedEffect.nonHotspotInclusionLift ?? 0) > 0 ? "#059669" : "inherit" }}>
                    {detail.expectedEffect.nonHotspotInclusionLift !== null ? `+${detail.expectedEffect.nonHotspotInclusionLift}` : "—"}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "6px" }}>취향 적합도 변화</td>
                  <td style={{ textAlign: "right" }}>{detail.baselineMetrics["averagePreferenceScore"]?.toFixed(3) ?? "—"}</td>
                  <td style={{ textAlign: "right" }}>{detail.michiMetrics["averagePreferenceScore"]?.toFixed(3) ?? "—"}</td>
                  <td style={{ textAlign: "right" }}>{detail.expectedEffect.preferenceChange !== null ? `${detail.expectedEffect.preferenceChange}` : "—"}</td>
                </tr>
                <tr>
                  <td style={{ padding: "6px" }}>추가 이동거리 (km)</td>
                  <td style={{ textAlign: "right" }}>{detail.baselineMetrics["averageTravelDistanceKm"]?.toFixed(1) ?? "—"}</td>
                  <td style={{ textAlign: "right" }}>{detail.michiMetrics["averageTravelDistanceKm"]?.toFixed(1) ?? "—"}</td>
                  <td style={{ textAlign: "right" }}>{detail.expectedEffect.extraTravelDistanceKm !== null ? `+${detail.expectedEffect.extraTravelDistanceKm} km` : "—"}</td>
                </tr>
                <tr>
                  <td style={{ padding: "6px" }}>추가 이동시간 (분)</td>
                  <td style={{ textAlign: "right" }}>{detail.baselineMetrics["averageTravelTimeMinutes"]?.toFixed(0) ?? "—"}</td>
                  <td style={{ textAlign: "right" }}>{detail.michiMetrics["averageTravelTimeMinutes"]?.toFixed(0) ?? "—"}</td>
                  <td style={{ textAlign: "right" }}>{detail.expectedEffect.extraTravelTimeMinutes !== null ? `+${detail.expectedEffect.extraTravelTimeMinutes} 분` : "—"}</td>
                </tr>
                <tr>
                  <td style={{ padding: "6px" }}>로컬 임팩트</td>
                  <td style={{ textAlign: "right" }}>{detail.baselineMetrics["localImpactScore"]?.toFixed(3) ?? "—"}</td>
                  <td style={{ textAlign: "right" }}>{detail.michiMetrics["localImpactScore"]?.toFixed(3) ?? "—"}</td>
                  <td style={{ textAlign: "right", fontWeight: 600, color: (detail.expectedEffect.localImpactLift ?? 0) > 0 ? "#059669" : "inherit" }}>
                    {detail.expectedEffect.localImpactLift !== null ? `+${detail.expectedEffect.localImpactLift}` : "—"}
                  </td>
                </tr>
              </tbody>
            </table>

            {detail.warnings.length > 0 && (
              <div style={{ marginTop: "16px" }}>
                <h4 style={{ fontSize: "14px", margin: "0 0 8px 0" }}>유의 사항 및 Disclaimer</h4>
                <ul style={{ fontSize: "12px", color: "#6b7280", paddingLeft: "16px" }}>
                  {detail.warnings.map((w, idx) => <li key={idx}>{w}</li>)}
                </ul>
              </div>
            )}
          </div>
        ) : null}
      </DetailDrawer>
    </div>
  );
}
