import { useAuthStore } from "@/store/store";
import { apiFetch } from "../apiFetch";

export const refreshAccessToken = async () => {
  const res = await apiFetch<{ accessToken: string }>(
    "/api/auth/refresh-token",
    {
      method: "POST",
      credentials: "include",
    },
  );
  useAuthStore.getState().setAccessToken(res.accessToken);
};
