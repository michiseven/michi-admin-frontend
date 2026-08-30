import { isDemoMode } from "@/lib/admin-api";

export function DemoBadge() {
  if (!isDemoMode()) return null;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: "4px",
        fontSize: "12px",
        fontWeight: 600,
        backgroundColor: "#fef3c7",
        color: "#92400e",
        border: "1px solid #fde68a",
        marginLeft: "8px",
      }}
    >
      DEMO DATA
    </span>
  );
}
