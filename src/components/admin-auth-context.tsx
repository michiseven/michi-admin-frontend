"use client";

import { createContext, useContext } from "react";
import type { AdminUser } from "@/lib/admin-api";

export type AdminAuthContextValue = {
  user: AdminUser | null;
  authEnabled: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const AdminAuthContext = createContext<AdminAuthContextValue>({
  user: null,
  authEnabled: false,
  signIn: async () => undefined,
  signOut: async () => undefined,
});

export function useAdminAuth(): AdminAuthContextValue {
  return useContext(AdminAuthContext);
}
