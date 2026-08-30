"use client";

import { useEffect, useState } from "react";
import { DemoBadge } from "@/components/demo-badge";
import { EmptyPanel } from "@/components/empty-panel";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { getMembers, type MemberListItem, type PageResponse } from "@/lib/admin-api";

const PAGE_SIZE = 20;

export default function MembersPage() {
  const [data, setData] = useState<PageResponse<MemberListItem> | null>(null);
  const [query, setQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [locale, setLocale] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    getMembers(
      {
        query: appliedQuery || undefined,
        locale: locale === "all" ? undefined : locale,
        status: status === "all" ? undefined : status,
        page,
        pageSize: PAGE_SIZE,
      },
      controller.signal
    )
      .then(setData)
      .catch((cause: unknown) => {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        setError(cause instanceof Error ? cause.message : "회원 목록을 불러오지 못했습니다.");
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [appliedQuery, locale, status, page]);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Customer Accounts"
        title="서비스 회원"
        description="여행자 회원의 활성 상태와 저장 일정 이용 현황을 읽기 전용으로 확인합니다. 관리자 계정은 별도 메뉴에서 관리합니다."
        actions={<DemoBadge />}
      />

      <div className="notice" role="note">
        <strong>개인정보 최소 표시</strong>
        <span>비밀번호 해시, refresh token, 일정 스냅샷과 메모는 이 목록 API에서 반환하지 않습니다.</span>
      </div>

      <form
        className="member-toolbar"
        onSubmit={(event) => {
          event.preventDefault();
          setLoading(true);
          setError(null);
          setPage(1);
          setAppliedQuery(query.trim());
        }}
        aria-label="서비스 회원 검색 및 필터"
      >
        <label>
          <span>이름 또는 이메일</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="회원 검색" />
        </label>
        <label>
          <span>기본 언어</span>
          <select value={locale} onChange={(event) => { setLoading(true); setError(null); setLocale(event.target.value); setPage(1); }}>
            <option value="all">전체</option>
            <option value="ja">일본어</option>
            <option value="ko">한국어</option>
          </select>
        </label>
        <label>
          <span>계정 상태</span>
          <select value={status} onChange={(event) => { setLoading(true); setError(null); setStatus(event.target.value); setPage(1); }}>
            <option value="all">전체</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
          </select>
        </label>
        <button className="button button-primary" type="submit">검색</button>
      </form>

      {error ? <div className="notice notice-warning" role="alert"><strong>조회 실패</strong>{error}</div> : null}

      <div className="table-frame">
        <table>
          <caption>서비스 회원 목록{data ? `, 총 ${data.totalItems}명` : ""}</caption>
          <thead>
            <tr>
              <th>회원</th>
              <th>기본 언어</th>
              <th>상태</th>
              <th>저장 일정</th>
              <th>최근 저장</th>
              <th>가입일</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="table-message" colSpan={6}>회원 목록을 불러오는 중입니다...</td></tr>
            ) : !data || data.items.length === 0 ? (
              <tr><td colSpan={6}><EmptyPanel title="조건에 맞는 회원이 없습니다" description="검색어나 필터 조건을 변경해 보세요." /></td></tr>
            ) : data.items.map((member) => (
              <tr key={member.id}>
                <td><strong>{member.displayName}</strong><small className="cell-subtext">{member.email}</small></td>
                <td>{member.locale === "ja" ? "일본어" : member.locale === "ko" ? "한국어" : member.locale}</td>
                <td><StatusBadge tone={member.status === "active" ? "success" : "warning"}>{member.status === "active" ? "활성" : "비활성"}</StatusBadge></td>
                <td>{member.savedTripCount.toLocaleString("ko-KR")}건</td>
                <td>{member.latestSavedAt ? new Date(member.latestSavedAt).toLocaleString("ko-KR") : "없음"}</td>
                <td>{new Date(member.createdAt).toLocaleDateString("ko-KR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 ? (
        <nav className="pagination" aria-label="회원 목록 페이지">
          <button className="button" type="button" disabled={page <= 1} onClick={() => { setLoading(true); setPage((value) => value - 1); }}>이전</button>
          <span>{data.page} / {data.totalPages} 페이지</span>
          <button className="button" type="button" disabled={page >= data.totalPages} onClick={() => { setLoading(true); setPage((value) => value + 1); }}>다음</button>
        </nav>
      ) : null}
    </div>
  );
}
