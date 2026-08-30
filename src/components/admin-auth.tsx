"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AdminApiError, getCurrentAdmin, loginAdmin, logoutAdmin, type AdminUser } from "@/lib/admin-api";
import { AdminShell } from "./admin-shell";
import { AdminAuthContext } from "./admin-auth-context";

const AUTH_ENABLED = process.env.NEXT_PUBLIC_ADMIN_AUTH_MODE === "session";

export function AdminApp({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [checking, setChecking] = useState(AUTH_ENABLED && pathname !== "/login");
  const [checkError, setCheckError] = useState<string | null>(null);

  const checkSession = useCallback(async () => {
    if (!AUTH_ENABLED || pathname === "/login") return;
    setChecking(true);
    setCheckError(null);
    try {
      setUser(await getCurrentAdmin());
    } catch (error) {
      setUser(null);
      if (error instanceof AdminApiError && error.status === 401) {
        router.replace("/login");
      } else {
        setCheckError(error instanceof Error ? error.message : "로그인 상태를 확인하지 못했습니다.");
      }
    } finally {
      setChecking(false);
    }
  }, [pathname, router]);

  useEffect(() => {
    if (!AUTH_ENABLED || pathname === "/login") return;
    const controller = new AbortController();
    getCurrentAdmin(controller.signal)
      .then((currentUser) => {
        setUser(currentUser);
        setCheckError(null);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setUser(null);
        if (error instanceof AdminApiError && error.status === 401) {
          router.replace("/login");
        } else {
          setCheckError(error instanceof Error ? error.message : "로그인 상태를 확인하지 못했습니다.");
        }
      })
      .finally(() => setChecking(false));
    return () => controller.abort();
  }, [pathname, router]);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await loginAdmin(email, password);
    setUser(result.user);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await logoutAdmin();
    } finally {
      setUser(null);
      router.replace("/login");
    }
  }, [router]);

  const contextValue = useMemo(
    () => ({ user, authEnabled: AUTH_ENABLED, signIn, signOut }),
    [user, signIn, signOut]
  );

  let content: ReactNode;
  if (pathname === "/login") {
    content = children;
  } else if (checking) {
    content = <main className="auth-state" aria-live="polite"><p>관리자 세션을 확인하고 있습니다.</p></main>;
  } else if (checkError) {
    content = <main className="auth-state" role="alert">
      <h1>Admin API에 연결할 수 없습니다</h1>
      <p>{checkError}</p>
      <button className="button button-primary" type="button" onClick={() => void checkSession()}>다시 시도</button>
    </main>;
  } else if (AUTH_ENABLED && !user) {
    content = <main className="auth-state" aria-live="polite"><p>로그인 화면으로 이동하고 있습니다.</p></main>;
  } else {
    content = <AdminShell>{children}</AdminShell>;
  }

  return <AdminAuthContext.Provider value={contextValue}>{content}</AdminAuthContext.Provider>;
}
