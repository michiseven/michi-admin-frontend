"use client";

import { useEffect, useState } from "react";
import { DemoBadge } from "@/components/demo-badge";
import { DetailDrawer } from "@/components/detail-drawer";
import { EmptyPanel } from "@/components/empty-panel";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { getSyncJobs, getSyncRuns, SyncJob, SyncRun } from "@/lib/admin-api";

export default function SyncPage() {
  const [jobs, setJobs] = useState<SyncJob[]>([]);
  const [runs, setRuns] = useState<SyncRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedRun, setSelectedRun] = useState<SyncRun | null>(null);

  const executeFetch = (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    Promise.all([getSyncJobs(signal), getSyncRuns(undefined, 1, 20, signal)])
      .then(([jobsData, runsData]) => {
        setJobs(jobsData);
        setRuns(runsData.items);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "동기화 작업 정보를 불러오지 못했습니다.");
        setLoading(false);
      });
  };

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([getSyncJobs(controller.signal), getSyncRuns(undefined, 1, 20, controller.signal)])
      .then(([jobsData, runsData]) => {
        setJobs(jobsData);
        setRuns(runsData.items);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "동기화 작업 정보를 불러오지 못했습니다.");
        setLoading(false);
      });
    return () => controller.abort();
  }, []);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Data operations"
        title="데이터 동기화"
        description="외부 데이터 수집 작업의 상태와 이력을 확인합니다."
        actions={<DemoBadge />}
      />

      <div className="notice notice-warning" role="note">
        <strong>실행 기능 비활성</strong>
        <span>관리자 인증·권한·감사 로그가 구현된 뒤에만 mutation API를 연결합니다.</span>
      </div>

      {error && (
        <div className="notice notice-warning">
          <strong>조회 실패</strong>: {error}
          <button className="button" type="button" onClick={() => executeFetch()} style={{ marginLeft: "12px" }}>
            다시 시도
          </button>
        </div>
      )}

      <section className="job-list" aria-label="동기화 작업">
        {loading ? (
          <div className="notice">동기화 작업 정보를 불러오는 중입니다...</div>
        ) : (
          jobs.map((job) => (
            <article className="job-row" key={job.key}>
              <div>
                <div className="job-title-line">
                  <h2>{job.name}</h2>
                  <StatusBadge
                    tone={
                      job.historyStatus === "available"
                        ? "success"
                        : job.historyStatus === "partial"
                        ? "warning"
                        : "neutral"
                    }
                  >
                    {job.historyStatus === "available"
                      ? "이력 확인 가능"
                      : job.historyStatus === "partial"
                      ? "일부 확인"
                      : "이력 미기록 (unavailable)"}
                  </StatusBadge>
                </div>
                <p>{job.description}</p>
                <small>스케줄: {job.schedule} | 최근 실행: {job.lastRunAt ? new Date(job.lastRunAt).toLocaleString("ko-KR") : "기록 없음"}</small>
              </div>
              <div className="job-actions">
                <button
                  className="button button-primary"
                  type="button"
                  disabled={!job.mutationEnabled}
                  title={job.mutationDisabledReason}
                >
                  동기화 실행 (비활성)
                </button>
              </div>
            </article>
          ))
        )}
      </section>

      <section style={{ marginTop: "32px" }}>
        <div className="section-heading">
          <div>
            <p className="section-kicker">History</p>
            <h2>동기화 실행 이력 (DataLab Import Lineage)</h2>
          </div>
        </div>

        <div className="table-frame">
          <table>
            <caption>동기화 실행 이력 목록</caption>
            <thead>
              <tr>
                <th>작업 키</th>
                <th>상태</th>
                <th>시작 시각</th>
                <th>완료 시각</th>
                <th>메시지</th>
                <th>상세</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "24px" }}>
                    이력을 불러오는 중입니다...
                  </td>
                </tr>
              ) : runs.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyPanel
                      title="동기화 실행 이력이 없습니다"
                      description="저장된 실행 이력이 없거나 해당 작업의 이력이 별도로 기록되지 않습니다."
                    />
                  </td>
                </tr>
              ) : (
                runs.map((run) => (
                  <tr key={run.id}>
                    <td><code>{run.jobKey}</code></td>
                    <td>
                      <StatusBadge tone={run.status === "completed" ? "success" : "warning"}>
                        {run.status}
                      </StatusBadge>
                    </td>
                    <td>{new Date(run.startedAt).toLocaleString("ko-KR")}</td>
                    <td>{run.completedAt ? new Date(run.completedAt).toLocaleString("ko-KR") : "진행중"}</td>
                    <td style={{ fontSize: "13px" }}>{run.message ?? "—"}</td>
                    <td>
                      <button
                        type="button"
                        className="button"
                        style={{ padding: "2px 8px", fontSize: "12px" }}
                        onClick={() => setSelectedRun(run)}
                      >
                        보기
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <DetailDrawer
        isOpen={Boolean(selectedRun)}
        title="동기화 실행 상세"
        onClose={() => setSelectedRun(null)}
      >
        {selectedRun && (
          <dl className="definition-list">
            <div>
              <dt>실행 ID</dt>
              <dd><code>{selectedRun.id}</code></dd>
            </div>
            <div>
              <dt>작업 식별자</dt>
              <dd><code>{selectedRun.jobKey}</code></dd>
            </div>
            <div>
              <dt>상태</dt>
              <dd><StatusBadge tone={selectedRun.status === "completed" ? "success" : "warning"}>{selectedRun.status}</StatusBadge></dd>
            </div>
            <div>
              <dt>시작 시각</dt>
              <dd>{new Date(selectedRun.startedAt).toLocaleString("ko-KR")}</dd>
            </div>
            <div>
              <dt>완료 시각</dt>
              <dd>{selectedRun.completedAt ? new Date(selectedRun.completedAt).toLocaleString("ko-KR") : "진행중"}</dd>
            </div>
            <div>
              <dt>결과 요약</dt>
              <dd>{selectedRun.message ?? "—"}</dd>
            </div>
          </dl>
        )}
      </DetailDrawer>
    </div>
  );
}
