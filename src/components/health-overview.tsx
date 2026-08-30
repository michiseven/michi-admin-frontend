"use client";

import { useEffect, useState } from "react";
import { getAdminHealth, type AdminHealthResponse } from "@/lib/admin-api";
import { StatusBadge } from "./status-badge";

export function HealthOverview() {
  const [state, setState] = useState<
    | { kind: "loading" }
    | { kind: "error" }
    | { kind: "ready"; data: AdminHealthResponse }
  >({ kind: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    getAdminHealth(controller.signal).then((data) => setState({ kind: "ready", data })).catch((error: unknown) => {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setState({ kind: "error" });
    });
    return () => controller.abort();
  }, []);

  if (state.kind === "loading") return <section className="system-panel" aria-busy="true"><div><p className="section-kicker">System</p><h2>백엔드 상태 확인 중</h2></div><div className="health-skeleton" /></section>;
  if (state.kind === "error") return <section className="system-panel system-error"><div><p className="section-kicker">System</p><h2>백엔드에 연결할 수 없습니다</h2><p>API 주소와 백엔드 실행 상태를 확인하세요. 운영 수치는 표시하지 않았습니다.</p></div><StatusBadge tone="danger">연결 실패</StatusBadge></section>;

  const { data } = state;
  return <section className="system-panel">
    <div className="system-summary"><div><p className="section-kicker">System</p><h2>서비스 연결 상태</h2><p>마지막 확인 {new Date(data.timestamp).toLocaleString("ko-KR")}</p></div><StatusBadge tone={data.status === "ok" ? "success" : "warning"}>{data.status === "ok" ? "정상" : "저하"}</StatusBadge></div>
    <dl className="health-grid">
      <div><dt>관리자 Database</dt><dd><StatusBadge tone={data.database === "connected" ? "success" : "danger"}>{data.database === "connected" ? "연결됨" : "연결 실패"}</StatusBadge></dd></div>
      <div><dt>공개 API</dt><dd><StatusBadge tone={data.publicApi === "connected" ? "success" : "warning"}>{data.publicApi === "connected" ? "연결됨" : "중지됨"}</StatusBadge></dd></div>
    </dl>
  </section>;
}
