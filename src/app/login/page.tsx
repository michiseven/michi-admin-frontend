"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminApiError } from "@/lib/admin-api";
import { useAdminAuth } from "@/components/admin-auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { authEnabled, signIn } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await signIn(email, password);
      router.replace("/");
    } catch (caught) {
      if (caught instanceof AdminApiError) {
        setError(caught.message);
      } else {
        setError("Admin API에 연결하지 못했습니다. 서버 상태를 확인해 주세요.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return <main className="login-page">
    <section className="login-panel" aria-labelledby="login-title">
      <div className="login-brand" aria-label="Michi Admin">
        <span className="brand-mark" aria-hidden="true">道</span>
        <span><strong>Michi</strong><small>Operations</small></span>
      </div>
      <div>
        <p className="eyebrow">Administrator access</p>
        <h1 id="login-title">관리자 로그인</h1>
        <p className="page-description">장소 데이터와 관광 분산 평가를 관리하려면 인증이 필요합니다.</p>
      </div>

      {!authEnabled ? <div className="notice notice-warning" role="status">
        현재 개발 환경에서 세션 인증이 비활성화되어 있습니다.
      </div> : null}

      <form className="login-form" onSubmit={handleSubmit}>
        <label htmlFor="admin-email">이메일</label>
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          disabled={submitting || !authEnabled}
        />

        <label htmlFor="admin-password">비밀번호</label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={12}
          disabled={submitting || !authEnabled}
        />

        {error ? <p className="form-error" role="alert">{error}</p> : null}

        <button className="button button-primary login-submit" type="submit" disabled={submitting || !authEnabled}>
          {submitting ? "로그인 중…" : "로그인"}
        </button>
      </form>
    </section>
  </main>;
}
