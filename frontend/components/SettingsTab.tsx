"use client";

// ── Drop this in place of the {tab === "settings" && (...)} block ──────────
// Make sure these imports are at the top of your profile page file:
//
// import { useForm } from "react-hook-form"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { z } from "zod"

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { UserData } from "@/types";
import { changePassword, updateProfile } from "@/lib/api";
import { ApiError } from "@/util";
import { toast } from "sonner";
import { useAuthStore } from "@/store/store";
import { handleFormError } from "@/lib/api/helpers";

// ── Validation schemas ─────────────────────────────────────────────────────

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Must be at least 8 characters"),
    confirmNewPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

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

// ── Notification toggle (local state) ─────────────────────────────────────
function NotificationRow({
  label,
  desc,
  defaultOn,
}: {
  label: string;
  desc: string;
  defaultOn: boolean;
}) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between py-4">
      <div>
        <p className="text-sm font-medium text-verdant-dark">{label}</p>
        <p className="text-xs text-verdant-muted mt-0.5">{desc}</p>
      </div>
      {/* TODO: wire onChange to PATCH /auth/me notification prefs */}
      <button
        type="button"
        onClick={() => setOn((v) => !v)}
        className={`w-11 h-6 rounded-full transition-colors duration-200 relative flex-shrink-0 ${
          on ? "bg-green" : "bg-[#e5e5e5]"
        }`}
        aria-label={`Toggle ${label}`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
            on ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsTab({ user }: { user: UserData }) {
  const setUser = useAuthStore((s) => s.setUser);

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
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    },
  });

  const [profileSaved, setProfileSaved] = useState(false);

  const onSaveProfile = async (data: ProfileForm) => {
    try {
      const res = await updateProfile(data);
      setUser(res.data);
      toast.success(res.message);
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
    reset: resetPassword,
    setError: setPasswordError,
    formState: { errors: passwordErrors, isSubmitting: savingPassword },
  } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const [passwordSaved, setPasswordSaved] = useState(false);

  const onSavePassword = async (data: PasswordForm) => {
    console.log(data);

    try {
      const res = await changePassword(data);
      resetPassword();
      setPasswordSaved(true);
      setTimeout(() => setPasswordSaved(false), 2500);
      toast.success(res.message);
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

          <Field label="Email" error={profileErrors.email?.message}>
            <div className="relative">
              <input
                {...rProfile("email")}
                type="email"
                className="w-full border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/10 transition-all bg-white text-verdant-dark pr-24"
              />
              {user.isVerified && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.6rem] bg-green-pale text-green font-bold uppercase tracking-wider px-2 py-1 rounded-full">
                  Verified
                </span>
              )}
            </div>
          </Field>
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
            disabled={savingPassword}
            className="bg-green text-white px-8 py-3 rounded-full text-sm font-semibold hover:bg-green-mid transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(45,106,79,0.28)] disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
          >
            {savingPassword
              ? "Updating…"
              : passwordSaved
                ? "✓ Updated"
                : "Update Password"}
          </button>
        </div>
      </form>

      {/* ── Notifications ── */}
      <div className="bg-white rounded-2xl border border-green/10 overflow-hidden">
        <div className="px-6 py-5 border-b border-[#f0f0f0]">
          <h3 className="font-semibold text-verdant-dark">Notifications</h3>
        </div>
        <div className="px-6 flex flex-col divide-y divide-[#f5f5f5]">
          {[
            {
              label: "Order updates",
              desc: "Dispatch, out for delivery, delivered",
              defaultOn: true,
            },
            {
              label: "Harvest alerts",
              desc: "When new seasonal produce arrives",
              defaultOn: true,
            },
            {
              label: "Loyalty points",
              desc: "When you earn or can redeem points",
              defaultOn: false,
            },
            {
              label: "Promotions & offers",
              desc: "Discounts and member-only deals",
              defaultOn: false,
            },
          ].map((n) => (
            <NotificationRow key={n.label} {...n} />
          ))}
        </div>
      </div>

      {/* ── Danger zone ── */}
      <div className="bg-white rounded-2xl border border-red-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-red-50">
          <h3 className="font-semibold text-verdant-dark">Danger Zone</h3>
          <p className="text-xs text-verdant-muted mt-0.5">
            These actions are permanent and cannot be undone
          </p>
        </div>
        <div className="px-6 py-5">
          {/* TODO: wire to DELETE /auth/me with confirmation dialog */}
          <button className="text-sm text-red-400 border border-red-200 px-5 py-2.5 rounded-full hover:bg-red-50 hover:text-red-500 hover:border-red-300 transition-all">
            Delete my account
          </button>
        </div>
      </div>
    </div>
  );
}
