import { handleApiError } from "@/util";
import { useAuthStore } from "@/store/store";
import { refreshAccessToken } from "./api/index";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
let refreshPromise: Promise<void> | null = null;

async function attemptFetch(path: string, options?: RequestInit) {
  const accessToken = useAuthStore.getState().accessToken;

  return fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...options?.headers,
    },
  });
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await attemptFetch(path, options);

  if (res.ok) {
    const json = await res.json();
    return json.data;
  }

  if (res.status === 401) {
    if (path.includes("refresh-token")) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
      throw new Error("Session expired. Please sign in again.");
    }

    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }

    await refreshPromise;
    const retried = await attemptFetch(path, options);
    if (!retried.ok) await handleApiError(retried);
    const json = await retried.json();
    return json.data;
  }

  await handleApiError(res);
  throw new Error("Request failed");
}
