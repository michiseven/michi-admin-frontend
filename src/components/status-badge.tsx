import type { ReactNode } from "react";

export function StatusBadge({ tone, children }: { tone: "success" | "warning" | "neutral" | "danger"; children: ReactNode }) {
  return <span className={`status-badge status-${tone}`}><span aria-hidden="true" />{children}</span>;
}
