"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Icon, type IconName } from "./icons";
import { useAdminAuth } from "./admin-auth-context";

const navigation: Array<{ href: string; label: string; icon: IconName }> = [
  { href: "/", label: "대시보드", icon: "dashboard" },
  { href: "/places", label: "장소 데이터", icon: "places" },
  { href: "/sync", label: "데이터 동기화", icon: "sync" },
  { href: "/evaluations", label: "추천 평가", icon: "evaluation" },
  { href: "/imports", label: "Import 이력", icon: "imports" },
  { href: "/members", label: "서비스 회원", icon: "users" },
  { href: "/users", label: "관리자 계정", icon: "audit" },
  { href: "/audit", label: "감사 로그", icon: "audit" },
  { href: "/settings", label: "설정", icon: "settings" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const environment = process.env.NEXT_PUBLIC_APP_ENV ?? "development";
  const { user, authEnabled, signOut } = useAdminAuth();

  return <div className="admin-shell">
    <a className="skip-link" href="#main-content">본문으로 건너뛰기</a>
    <header className="mobile-header">
      <Link href="/" className="mobile-brand"><span className="brand-mark">道</span><span>Michi Admin</span></Link>
      <button className="icon-button" type="button" aria-label={open ? "메뉴 닫기" : "메뉴 열기"} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <Icon name={open ? "close" : "menu"} />
      </button>
    </header>
    {open ? <button type="button" className="nav-scrim" aria-label="메뉴 바깥 영역 닫기" onClick={() => setOpen(false)} /> : null}
    <aside className={`sidebar${open ? " sidebar-open" : ""}`} aria-label="관리자 메뉴">
      <div className="sidebar-head">
        <Link href="/" className="brand" onClick={() => setOpen(false)}><span className="brand-mark">道</span><span><strong>Michi</strong><small>Operations</small></span></Link>
      </div>
      <nav className="nav-list">
        {navigation.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return <Link key={item.href} href={item.href} className="nav-item" aria-current={active ? "page" : undefined} onClick={() => setOpen(false)}>
            <Icon name={item.icon} /><span>{item.label}</span>
          </Link>;
        })}
      </nav>
      <div className="sidebar-foot">
        <span className="environment-dot" aria-hidden="true" />
        <span>
          <strong>{user?.displayName ?? environment}</strong>
          <small>{user ? `${user.role} · ${user.email}` : "운영 API 수정 기능 미연결"}</small>
          {authEnabled && user ? <button className="sidebar-logout" type="button" onClick={() => void signOut()}>로그아웃</button> : null}
        </span>
      </div>
    </aside>
    <main id="main-content" className="admin-main" tabIndex={-1}>{children}</main>
  </div>;
}
