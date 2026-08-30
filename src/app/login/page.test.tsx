import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "./page";

const replace = vi.fn();
const signIn = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

vi.mock("@/components/admin-auth-context", () => ({
  useAdminAuth: () => ({ authEnabled: true, signIn }),
}));

describe("Admin login page", () => {
  afterEach(cleanup);

  beforeEach(() => {
    replace.mockReset();
    signIn.mockReset();
  });

  it("submits accessible email and password fields then redirects", async () => {
    const user = userEvent.setup();
    signIn.mockResolvedValue(undefined);
    render(<LoginPage />);

    await user.type(screen.getByLabelText("이메일"), "owner@michi.local");
    await user.type(screen.getByLabelText("비밀번호"), "long-password-123");
    await user.click(screen.getByRole("button", { name: "로그인" }));

    expect(signIn).toHaveBeenCalledWith("owner@michi.local", "long-password-123");
    expect(replace).toHaveBeenCalledWith("/");
  });

  it("shows authentication errors without clearing the form", async () => {
    const user = userEvent.setup();
    signIn.mockRejectedValue(new Error("로그인 실패"));
    render(<LoginPage />);

    await user.type(screen.getByLabelText("이메일"), "owner@michi.local");
    await user.type(screen.getByLabelText("비밀번호"), "wrong-password-123");
    await user.click(screen.getByRole("button", { name: "로그인" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Admin API에 연결하지 못했습니다");
    expect(screen.getByLabelText("이메일")).toHaveValue("owner@michi.local");
  });
});
