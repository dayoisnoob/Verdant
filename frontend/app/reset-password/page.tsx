"use client";

import { resetPassword } from "@/lib/api";
import { ApiError } from "@/util";
import { ResetPasswordForm, resetPasswordSchema } from "@/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import PasswordStrengthBar from "react-password-strength-bar";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [bannerError, setBannerError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setError: resetPasswordError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = useWatch({
    control,
    name: "newPassword",
    defaultValue: "",
  });

  const onSubmit = async (data: ResetPasswordForm) => {
    setBannerError("");
    if (!token) {
      setBannerError("Reset token is missing. Use the link from your email.");
      return;
    }
    try {
      await resetPassword(token, data);
      setSuccess(true);
    } catch (err) {
      if (!(err instanceof ApiError)) {
        setBannerError("Something went wrong. Please try again.");
        return;
      }

      if (err.errors?.length) {
        err.errors.forEach(({ field, message }) =>
          resetPasswordError(field as keyof ResetPasswordForm, { message }),
        );
      } else {
        setBannerError(err.message);
      }
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#0f1c13] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[400px]">
          <div className="text-center mb-8">
            <Link
              href="/"
              className="inline-block font-playfair text-3xl font-black text-white tracking-tight"
            >
              Ver<em className="not-italic text-green-light">dant</em>
            </Link>
            <p className="text-white/70 text-[0.65rem] mt-1.5 uppercase tracking-[0.2em]">
              Farm fresh · Delivered
            </p>
          </div>
          <div className="bg-[#FAF7F0] rounded-[1.75rem] shadow-[0_40px_100px_rgba(0,0,0,0.5)] px-8 py-9 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-2xl mx-auto mb-4">
              ⚠️
            </div>
            <h2 className="font-playfair font-black text-verdant-dark text-xl mb-2">
              Invalid reset link
            </h2>
            <p className="text-verdant-muted text-sm leading-relaxed mb-6">
              This link is missing a reset token. Please use the exact link from
              your email, or request a new one.
            </p>
            <Link
              href="/forgot-password"
              className="inline-block w-full bg-green text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-green-mid transition-all"
            >
              Request new link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1c13] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="relative w-full max-w-[400px]">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-block font-playfair text-3xl font-black text-white tracking-tight"
          >
            Ver<em className="not-italic text-green-light">dant</em>
          </Link>
          <p className="text-white/70 text-[0.65rem] mt-1.5 uppercase tracking-[0.2em]">
            Farm fresh · Delivered
          </p>
        </div>

        <div className="bg-[#FAF7F0] rounded-[1.75rem] shadow-[0_40px_100px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)] overflow-hidden">
          <div className="px-8 pt-7 pb-9">
            {success ? (
              <div className="text-center py-4 flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-green-pale flex items-center justify-center text-3xl">
                  ✅
                </div>
                <div>
                  <h2 className="font-playfair font-black text-verdant-dark text-[1.6rem] leading-tight">
                    Password updated
                  </h2>
                  <p className="text-verdant-muted text-sm mt-2 leading-relaxed">
                    Your password has been reset. You can now sign in with your
                    new credentials.
                  </p>
                </div>
                <button
                  onClick={() => router.push("/login")}
                  className="w-full bg-green text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-green-mid transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(45,106,79,0.3)] mt-2"
                >
                  Go to Sign In
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h1 className="font-playfair font-black text-verdant-dark text-[1.85rem] leading-tight">
                    New password
                  </h1>
                  <p className="text-verdant-muted text-sm mt-1.5">
                    Choose something strong you haven&apos;t used before.
                  </p>
                </div>

                <div className="mb-5 overflow-hidden">
                  {bannerError && (
                    <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3.5 flex gap-3 items-start">
                      <span className="text-base flex-shrink-0 mt-0.5">
                        <TriangleAlert color="red" />
                      </span>
                      <p className="text-sm text-red-600 leading-snug">
                        {bannerError}
                      </p>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.62rem] font-bold uppercase tracking-[0.13em] text-verdant-muted">
                        New password
                      </label>
                      <div className="relative">
                        <input
                          {...register("newPassword")}
                          type={showPassword ? "text" : "password"}
                          autoFocus
                          autoComplete="new-password"
                          placeholder="••••••••"
                          className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all bg-white text-verdant-dark placeholder:text-[#ccc] focus:ring-2 focus:ring-green/10 pr-11 ${
                            errors.newPassword
                              ? "border-red-300 focus:border-red-400"
                              : "border-[#e0ddd5] focus:border-green"
                          }`}
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={() => setShowPassword((p) => !p)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#bbb] hover:text-green transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff size={15} />
                          ) : (
                            <Eye size={15} />
                          )}
                        </button>
                      </div>

                      {password && <PasswordStrengthBar password={password} />}

                      <p className="text-[0.68rem] text-red-500 min-h-[14px] leading-none">
                        {errors.newPassword?.message}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1.5 -mt-1">
                      <label className="text-[0.62rem] font-bold uppercase tracking-[0.13em] text-verdant-muted">
                        Confirm password
                      </label>
                      <div className="relative">
                        <input
                          {...register("confirmNewPassword")}
                          type={showConfirm ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="••••••••"
                          className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all bg-white text-verdant-dark placeholder:text-[#ccc] focus:ring-2 focus:ring-green/10 pr-11 ${
                            errors.confirmNewPassword
                              ? "border-red-300 focus:border-red-400"
                              : "border-[#e0ddd5] focus:border-green"
                          }`}
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={() => setShowConfirm((p) => !p)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#bbb] hover:text-green transition-colors"
                        >
                          {showConfirm ? (
                            <EyeOff size={15} />
                          ) : (
                            <Eye size={15} />
                          )}
                        </button>
                      </div>
                      <p className="text-[0.68rem] text-red-500 min-h-[14px] leading-none">
                        {errors.confirmNewPassword?.message}
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-green text-white py-3.5 rounded-xl font-semibold text-sm tracking-wide hover:bg-green-mid transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(45,106,79,0.3)] disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none mt-1"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-[2.5px] border-white/30 border-t-white rounded-full animate-spin" />
                          Updating password…
                        </span>
                      ) : (
                        "Reset Password"
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-white/70 mt-3">
          Remembered it?{" "}
          <Link
            href="/login"
            className="hover:text-white/40 underline transition-colors"
          >
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
