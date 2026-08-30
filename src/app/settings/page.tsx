"use client";

import { useEffect, useState } from "react";
import { DemoBadge } from "@/components/demo-badge";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { useAdminAuth } from "@/components/admin-auth-context";
import {
  AdminHealthResponse,
  getAdminApiUrl,
  getAdminHealth,
  getProviderStatus,
  getPublicApiUrl,
  ProviderStatus,
} from "@/lib/admin-api";

export default function SettingsPage() {
  const { authEnabled, user } = useAdminAuth();
  const [health, setHealth] = useState<AdminHealthResponse | null>(null);
  const [providers, setProviders] = useState<ProviderStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const executeFetch = (signal?: AbortSignal) => {
    setError(null);
    Promise.all([getAdminHealth(signal), getProviderStatus(signal)])
      .then(([h, p]) => {
        setHealth(h);
        setProviders(p);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "설정 및 연결 상태를 불러오지 못했습니다.");
      });
  };

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([getAdminHealth(controller.signal), getProviderStatus(controller.signal)])
      .then(([h, p]) => {
        setHealth(h);
        setProviders(p);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "설정 및 연결 상태를 불러오지 못했습니다.");
      });
    return () => controller.abort();
  }, []);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Configuration"
        title="설정"
        description="브라우저에 공개 가능한 연결 정보와 아직 필요한 운영 보안 구성을 확인합니다."
        actions={<DemoBadge />}
      />

      {error && (
        <div className="notice notice-warning">
          <strong>상태 조회 실패</strong>: {error}
          <button className="button" type="button" onClick={() => executeFetch()} style={{ marginLeft: "12px" }}>
            다시 시도
          </button>
        </div>
      )}

      <section className="settings-section">
        <h2>API 연결 상태</h2>
        <dl className="definition-list">
          <div>
            <dt>Public API URL</dt>
            <dd>
              <code>{getPublicApiUrl()}</code>
              <span style={{ marginLeft: "8px" }}>
                <StatusBadge tone={health?.publicApi === "connected" ? "success" : "warning"}>
                  {health?.publicApi ?? "확인중"}
                </StatusBadge>
              </span>
            </dd>
          </div>
          <div>
            <dt>Admin API URL (Ktor)</dt>
            <dd>
              <code>{getAdminApiUrl()}</code>
              <span style={{ marginLeft: "8px" }}>
                <StatusBadge tone={health?.status === "ok" ? "success" : "warning"}>
                  {health?.status ?? "확인중"}
                </StatusBadge>
              </span>
            </dd>
          </div>
          <div>
            <dt>Database 상태</dt>
            <dd>
              <StatusBadge tone={health?.database === "connected" ? "success" : "danger"}>
                {health?.database ?? "확인중"} (Core Data Read-only)
              </StatusBadge>
            </dd>
          </div>
          <div>
            <dt>인증 방식</dt>
            <dd>
              <span>{authEnabled ? "HttpOnly Session" : "Development (Disabled)"}</span>
              {user ? <small> — {user.role} / {user.email}</small> : null}
            </dd>
          </div>
        </dl>
      </section>

      {providers && (
        <section className="settings-section" style={{ marginTop: "24px" }}>
          <h2>Provider 제공 모드</h2>
          <div className="table-frame">
            <table>
              <thead>
                <tr>
                  <th>Provider 항목</th>
                  <th>제공 모드</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>장소 검색 (Place Provider)</td>
                  <td><StatusBadge tone={providers.place === "live" ? "success" : "warning"}>{providers.place.toUpperCase()}</StatusBadge> <small>{providers.placeSource ?? "source 미확인"}</small></td>
                </tr>
                <tr>
                  <td>KTO TourAPI</td>
                  <td><StatusBadge tone={providers.kto === "live" ? "success" : "warning"}>{providers.kto.toUpperCase()}</StatusBadge></td>
                </tr>
                <tr>
                  <td>한국관광 데이터랩</td>
                  <td><StatusBadge tone={providers.tourismDataLab === "live" ? "success" : "warning"}>{providers.tourismDataLab.toUpperCase()}</StatusBadge></td>
                </tr>
                <tr>
                  <td>지역 혼잡도 (Crowd)</td>
                  <td><StatusBadge tone={providers.crowd === "live" ? "success" : "warning"}>{providers.crowd.toUpperCase()}</StatusBadge> <small>{providers.crowdSource ?? "source 미확인"}</small></td>
                </tr>
                <tr>
                  <td>경로 계산 (Routing)</td>
                  <td><StatusBadge tone={providers.routing === "live" ? "success" : "warning"}>{providers.routing.toUpperCase()}</StatusBadge></td>
                </tr>
                <tr>
                  <td>보행 접근성 GIS</td>
                  <td><StatusBadge tone={providers.accessibility === "live" ? "success" : "warning"}>{providers.accessibility.toUpperCase()}</StatusBadge></td>
                </tr>
                <tr>
                  <td>취향 파서 (LLM)</td>
                  <td><StatusBadge tone={providers.llm === "live" ? "success" : "warning"}>{providers.llm.toUpperCase()}</StatusBadge></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="settings-section" style={{ marginTop: "24px" }}>
        <h2>운영 전 필수 조건 (Security Checklist)</h2>
        <ul className="check-list">
          <li><span aria-hidden="true">1</span>HttpOnly Secure 세션 적용 완료 · mutation 연결 전 CSRF 토큰 추가 필요</li>
          <li><span aria-hidden="true">2</span>RBAC 적용 완료 · owner/admin/operator/viewer 역할 운영</li>
          <li><span aria-hidden="true">3</span>관리자 인증·계정 변경 감사 로그 저장 완료</li>
          <li><span aria-hidden="true">4</span>Core 데이터 조회용 PostgreSQL Read-only 계정 분리 확인 필요</li>
        </ul>
      </section>
    </div>
  );
}
