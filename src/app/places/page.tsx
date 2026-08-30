"use client";

import { useEffect, useState } from "react";
import { DemoBadge } from "@/components/demo-badge";
import { DetailDrawer } from "@/components/detail-drawer";
import { EmptyPanel } from "@/components/empty-panel";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { getPlaceDetail, getPlaces, PlaceDetail, PlaceListItem } from "@/lib/admin-api";

export default function PlacesPage() {
  const [places, setPlaces] = useState<PlaceListItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [query, setQuery] = useState("");
  const [provider, setProvider] = useState("all");
  const [coordStatus, setCoordStatus] = useState("all");
  const [metricStatus, setMetricStatus] = useState("all");
  const [priceStatus, setPriceStatus] = useState("all");

  // Detail drawer
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [detail, setDetail] = useState<PlaceDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const executeFetch = (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    getPlaces(
      {
        query: query.trim() || undefined,
        provider: provider !== "all" ? provider : undefined,
        coordinateStatus: coordStatus !== "all" ? coordStatus : undefined,
        tourismMetricStatus: metricStatus !== "all" ? metricStatus : undefined,
        priceEvidenceStatus: priceStatus !== "all" ? priceStatus : undefined,
        page,
        pageSize: 20,
      },
      signal
    )
      .then((res) => {
        setPlaces(res.items);
        setTotalItems(res.totalItems);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "장소 목록을 불러오지 못했습니다.");
        setLoading(false);
      });
  };

  useEffect(() => {
    const controller = new AbortController();
    getPlaces(
      {
        query: query.trim() || undefined,
        provider: provider !== "all" ? provider : undefined,
        coordinateStatus: coordStatus !== "all" ? coordStatus : undefined,
        tourismMetricStatus: metricStatus !== "all" ? metricStatus : undefined,
        priceEvidenceStatus: priceStatus !== "all" ? priceStatus : undefined,
        page,
        pageSize: 20,
      },
      controller.signal
    )
      .then((res) => {
        setPlaces(res.items);
        setTotalItems(res.totalItems);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "장소 목록을 불러오지 못했습니다.");
        setLoading(false);
      });
    return () => controller.abort();
  }, [provider, coordStatus, metricStatus, priceStatus, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    executeFetch();
  };

  const handleOpenDetail = async (id: string) => {
    setSelectedPlaceId(id);
    setDetailLoading(true);
    try {
      const data = await getPlaceDetail(id);
      setDetail(data);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "상세 정보를 불러오지 못했습니다.");
      setSelectedPlaceId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="POI"
        title="장소 데이터"
        description="KTO 기본 POI와 NAVER·Kakao 검색 장소의 출처, 좌표, 관광 지표와 가격 근거를 검토합니다."
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <DemoBadge />
            <button
              className="button"
              type="button"
              disabled
              title="관리자 인증·권한 설정 후 활성화됩니다."
            >
              장소 내보내기 (비활성)
            </button>
          </div>
        }
      />

      <form onSubmit={handleSearchSubmit} className="toolbar" aria-label="장소 검색 및 필터">
        <label>
          <span>검색</span>
          <input
            type="search"
            placeholder="장소명, 주소, ID"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label>
          <span>Provider</span>
          <select value={provider} onChange={(e) => { setProvider(e.target.value); setPage(1); }}>
            <option value="all">전체 Provider</option>
            <option value="kto">KTO</option>
            <option value="naver">NAVER</option>
            <option value="kakao">Kakao</option>
            <option value="mock">Mock</option>
          </select>
        </label>
        <label>
          <span>가격 근거</span>
          <select value={priceStatus} onChange={(e) => { setPriceStatus(e.target.value); setPage(1); }}>
            <option value="all">전체</option>
            <option value="verified">장소별 근거</option>
            <option value="unverified">미검증·레거시</option>
            <option value="missing">가격 미확인</option>
          </select>
        </label>
        <label>
          <span>좌표 상태</span>
          <select value={coordStatus} onChange={(e) => { setCoordStatus(e.target.value); setPage(1); }}>
            <option value="all">전체</option>
            <option value="present">좌표 있음</option>
            <option value="missing">좌표 누락</option>
          </select>
        </label>
        <label>
          <span>관광 지표</span>
          <select value={metricStatus} onChange={(e) => { setMetricStatus(e.target.value); setPage(1); }}>
            <option value="all">전체</option>
            <option value="linked">지표 연결됨</option>
            <option value="unlinked">지표 미연결</option>
          </select>
        </label>
        <button type="submit" className="button button-primary">
          검색
        </button>
      </form>

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
            <caption>장소 데이터 목록 (총 {totalItems}건)</caption>
            <thead>
              <tr>
                <th>장소명</th>
                <th>Provider</th>
                <th>카테고리</th>
                <th>좌표 (위도, 경도)</th>
                <th>관광 지표</th>
                <th>비용 근거</th>
                <th>상세</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="table-message">
                    장소 데이터를 불러오는 중입니다...
                  </td>
                </tr>
              ) : places.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyPanel
                      title="조건에 맞는 장소가 없습니다"
                      description="검색어나 필터 조건을 변경하여 다시 시도해 주세요."
                    />
                  </td>
                </tr>
              ) : (
                places.map((place) => (
                  <tr key={place.id}>
                    <td>
                      <strong>{place.name}</strong>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>{place.address ?? place.roadAddress ?? "주소 없음"}</div>
                    </td>
                    <td>
                      <StatusBadge tone={place.source === "kto" ? "neutral" : "neutral"}>
                        {place.source}
                      </StatusBadge>
                    </td>
                    <td>{place.category ?? "—"}</td>
                    <td>
                      {place.coordinateStatus === "present" ? (
                        <span style={{ fontSize: "13px" }}>
                          {place.latitude?.toFixed(4)}, {place.longitude?.toFixed(4)}
                        </span>
                      ) : (
                        <StatusBadge tone="danger">누락</StatusBadge>
                      )}
                    </td>
                    <td>
                      {place.tourismMetricCount > 0 ? (
                        <StatusBadge tone="success">{place.tourismMetricCount}건 연결</StatusBadge>
                      ) : (
                        <span style={{ color: "#9ca3af" }}>—</span>
                      )}
                    </td>
                    <td>
                      {place.estimatedCostKrw == null && place.priceEvidenceSource == null ? (
                        <StatusBadge tone="neutral">미확인</StatusBadge>
                      ) : (
                        <div className="cost-cell">
                          <strong>{place.estimatedCostKrw == null ? "값 없음" : `${place.estimatedCostKrw.toLocaleString("ko-KR")}원`}</strong>
                          <StatusBadge tone={place.priceEvidenceVerificationStatus === "verified" ? "success" : "warning"}>
                            {place.priceEvidenceVerificationStatus === "verified"
                              ? place.priceEvidenceSource ?? "검증됨"
                              : "미검증—사용 안 함"}
                          </StatusBadge>
                        </div>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="button"
                        style={{ padding: "2px 8px", fontSize: "12px" }}
                        onClick={() => handleOpenDetail(place.id)}
                      >
                        상세보기
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

      {/* Place Detail Drawer */}
      <DetailDrawer
        isOpen={Boolean(selectedPlaceId)}
        title={detail?.name ?? "장소 상세 정보"}
        onClose={() => { setSelectedPlaceId(null); setDetail(null); }}
      >
        {detailLoading ? (
          <div>상세 정보를 불러오는 중입니다...</div>
        ) : detail ? (
          <dl className="definition-list">
            <div>
              <dt>예상 비용과 근거</dt>
              <dd>
                {detail.estimatedCostKrw == null ? "미확인" : `${detail.estimatedCostKrw.toLocaleString("ko-KR")}원`}
                {detail.priceEvidenceSource ? (
                  <span className="inline-badge-gap">
                    <StatusBadge tone={detail.priceEvidenceVerificationStatus === "verified" ? "success" : "warning"}>
                      {detail.priceEvidenceVerificationStatus === "verified"
                        ? detail.priceEvidenceSource
                        : `${detail.priceEvidenceSource} · 미검증`}
                    </StatusBadge>
                  </span>
                ) : null}
                {detail.priceEvidence ? <pre className="metadata-preview">{JSON.stringify(detail.priceEvidence, null, 2)}</pre> : null}
              </dd>
            </div>
            <div>
              <dt>장소 ID</dt>
              <dd><code>{detail.id}</code></dd>
            </div>
            <div>
              <dt>Provider ID</dt>
              <dd>{detail.source} / <code>{detail.sourcePlaceId}</code></dd>
            </div>
            <div>
              <dt>카테고리</dt>
              <dd>{detail.category ?? "—"} {detail.rawCategory && `(${detail.rawCategory})`}</dd>
            </div>
            <div>
              <dt>지역/자치구</dt>
              <dd>{detail.district ?? "—"}</dd>
            </div>
            <div>
              <dt>지번 주소</dt>
              <dd>{detail.address ?? "—"}</dd>
            </div>
            <div>
              <dt>도로명 주소</dt>
              <dd>{detail.roadAddress ?? "—"}</dd>
            </div>
            <div>
              <dt>WGS84 좌표</dt>
              <dd>
                {detail.latitude !== null && detail.longitude !== null ? (
                  `${detail.latitude}, ${detail.longitude}`
                ) : (
                  <StatusBadge tone="danger">좌표 누락</StatusBadge>
                )}
              </dd>
            </div>
            <div>
              <dt>연결된 관광 지표</dt>
              <dd>
                {detail.tourismMetrics.length === 0 ? (
                  <span>연결된 관광 지표가 없습니다.</span>
                ) : (
                  <ul style={{ paddingLeft: "16px", margin: "4px 0", fontSize: "13px" }}>
                    {detail.tourismMetrics.map((tm, idx) => (
                      <li key={idx} style={{ marginBottom: "6px" }}>
                        <strong>{tm.metricType}</strong>: {tm.value} {tm.unit} ({tm.sourceName ?? "데이터랩"}, {tm.periodStart ?? "—"} ~ {tm.periodEnd ?? "—"})
                      </li>
                    ))}
                  </ul>
                )}
              </dd>
            </div>
            <div>
              <dt>생성 / 수정 시각</dt>
              <dd>{new Date(detail.createdAt).toLocaleString("ko-KR")} / {new Date(detail.updatedAt).toLocaleString("ko-KR")}</dd>
            </div>
          </dl>
        ) : null}
      </DetailDrawer>
    </div>
  );
}
