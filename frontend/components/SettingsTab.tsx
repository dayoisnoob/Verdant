"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { UserData } from "@/types";
import { changePassword, deleteUser, updateProfile } from "@/lib/api";
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
import { AlertTriangle, CheckCircle2, Lock, User } from "lucide-react";

/* ── Shared Form UI Components ── */

const inputCls =
  "w-full border-2 border-gray-100 bg-gray-50 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-green focus:bg-white transition-all text-verdant-dark font-bold placeholder:text-gray-300";

const Field = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
      {label}
    </label>
    {children}
    {error && <p className="text-xs font-bold text-red-500 mt-0.5">{error}</p>}
  </div>
);

/* ── Main Component ── */

export default function SettingsTab({ user }: { user: UserData }) {
  const updateUser = useAuthStore((s) => s.updateUser);
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
      const updatedUser = await updateProfile(data);
      updateUser(updatedUser);
      toast.success("Profile updated successfully");
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
      toast.success("Password successfully changed. Please sign in again.");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await logout();
    } catch (err) {
      setPasswordSaving(false);
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
    await deleteUser(password);
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl">
      <form
        onSubmit={handleProfile(onSaveProfile)}
        className="bg-white/85 rounded-3xl border-2 border-gray-100 shadow-sm overflow-hidden flex flex-col"
      >
        <div className="px-6 py-5 border-b-2 border-gray-100 flex items-center gap-3 bg-gray-50/50">
          <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center text-gray-500 shadow-sm">
            <User size={16} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="font-bold text-verdant-dark text-base leading-tight">
              Personal Information
            </h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
              Manage your account details
            </p>
          </div>
        </div>

        <div className="p-6 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="First name" error={profileErrors.firstName?.message}>
              <input
                {...rProfile("firstName")}
                type="text"
                className={inputCls}
                placeholder="Jane"
              />
            </Field>
            <Field label="Last name" error={profileErrors.lastName?.message}>
              <input
                {...rProfile("lastName")}
                type="text"
                className={inputCls}
                placeholder="Doe"
              />
            </Field>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2 border-t border-gray-100">
            <button
              type="submit"
              disabled={savingProfile || (!profileDirty && !profileSaved)}
              className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-sm disabled:cursor-not-allowed ${
                profileSaved
                  ? "bg-green/10 text-green border-2 border-green/20 shadow-none"
                  : "bg-green text-white hover:bg-green-mid disabled:opacity-60 disabled:shadow-none border-2 border-transparent"
              }`}
            >
              {savingProfile ? (
                "Saving..."
              ) : profileSaved ? (
                <>
                  <CheckCircle2 size={16} strokeWidth={2.5} /> Saved
                </>
              ) : (
                "Save Changes"
              )}
            </button>
            {!profileDirty && !profileSaved && (
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                No changes to save
              </p>
            )}
          </div>
        </div>
      </form>

      <form
        onSubmit={handlePassword(onSavePassword)}
        className="bg-white/85 rounded-3xl border-2 border-gray-100 shadow-sm overflow-hidden flex flex-col"
      >
        <div className="px-6 py-5 border-b-2 border-gray-100 flex items-center gap-3 bg-gray-50/50">
          <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center text-gray-500 shadow-sm">
            <Lock size={16} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="font-bold text-verdant-dark text-base leading-tight">
              Password
            </h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
              Secure your account
            </p>
          </div>
        </div>

        <div className="p-6 flex flex-col gap-6">
          <Field
            label="Current password"
            error={passwordErrors.currentPassword?.message}
          >
            <input
              {...rPassword("currentPassword")}
              type="password"
              placeholder="••••••••"
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field
              label="New password"
              error={passwordErrors.newPassword?.message}
            >
              <input
                {...rPassword("newPassword")}
                type="password"
                placeholder="••••••••"
                className={inputCls}
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
                className={inputCls}
              />
            </Field>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <button
              type="submit"
              disabled={passwordSaving}
              className="bg-verdant-dark text-white px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              {passwordSaving ? "Updating Password..." : "Update Password"}
            </button>
          </div>
        </div>
      </form>

      <div className="bg-white/85 rounded-3xl border-2 border-red-100 shadow-sm overflow-hidden flex flex-col mt-4">
        <div className="px-6 py-5 border-b-2 border-red-100 flex items-center gap-3 bg-red-50/50">
          <div className="w-8 h-8 rounded-full bg-white border-2 border-red-100 flex items-center justify-center text-red-500 shadow-sm">
            <AlertTriangle size={16} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="font-bold text-red-600 text-base leading-tight">
              Danger Zone
            </h3>
            <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mt-0.5">
              These actions are permanent
            </p>
          </div>
        </div>

        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-sm font-medium text-gray-600 max-w-sm">
            Once you delete your account, there is no going back. Please be
            certain.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="text-xs font-bold text-red-500 uppercase tracking-widest border-2 border-red-200 bg-red-50 px-6 py-3.5 rounded-xl hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors whitespace-nowrap shadow-sm"
          >
            Delete Account
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
