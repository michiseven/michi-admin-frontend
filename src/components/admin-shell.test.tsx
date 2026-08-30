import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, expect, it } from "vitest";
import { AdminShell } from "./admin-shell";

vi.mock("next/navigation", () => ({ usePathname: () => "/sync" }));

describe("AdminShell", () => {
  it("marks the current page and exposes a keyboard-safe mobile menu", async () => {
    const user = userEvent.setup();
    render(<AdminShell><h1>내용</h1></AdminShell>);
    expect(screen.getByRole("link", { name: "데이터 동기화" })).toHaveAttribute("aria-current", "page");
    const menu = screen.getByRole("button", { name: "메뉴 열기" });
    await user.click(menu);
    expect(screen.getByRole("button", { name: "메뉴 닫기" })).toHaveAttribute("aria-expanded", "true");
  });
});
