import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminApp } from "@/components/admin-auth";
import "./globals.css";

export const metadata: Metadata = { title: { default: "Michi Admin", template: "%s | Michi Admin" }, description: "Michi 운영 및 관광 데이터 관리 콘솔" };

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="ko"><body><AdminApp>{children}</AdminApp></body></html>;
}
