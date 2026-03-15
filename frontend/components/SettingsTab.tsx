"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { UserData } from "@/types";
import { changePassword, deleteUserApi, updateProfile } from "@/lib/api";
import { ApiError } from "@/util";
import { toast } from "sonner";
import { useAuthStore } from "@/store/store";
import { handleFormError } from "@/lib/helpers";
import DeleteAccountModal from "./DeleteAccountModal";
import {
  ChangePasswordForm,
  changePasswordSchema,
  ProfileForm,
  updateProfileSchema,
} from "@/validations";
import { useLogout } from "@/hooks";

// ── Field wrapper ──────────────────────────────────────────────────────────
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-verdant-dark uppercase tracking-wider">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function SettingsTab({ user }: { user: UserData }) {
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useLogout();

  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const {
    register: rProfile,
    handleSubmit: handleProfile,
    setError: setProfileError,
    formState: {
      errors: profileErrors,
      isSubmitting: savingProfile,
      isDirty: profileDirty,
    },
  } = useForm<ProfileForm>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
    },
  });

  const onSaveProfile = async (data: ProfileForm) => {
    try {
      const user = await updateProfile(data);
      setUser(user);
      toast.success("User updated successfully");
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        for (const { field, message } of err.errors) {
          setProfileError(field as keyof ProfileForm, { message });
        }
      } else {
        toast.error("Something went wrong, please try again");
      }
    }
  };

  const {
    register: rPassword,
    handleSubmit: handlePassword,
    setError: setPasswordError,
    formState: { errors: passwordErrors },
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSavePassword = async (data: ChangePasswordForm) => {
    setPasswordSaving(true);
    try {
      await changePassword(data);
      setPasswordSaving(false);
      toast.success("Password successfully changed, please sign in again");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await logout();
    } catch (err) {
      handleFormError(err, setPasswordError, {
        401: {
          field: "currentPassword",
          message: (err as ApiError).message,
        },
        422: {
          field: "newPassword",
          message: (err as ApiError).message,
        },
      });
    }
  };

  const handleDeleteAccount = async (password: string) => {
    await deleteUserApi(password);
  };

  return (
    <div className="max-w-xl flex flex-col gap-6">
      <h2 className="font-playfair font-bold text-verdant-dark text-2xl">
        Account Settings
      </h2>

      {/* ── Personal information ── */}
      <form
        onSubmit={handleProfile(onSaveProfile)}
        className="bg-white rounded-2xl border border-green/10 overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-[#f0f0f0]">
          <h3 className="font-semibold text-verdant-dark">
            Personal Information
          </h3>
          <p className="text-xs text-verdant-muted mt-0.5">
            Updates sync to your delivery &amp; order history
          </p>
        </div>

        <div className="px-6 py-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="First name" error={profileErrors.firstName?.message}>
              <input
                {...rProfile("firstName")}
                type="text"
                className="border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/10 transition-all bg-white text-verdant-dark"
              />
            </Field>
            <Field label="Last name" error={profileErrors.lastName?.message}>
              <input
                {...rProfile("lastName")}
                type="text"
                className="border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/10 transition-all bg-white text-verdant-dark"
              />
            </Field>
          </div>
        </div>

        <div className="px-6 pb-6 flex items-center gap-4">
          <button
            type="submit"
            disabled={savingProfile || !profileDirty}
            className="bg-green text-white px-8 py-3 rounded-full text-sm font-semibold hover:bg-green-mid transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(45,106,79,0.28)] disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
          >
            {savingProfile
              ? "Saving…"
              : profileSaved
                ? "✓ Saved"
                : "Save Changes"}
          </button>
          {!profileDirty && !profileSaved && (
            <p className="text-xs text-verdant-muted">No changes to save</p>
          )}
        </div>
      </form>

      {/* ── Password ── */}
      <form
        onSubmit={handlePassword(onSavePassword)}
        className="bg-white rounded-2xl border border-green/10 overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-[#f0f0f0]">
          <h3 className="font-semibold text-verdant-dark">Password</h3>
          <p className="text-xs text-verdant-muted mt-0.5">
            Leave blank to keep your current password
          </p>
        </div>

        <div className="px-6 py-6 flex flex-col gap-4">
          <Field
            label="Current password"
            error={passwordErrors.currentPassword?.message}
          >
            <input
              {...rPassword("currentPassword")}
              type="password"
              placeholder="••••••••"
              className="border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/10 transition-all bg-white text-verdant-dark placeholder:text-[#ccc]"
            />
          </Field>
          <Field
            label="New password"
            error={passwordErrors.newPassword?.message}
          >
            <input
              {...rPassword("newPassword")}
              type="password"
              placeholder="••••••••"
              className="border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/10 transition-all bg-white text-verdant-dark placeholder:text-[#ccc]"
            />
          </Field>
          <Field
            label="Confirm new password"
            error={passwordErrors.confirmNewPassword?.message}
          >
            <input
              {...rPassword("confirmNewPassword")}
              type="password"
              placeholder="••••••••"
              className="border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/10 transition-all bg-white text-verdant-dark placeholder:text-[#ccc]"
            />
          </Field>
        </div>

        <div className="px-6 pb-6">
          <button
            type="submit"
            disabled={passwordSaving}
            className="bg-green text-white px-8 py-3 rounded-full text-sm font-semibold hover:bg-green-mid transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(45,106,79,0.28)] disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
          >
            {passwordSaving ? "Updating…" : "Update Password"}
          </button>
        </div>
      </form>

      {/* ── Danger zone ── */}
      <div className="bg-white rounded-2xl border border-red-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-red-50">
          <h3 className="font-semibold text-verdant-dark">Danger Zone</h3>
          <p className="text-xs text-verdant-muted mt-0.5">
            These actions are permanent and cannot be undone
          </p>
        </div>
        <div className="px-6 py-5">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="text-sm text-red-400 border border-red-200 px-5 py-2.5 rounded-full hover:bg-red-50 hover:text-red-500 hover:border-red-300 transition-all"
          >
            Delete my account
          </button>
        </div>
      </div>

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
      />
    </div>
  );
}
