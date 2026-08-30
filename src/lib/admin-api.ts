export * from "./admin-api/contracts";
export * from "./admin-api/errors";
export * from "./admin-api/guards";
export * from "./admin-api/client";

// Backward compatibility helper types & functions
export type HealthResponse = {
  status: "ok" | "degraded";
  database: "connected" | "unavailable";
  providerModes: {
    place: "mock" | "live";
    kto: "mock" | "live";
    tourismDataLab: "mock" | "live";
    crowd: "mock" | "live";
    llm: "mock" | "live";
  };
  timestamp: string;
};

export async function getHealth(signal?: AbortSignal): Promise<HealthResponse> {
  const publicUrl = process.env.NEXT_PUBLIC_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
  try {
    const response = await fetch(`${publicUrl.replace(/\/$/, "")}/health`, {
      method: "GET",
      headers: { accept: "application/json" },
      cache: "no-store",
      signal,
    });
    if (!response.ok) throw new Error(`Backend health request failed with ${response.status}`);
    return (await response.json()) as HealthResponse;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new Error("Backend health request failed");
  }
}

export function publicApiUrl(): string {
  return process.env.NEXT_PUBLIC_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
}
