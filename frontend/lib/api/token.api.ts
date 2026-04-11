import { apiFetch } from "../apiFetch";

export const refreshAccessToken = async () => {
  await apiFetch("/api/auth/refresh-token", {
    method: "POST",
    credentials: "include",
  });
};
