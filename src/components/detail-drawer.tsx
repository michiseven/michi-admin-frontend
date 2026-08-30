"use client";

import { ReactNode } from "react";

interface DetailDrawerProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function DetailDrawer({ isOpen, title, onClose, children }: DetailDrawerProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        justifyContent: "flex-end",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(2px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "540px",
          height: "100%",
          backgroundColor: "#ffffff",
          boxShadow: "-4px 0 16px rgba(0, 0, 0, 0.1)",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          padding: "24px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #e5e7eb",
            paddingBottom: "16px",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ fontSize: "18px", fontWeight: 600, margin: 0 }}>{title}</h2>
          <button
            type="button"
            className="button"
            style={{ padding: "4px 12px", fontSize: "14px" }}
            onClick={onClose}
          >
            닫기
          </button>
        </div>
        <div style={{ flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}
