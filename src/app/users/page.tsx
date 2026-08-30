"use client";

import { useEffect, useState } from "react";
import { DemoBadge } from "@/components/demo-badge";
import { EmptyPanel } from "@/components/empty-panel";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { useAdminAuth } from "@/components/admin-auth-context";
import {
  AdminUserDetail,
  getAdminUsers,
  inviteAdminUser,
  PageResponse,
  updateAdminUserRole,
  updateAdminUserStatus,
} from "@/lib/admin-api";

export default function UsersPage() {
  const { authEnabled, user: currentUser } = useAdminAuth();
  const [data, setData] = useState<PageResponse<AdminUserDetail> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Filters
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  // Invite Modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteDisplayName, setInviteDisplayName] = useState("");
  const [inviteRole, setInviteRole] = useState<"owner" | "admin" | "operator" | "viewer">("operator");
  const [submittingInvite, setSubmittingInvite] = useState(false);

  const canManage = !authEnabled || currentUser?.role === "owner" || currentUser?.role === "admin";
  const isOwner = !authEnabled || currentUser?.role === "owner";

  const executeFetch = (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    getAdminUsers(
      {
        query: query.trim() || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
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
        setError(err instanceof Error ? err.message : "사용자 목록을 불러오지 못했습니다.");
        setLoading(false);
      });
  };

  useEffect(() => {
    const controller = new AbortController();
    getAdminUsers(
      {
        query: query.trim() || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
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
        setError(err instanceof Error ? err.message : "사용자 목록을 불러오지 못했습니다.");
        setLoading(false);
      });
    return () => controller.abort();
  }, [query, roleFilter, statusFilter, page]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteDisplayName.trim()) return;
    setSubmittingInvite(true);
    setError(null);
    setNotice(null);

    try {
      const created = await inviteAdminUser({
        email: inviteEmail.trim(),
        displayName: inviteDisplayName.trim(),
        role: inviteRole,
      });
      setShowInviteModal(false);
      setInviteEmail("");
      setInviteDisplayName("");
      setInviteRole("operator");
      setNotice(`관리자 ${created.displayName} (${created.email}) 님을 초대했습니다.`);
      executeFetch();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "초대에 실패했습니다.");
    } finally {
      setSubmittingInvite(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setError(null);
    setNotice(null);
    try {
      await updateAdminUserRole(userId, newRole);
      setNotice("사용자 역할이 변경되었습니다.");
      executeFetch();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "역할 변경에 실패했습니다.");
    }
  };

  const handleStatusToggle = async (userItem: AdminUserDetail) => {
    setError(null);
    setNotice(null);
    const newStatus = userItem.status === "active" ? "suspended" : "active";
    const actionLabel = newStatus === "active" ? "활성화" : "정지";
    if (!confirm(`${userItem.displayName} 계정을 ${actionLabel}하시겠습니까?`)) {
      return;
    }

    try {
      await updateAdminUserStatus(userItem.id, newStatus);
      setNotice(`계정이 ${actionLabel}되었습니다.`);
      executeFetch();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "상태 변경에 실패했습니다.");
    }
  };

  const getRoleBadgeTone = (role: string): "success" | "warning" | "danger" | "neutral" => {
    switch (role) {
      case "owner": return "danger";
      case "admin": return "warning";
      case "operator": return "success";
      default: return "neutral";
    }
  };

  const getStatusBadgeTone = (status: string): "success" | "warning" | "danger" | "neutral" => {
    switch (status) {
      case "active": return "success";
      case "invited": return "warning";
      case "suspended": return "danger";
      default: return "neutral";
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Identity & RBAC"
        title="관리자 계정 관리"
        description="관리자 계정 목록을 조회하고, 신규 관리자를 초대하거나 역할 및 상태를 관리합니다."
        actions={
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <DemoBadge />
            {canManage && (
              <button
                className="button button-primary"
                type="button"
                onClick={() => setShowInviteModal(true)}
              >
                신규 관리자 초대
              </button>
            )}
          </div>
        }
      />

      {notice && (
        <div className="notice notice-success" style={{ marginBottom: "16px" }}>
          {notice}
        </div>
      )}

      {error && (
        <div className="notice notice-danger" style={{ marginBottom: "16px" }}>
          <strong>오류</strong>: {error}
        </div>
      )}

      {/* Filter Bar */}
      <section className="filter-card">
        <div className="filter-grid" style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 200px" }}>
            <label htmlFor="user-search" className="filter-label">이메일 / 이름 검색</label>
            <input
              id="user-search"
              className="filter-input"
              type="text"
              placeholder="검색어 입력..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div style={{ width: "160px" }}>
            <label htmlFor="user-role" className="filter-label">역할 필터</label>
            <select
              id="user-role"
              className="filter-select"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">전체 역할</option>
              <option value="owner">Owner (최고 관리자)</option>
              <option value="admin">Admin (관리자)</option>
              <option value="operator">Operator (운영자)</option>
              <option value="viewer">Viewer (조회자)</option>
            </select>
          </div>

          <div style={{ width: "160px" }}>
            <label htmlFor="user-status" className="filter-label">상태 필터</label>
            <select
              id="user-status"
              className="filter-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">전체 상태</option>
              <option value="active">Active (활성)</option>
              <option value="invited">Invited (초대됨)</option>
              <option value="suspended">Suspended (정지)</option>
              <option value="disabled">Disabled (비활성)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="table-frame" style={{ marginTop: "24px" }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
            사용자 목록을 불러오는 중입니다...
          </div>
        ) : !data || data.items.length === 0 ? (
          <EmptyPanel
            title="조건에 맞는 사용자가 없습니다"
            description="검색어나 필터 조건을 변경해 보세요."
          />
        ) : (
          <table>
            <thead>
              <tr>
                <th>이름 / 이메일</th>
                <th>역할</th>
                <th>상태</th>
                <th>최종 로그인</th>
                <th>등록일</th>
                {canManage && <th style={{ textAlign: "right" }}>작업</th>}
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => {
                const isSelf = currentUser?.id === item.id;
                const targetIsOwner = item.role === "owner";
                const roleChangeDisabled = !canManage || (targetIsOwner && !isOwner);

                return (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.displayName}</strong>
                      <div style={{ fontSize: "12px", color: "var(--muted)" }}>{item.email}</div>
                    </td>
                    <td>
                      <StatusBadge tone={getRoleBadgeTone(item.role)}>
                        {item.role.toUpperCase()}
                      </StatusBadge>
                    </td>
                    <td>
                      <StatusBadge tone={getStatusBadgeTone(item.status)}>
                        {item.status.toUpperCase()}
                      </StatusBadge>
                    </td>
                    <td>
                      {item.lastLoginAt
                        ? new Date(item.lastLoginAt).toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" })
                        : "기록 없음"}
                    </td>
                    <td>
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString("ko-KR")
                        : "-"}
                    </td>
                    {canManage && (
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}>
                          <select
                            aria-label={`${item.displayName} 역할 변경`}
                            className="filter-select"
                            style={{ padding: "4px 8px", fontSize: "12px", height: "auto" }}
                            value={item.role}
                            disabled={roleChangeDisabled}
                            onChange={(e) => handleRoleChange(item.id, e.target.value)}
                          >
                            {isOwner && <option value="owner">Owner</option>}
                            <option value="admin">Admin</option>
                            <option value="operator">Operator</option>
                            <option value="viewer">Viewer</option>
                          </select>

                          <button
                            type="button"
                            className={`button ${item.status === "active" ? "button-danger" : "button-secondary"}`}
                            style={{ padding: "4px 10px", fontSize: "12px", minHeight: "28px" }}
                            disabled={isSelf || (targetIsOwner && !isOwner)}
                            onClick={() => handleStatusToggle(item)}
                          >
                            {item.status === "active" ? "정지" : "활성화"}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
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
            {data.page} / {data.totalPages} 페이지 (총 {data.totalItems}명)
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

      {/* Invite Modal */}
      {showInviteModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(0, 0, 0, 0.4)",
            display: "grid",
            placeItems: "center",
            padding: "20px",
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="invite-modal-title"
        >
          <div
            style={{
              background: "var(--surface)",
              borderRadius: "8px",
              padding: "28px",
              width: "min(100%, 460px)",
              boxShadow: "var(--shadow)",
              border: "1px solid var(--border)",
            }}
          >
            <h2 id="invite-modal-title" style={{ margin: "0 0 8px 0" }}>신규 관리자 초대</h2>
            <p style={{ margin: "0 0 20px 0", fontSize: "14px", color: "var(--muted)" }}>
              초대할 사용자의 이메일과 초기 권한을 설정합니다.
            </p>

            <form onSubmit={handleInvite} style={{ display: "grid", gap: "16px" }}>
              <div>
                <label htmlFor="invite-email" style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>
                  이메일 주소 *
                </label>
                <input
                  id="invite-email"
                  className="filter-input"
                  type="email"
                  required
                  placeholder="admin@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label htmlFor="invite-name" style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>
                  표시 이름 *
                </label>
                <input
                  id="invite-name"
                  className="filter-input"
                  type="text"
                  required
                  placeholder="홍길동"
                  value={inviteDisplayName}
                  onChange={(e) => setInviteDisplayName(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label htmlFor="invite-role-select" style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>
                  초기 역할 *
                </label>
                <select
                  id="invite-role-select"
                  className="filter-select"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as "owner" | "admin" | "operator" | "viewer")}
                  style={{ width: "100%" }}
                >
                  {isOwner && <option value="owner">Owner (최고 관리자)</option>}
                  <option value="admin">Admin (관리자)</option>
                  <option value="operator">Operator (운영자)</option>
                  <option value="viewer">Viewer (조회자)</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setShowInviteModal(false)}
                  disabled={submittingInvite}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={submittingInvite}
                >
                  {submittingInvite ? "초대 중..." : "초대 보내기"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
