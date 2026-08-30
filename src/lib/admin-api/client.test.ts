import { beforeEach, describe, expect, it, vi } from "vitest";
import { loginAdmin } from "./client";

describe("Admin auth API client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("sends login credentials with an HttpOnly-cookie compatible request", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({
        user: {
          id: "admin-1",
          email: "owner@michi.local",
          displayName: "Michi Owner",
          role: "owner",
          status: "active",
        },
        expiresAt: "2026-08-24T00:00:00Z",
      }), { status: 200, headers: { "Content-Type": "application/json" } })
    );

    const result = await loginAdmin("owner@michi.local", "secret-password");

    expect(result.user.role).toBe("owner");
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:4100/api/admin/auth/login",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ email: "owner@michi.local", password: "secret-password" }),
      })
    );
  });
});
