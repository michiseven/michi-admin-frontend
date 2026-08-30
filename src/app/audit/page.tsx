"use client";

import { useEffect, useState } from "react";
import { DemoBadge } from "@/components/demo-badge";
import { DetailDrawer } from "@/components/detail-drawer";
import { EmptyPanel } from "@/components/empty-panel";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import {
  AdminAuditLogItem,
  getAdminAuditLogs,
  PageResponse,
} from "@/lib/admin-api";

export default function AuditLogsPage() {
  const [data, setData] = useState<PageResponse<AdminAuditLogItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [actionFilter, setActionFilter] = useState("");
  const [resourceFilter, setResourceFilter] = useState("");
  const [resultFilter, setResultFilter] = useState("");
  const [requestIdFilter, setRequestIdFilter] = useState("");
  const [page, setPage] = useState(1);

  // Detail Drawer
  const [selectedLog, setSelectedLog] = useState<AdminAuditLogItem | null>(null);

  const executeFetch = (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    getAdminAuditLogs(
      {
        action: actionFilter.trim() || undefined,
        resourceType: resourceFilter.trim() || undefined,
        result: resultFilter || undefined,
        requestId: requestIdFilter.trim() || undefined,
        page,
        pageSize: 20,
      },
      signal
    )
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "감사 로그를 불러오지 못했습니다.");
        setLoading(false);
      });
  };

  useEffect(() => {
    const controller = new AbortController();
    getAdminAuditLogs(
      {
        action: actionFilter.trim() || undefined,
        resourceType: resourceFilter.trim() || undefined,
        result: resultFilter || undefined,
        requestId: requestIdFilter.trim() || undefined,
        page,
        pageSize: 20,
      },
      controller.signal
    )
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "감사 로그를 불러오지 못했습니다.");
        setLoading(false);
      });
    return () => controller.abort();
  }, [actionFilter, resourceFilter, resultFilter, requestIdFilter, page]);

  const getResultBadgeTone = (result: string): "success" | "danger" | "warning" => {
    switch (result) {
      case "success": return "success";
      case "denied": return "danger";
      case "failure": return "warning";
      default: return "warning";
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Security & Compliance"
        title="감사 로그"
        description="관리자 로그인, 사용자 관리, 시스템 변경 및 권한 거부 이력을 투명하게 추적합니다."
        actions={<DemoBadge />}
      />

      {error && (
        <div className="notice notice-danger" style={{ marginBottom: "16px" }}>
          <strong>오류</strong>: {error}
          <button className="button" type="button" onClick={() => executeFetch()} style={{ marginLeft: "12px" }}>
            다시 시도
          </button>
        </div>
      )}

      {/* Filter Card */}
      <section className="filter-card">
        <div className="filter-grid" style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 180px" }}>
            <label htmlFor="audit-action" className="filter-label">작업 (Action) 검색</label>
            <input
              id="audit-action"
              className="filter-input"
              type="text"
              placeholder="예: admin.login, admin.user..."
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div style={{ flex: "1 1 150px" }}>
            <label htmlFor="audit-resource" className="filter-label">리소스 타입</label>
            <input
              id="audit-resource"
              className="filter-input"
              type="text"
              placeholder="예: admin_user, admin_session..."
              value={resourceFilter}
              onChange={(e) => {
                setResourceFilter(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div style={{ width: "150px" }}>
            <label htmlFor="audit-result" className="filter-label">결과 필터</label>
            <select
              id="audit-result"
              className="filter-select"
              value={resultFilter}
              onChange={(e) => {
                setResultFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">전체 결과</option>
              <option value="success">Success (성공)</option>
              <option value="denied">Denied (거부됨)</option>
              <option value="failure">Failure (실패)</option>
            </select>
          </div>

          <div style={{ flex: "1 1 180px" }}>
            <label htmlFor="audit-request-id" className="filter-label">Request ID 검색</label>
            <input
              id="audit-request-id"
              className="filter-input"
              type="text"
              placeholder="요청 ID 입력..."
              value={requestIdFilter}
              onChange={(e) => {
                setRequestIdFilter(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </section>

      {/* Table Frame */}
      <section className="table-frame" style={{ marginTop: "24px" }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
            감사 로그를 불러오는 중입니다...
          </div>
        ) : !data || data.items.length === 0 ? (
          <EmptyPanel
            title="조건에 일치하는 감사 로그가 없습니다"
            description="검색어나 필터 조건을 변경해 보세요."
          />
        ) : (
          <table>
            <thead>
              <tr>
                <th>발생 시각</th>
                <th>작업자</th>
                <th>작업 (Action)</th>
                <th>리소스</th>
                <th>결과</th>
                <th>IP / Request ID</th>
                <th style={{ textAlign: "right" }}>상세</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((log) => (
                <tr key={log.id}>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {new Date(log.createdAt).toLocaleString("ko-KR", {
                      dateStyle: "short",
                      timeStyle: "medium",
                    })}
                  </td>
                  <td>
                    {log.adminUserEmail ? (
                      <div>
                        <strong>{log.adminUserDisplayName ?? log.adminUserEmail}</strong>
                        <div style={{ fontSize: "12px", color: "var(--muted)" }}>{log.adminUserEmail}</div>
                      </div>
                    ) : (
                      <span style={{ color: "var(--muted)" }}>시스템 / 익명</span>
                    )}
                  </td>
                  <td>
                    <code>{log.action}</code>
                  </td>
                  <td>
                    <span style={{ fontSize: "13px" }}>{log.resourceType}</span>
                    {log.resourceId && (
                      <div style={{ fontSize: "11px", color: "var(--muted)" }}>ID: {log.resourceId.slice(0, 8)}...</div>
                    )}
                  </td>
                  <td>
                    <StatusBadge tone={getResultBadgeTone(log.result)}>
                      {log.result.toUpperCase()}
                    </StatusBadge>
                  </td>
                  <td>
                    <div style={{ fontSize: "12px" }}>{log.ipAddress ?? "-"}</div>
                    {log.requestId && (
                      <div style={{ fontSize: "11px", color: "var(--muted)" }}>{log.requestId.slice(0, 8)}...</div>
                    )}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      className="button button-secondary"
                      style={{ padding: "4px 10px", fontSize: "12px", minHeight: "28px" }}
                      onClick={() => setSelectedLog(log)}
                    >
                      상세 보기
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "24px" }}>
          <button
            type="button"
            className="button button-secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            이전
          </button>
          <span style={{ display: "grid", placeItems: "center", fontSize: "14px", color: "var(--muted)" }}>
            {data.page} / {data.totalPages} 페이지 (총 {data.totalItems}건)
          </span>
          <button
            type="button"
            className="button button-secondary"
            disabled={page >= data.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            다음
          </button>
        </div>
      )}

      {/* Detail Drawer */}
      <DetailDrawer
        isOpen={Boolean(selectedLog)}
        title="감사 로그 상세 정보"
        onClose={() => setSelectedLog(null)}
      >
        {selectedLog && (
          <div style={{ display: "grid", gap: "20px" }}>
            <dl className="definition-list">
              <div>
                <dt>로그 ID</dt>
                <dd><code>{selectedLog.id}</code></dd>
              </div>
              <div>
                <dt>발생 시각</dt>
                <dd>{new Date(selectedLog.createdAt).toISOString()}</dd>
              </div>
              <div>
                <dt>작업 (Action)</dt>
                <dd><strong>{selectedLog.action}</strong></dd>
              </div>
              <div>
                <dt>처리 결과</dt>
                <dd>
                  <StatusBadge tone={getResultBadgeTone(selectedLog.result)}>
                    {selectedLog.result.toUpperCase()}
                  </StatusBadge>
                </dd>
              </div>
              <div>
                <dt>작업자</dt>
                <dd>{selectedLog.adminUserEmail ?? "비인증 / 시스템"}</dd>
              </div>
              <div>
                <dt>IP 주소</dt>
                <dd>{selectedLog.ipAddress ?? "기록 없음"}</dd>
              </div>
              <div>
                <dt>요청 ID (Request ID)</dt>
                <dd><code>{selectedLog.requestId ?? "-"}</code></dd>
              </div>
              <div>
                <dt>대상 리소스</dt>
                <dd>{selectedLog.resourceType} {selectedLog.resourceId ? `(${selectedLog.resourceId})` : ""}</dd>
              </div>
            </dl>

            {selectedLog.beforeData ? (
              <div>
                <h3 style={{ fontSize: "14px", fontWeight: 600, margin: "0 0 8px 0" }}>변경 전 데이터 (Before)</h3>
                <pre style={{ background: "var(--surface-subtle)", padding: "12px", borderRadius: "6px", fontSize: "12px", overflowX: "auto" }}>
                  {JSON.stringify(selectedLog.beforeData, null, 2)}
                </pre>
              </div>
            ) : null}

            {selectedLog.afterData ? (
              <div>
                <h3 style={{ fontSize: "14px", fontWeight: 600, margin: "0 0 8px 0" }}>변경 후 데이터 (After)</h3>
                <pre style={{ background: "var(--surface-subtle)", padding: "12px", borderRadius: "6px", fontSize: "12px", overflowX: "auto" }}>
                  {JSON.stringify(selectedLog.afterData, null, 2)}
                </pre>
              </div>
            ) : null}

            {selectedLog.metadata && Object.keys(selectedLog.metadata as Record<string, unknown>).length > 0 ? (
              <div>
                <h3 style={{ fontSize: "14px", fontWeight: 600, margin: "0 0 8px 0" }}>추가 메타데이터</h3>
                <pre style={{ background: "var(--surface-subtle)", padding: "12px", borderRadius: "6px", fontSize: "12px", overflowX: "auto" }}>
                  {JSON.stringify(selectedLog.metadata, null, 2)}
                </pre>
              </div>
            ) : null}
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}
