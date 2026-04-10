import { UserApi, UserData } from "@/types";
import { RegistrationForm } from "@/validations";
import { apiFetch } from "../apiFetch";
import { initiateLogin } from "../helpers";
import { useAuthStore } from "@/store/store";

export const login = async (data: { email: string; password: string }) => {
  const res = await apiFetch<UserApi>(`/api/auth/login`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  await initiateLogin(res);
};

export const register = async (data: RegistrationForm) => {
  await apiFetch(`/api/auth/register`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const verifyEmail = async (token: string) => {
  const res = await apiFetch<UserApi>(`/api/auth/verify-email?token=${token}`);

  await initiateLogin(res);
};

export const logout = async () => {
  await apiFetch("/api/auth/logout", { method: "POST" });
};

export const forgotPassword = async (email: string) => {
  return apiFetch("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
};

export const resetPassword = async (
  token: string,
  data: {
    newPassword: string;
    confirmNewPassword: string;
  },
) => {
  return apiFetch(`/api/auth/reset-password?token=${token}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const resendVerificationEmail = async (email: string) => {
  return apiFetch("/api/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
};

export const updateProfile = async (data: {
  firstName: string;
  lastName?: string;
}): Promise<UserData> => {
  const res = await apiFetch<{ updatedUser: UserData }>("/api/auth/profile", {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  return res.updatedUser;
};

export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}) => {
  return apiFetch("/api/auth/change-password", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

export const deleteUser = async (password: string) => {
  return apiFetch("/api/auth/delete", {
    method: "DELETE",
    body: JSON.stringify({ password }),
  });
};
