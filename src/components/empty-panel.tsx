import type { ReactNode } from "react";

export function EmptyPanel({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="empty-panel"><div className="empty-mark" aria-hidden="true">—</div><h2>{title}</h2><p>{description}</p>{action ? <div className="empty-action">{action}</div> : null}</div>;
}
