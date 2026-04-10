"use client";

import { login, resendVerificationEmail } from "@/lib/api";
import { ApiError } from "@/util";
import { LoginForm, loginSchema } from "@/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [bannerError, setBannerError] = useState("");
  const [notVerified, setNotVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent">(
    "idle",
  );

  const {
    register,
    handleSubmit,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    setBannerError("");
    setNotVerified(false);
    try {
      await login(data);
      const redirect = searchParams.get("redirect") || "/";
      router.replace(redirect);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.statusCode === 401) {
          setError("password", { message: err.message });
        } else if (err.statusCode === 403 && err.message.includes("verify")) {
          setNotVerified(true);
        } else if (err.statusCode === 429) {
          setBannerError(err.message);
        } else {
          setBannerError(err.message);
        }
      } else {
        setBannerError("Something went wrong, please try again");
      }
    }
  };

  const handleResend = async () => {
    const email = getValues("email");
    if (!email) {
      setBannerError("Please enter your email address first.");
      return;
    }
    setResendStatus("sending");
    try {
      await resendVerificationEmail(email);
      setResendStatus("sent");
    } catch {
      setResendStatus("idle");
      setBannerError("Failed to resend. Please try again.");
    }
  };

  const inputCls = (hasError: boolean) =>
    `w-full border-2 bg-gray-50/50 rounded-xl px-4 py-3.5 text-sm outline-none transition-all font-medium text-verdant-dark placeholder:text-gray-400 ${
      hasError
        ? "border-red-200 focus:border-red-400 focus:bg-white"
        : "border-gray-200 focus:border-green hover:bg-white"
    }`;

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-[420px] flex flex-col items-center">
        <Link
          href="/"
          className="font-playfair text-3xl sm:text-4xl font-black text-verdant-dark tracking-tight hover:text-green transition-colors mb-8"
        >
          Ver<em className="not-italic text-green">dant</em>
        </Link>

        <div className="w-full bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden">
          <div className="px-6 py-8 sm:p-10">
            <div className="text-center mb-8">
              <h1 className="font-playfair font-black text-verdant-dark text-3xl mb-2">
                Welcome Backs
              </h1>
              <p className="text-gray-500 font-medium text-sm">
                No account?{" "}
                <Link
                  href="/signup"
                  className="text-green font-medium hover:text-green-mid transition-colors"
                >
                  Sign up free
                </Link>
              </p>
            </div>

            <div className="mb-6 empty:hidden">
              {notVerified ? (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0 text-orange-500">
                    <Mail size={20} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-orange-900 leading-tight mb-1">
                      Verify your email
                    </p>
                    <p className="text-xs font-medium text-orange-700/80 leading-relaxed mb-3">
                      We sent a link to your inbox. Check your spam folder if
                      you can&apos;t find it.
                    </p>
                    <button
                      onClick={handleResend}
                      disabled={resendStatus !== "idle"}
                      className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-white border-2 border-orange-200 text-orange-600 px-4 py-2.5 rounded-xl hover:bg-orange-100 hover:border-orange-300 transition-colors disabled:opacity-60 disabled:cursor-not-allowed w-full"
                    >
                      {resendStatus === "sending" && (
                        <Loader2 size={14} className="animate-spin" />
                      )}
                      {resendStatus === "idle" && "Resend Verification"}
                      {resendStatus === "sending" && "Sending..."}
                      {resendStatus === "sent" && "Sent — Check Inbox"}
                    </button>
                  </div>
                </div>
              ) : bannerError ? (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3">
                  <AlertCircle
                    size={18}
                    strokeWidth={2.5}
                    className="text-red-500 flex-shrink-0"
                  />
                  <p className="text-sm font-medium text-red-600 leading-snug">
                    {bannerError}
                  </p>
                </div>
              ) : null}
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="flex flex-col gap-5"
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Email Address
                </label>
                <input
                  {...register("email")}
                  type="email"
                  autoFocus
                  autoComplete="email"
                  placeholder="you@email.com"
                  className={inputCls(!!errors.email)}
                />
                {errors.email && (
                  <p className="text-xs font-medium text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[11px] font-medium text-green hover:text-green-mid transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className={`${inputCls(!!errors.password)} pr-12`}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-verdant-dark transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff size={18} strokeWidth={2.5} />
                    ) : (
                      <Eye size={18} strokeWidth={2.5} />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs font-medium text-red-500 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green text-white py-4 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-green-mid transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed mt-2 flex justify-center items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2
                      size={18}
                      strokeWidth={2.5}
                      className="animate-spin"
                    />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs font-bold text-gray-400 mt-8 uppercase tracking-widest">
          By signing in you agree to our{" "}
          <Link
            href="/terms"
            className="text-gray-500 hover:text-green transition-colors"
          >
            Terms
          </Link>
          {" & "}
          <Link
            href="/privacy"
            className="text-gray-500 hover:text-green transition-colors"
          >
            Privacy
          </Link>
        </p>
      </div>
    </div>
  );
}
