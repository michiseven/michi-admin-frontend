"use client";

import { useEffect, useState } from "react";
import { DemoBadge } from "@/components/demo-badge";
import { DetailDrawer } from "@/components/detail-drawer";
import { EmptyPanel } from "@/components/empty-panel";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { getImportRunDetail, getImportRuns, ImportRunDetail, ImportRunListItem } from "@/lib/admin-api";

export default function ImportsPage() {
  const [runs, setRuns] = useState<ImportRunListItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [mode, setMode] = useState("all");
  const [status, setStatus] = useState("all");

  // Detail drawer
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ImportRunDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const executeFetch = (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    getImportRuns(
      {
        mode: mode !== "all" ? mode : undefined,
        status: status !== "all" ? status : undefined,
        page,
        pageSize: 20,
      },
      signal
    )
      .then((res) => {
        setRuns(res.items);
        setTotalItems(res.totalItems);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Import 이력을 불러오지 못했습니다.");
        setLoading(false);
      });
  };

  useEffect(() => {
    const controller = new AbortController();
    getImportRuns(
      {
        mode: mode !== "all" ? mode : undefined,
        status: status !== "all" ? status : undefined,
        page,
        pageSize: 20,
      },
      controller.signal
    )
      .then((res) => {
        setRuns(res.items);
        setTotalItems(res.totalItems);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Import 이력을 불러오지 못했습니다.");
        setLoading(false);
      });
    return () => controller.abort();
  }, [mode, status, page]);

  const handleOpenDetail = async (id: string) => {
    setSelectedId(id);
    setDetailLoading(true);
    try {
      const data = await getImportRunDetail(id);
      setDetail(data);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "상세 정보를 불러오지 못했습니다.");
      setSelectedId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Lineage"
        title="Import 이력"
        description="관광 데이터의 출처, 기준 기간, checksum과 수락·거부 결과를 추적합니다."
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <DemoBadge />
            <button
              className="button button-primary"
              type="button"
              disabled
              title="관리자 인증·업로드 API 연결 후 활성화됩니다."
            >
              파일 Import (비활성)
            </button>
          </div>
        }
      />

      <div className="toolbar" aria-label="Import 필터">
        <label>
          <span>모드</span>
          <select value={mode} onChange={(e) => { setMode(e.target.value); setPage(1); }}>
            <option value="all">전체</option>
            <option value="live">LIVE</option>
            <option value="mock">MOCK</option>
          </select>
        </label>
        <label>
          <span>상태</span>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="all">전체 상태</option>
            <option value="completed">completed</option>
            <option value="processing">processing</option>
            <option value="failed">failed</option>
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
            <caption>관광 데이터 Import 실행 목록 (총 {totalItems}건)</caption>
            <thead>
              <tr>
                <th>데이터셋</th>
                <th>파일명</th>
                <th>기준 기간</th>
                <th>모드</th>
                <th>수락 / 거부</th>
                <th>완료 시각</th>
                <th>상세</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "32px" }}>
                    Import 이력을 불러오는 중입니다...
                  </td>
                </tr>
              ) : runs.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyPanel
                      title="Import 이력이 없습니다"
                      description="데이터셋 적재 이력이 생기면 이곳에 표시됩니다."
                    />
                  </td>
                </tr>
              ) : (
                runs.map((run) => (
                  <tr key={run.id}>
                    <td>
                      <strong>{run.datasetName}</strong>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>{run.sourceName}</div>
                    </td>
                    <td style={{ fontSize: "13px" }}>{run.fileName}</td>
                    <td>{run.referencePeriod ?? "—"}</td>
                    <td>
                      <StatusBadge tone={run.mode === "live" ? "success" : "warning"}>
                        {run.mode.toUpperCase()}
                      </StatusBadge>
                    </td>
                    <td>
                      <span style={{ color: "#059669", fontWeight: 600 }}>{run.acceptedCount}</span>
                      {" / "}
                      <span style={{ color: run.rejectedCount > 0 ? "#dc2626" : "#6b7280" }}>{run.rejectedCount}</span>
                    </td>
                    <td>{run.completedAt ? new Date(run.completedAt).toLocaleString("ko-KR") : "진행중"}</td>
                    <td>
                      <button
                        type="button"
                        className="button"
                        style={{ padding: "2px 8px", fontSize: "12px" }}
                        onClick={() => handleOpenDetail(run.id)}
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

      {/* Import Detail Drawer */}
      <DetailDrawer
        isOpen={Boolean(selectedId)}
        title="Import Lineage 상세"
        onClose={() => { setSelectedId(null); setDetail(null); }}
      >
        {detailLoading ? (
          <div>상세 정보를 불러오는 중입니다...</div>
        ) : detail ? (
          <dl className="definition-list">
            <div>
              <dt>데이터셋 이름</dt>
              <dd>{detail.datasetName} (<code>{detail.datasetKey}</code>)</dd>
            </div>
            <div>
              <dt>제공 기관</dt>
              <dd>{detail.sourceName}</dd>
            </div>
            <div>
              <dt>공식 출처 URL</dt>
              <dd>
                {detail.sourceUrl ? (
                  <a href={detail.sourceUrl} target="_blank" rel="noreferrer" style={{ wordBreak: "break-all" }}>
                    {detail.sourceUrl}
                  </a>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div>
              <dt>이용 조건</dt>
              <dd>{detail.licenseUseCondition ?? "—"}</dd>
            </div>
            <div>
              <dt>공간 / 시간 단위</dt>
              <dd>{detail.spatialGranularity ?? "—"} / {detail.temporalGranularity ?? "—"}</dd>
            </div>
            <div>
              <dt>파일명 및 Checksum</dt>
              <dd>{detail.fileName} (SHA256: <code>{detail.checksumPrefix}...</code>)</dd>
            </div>
            <div>
              <dt>수락 / 거절 건수</dt>
              <dd>
                수락 {detail.acceptedCount}건, 거절 {detail.rejectedCount}건
              </dd>
            </div>
            {Object.keys(detail.rejectionCodeCounts).length > 0 && (
              <div>
                <dt>거절 코드 분포</dt>
                <dd>
                  <ul style={{ paddingLeft: "16px", margin: "4px 0", fontSize: "13px" }}>
                    {Object.entries(detail.rejectionCodeCounts).map(([code, count]) => (
                      <li key={code}><code>{code}</code>: {count}건</li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
            <div>
              <dt>시작 / 완료 시각</dt>
              <dd>{new Date(detail.startedAt).toLocaleString("ko-KR")} / {detail.completedAt ? new Date(detail.completedAt).toLocaleString("ko-KR") : "진행중"}</dd>
            </div>
          </dl>
        ) : null}
      </DetailDrawer>
    </div>
  );
}
