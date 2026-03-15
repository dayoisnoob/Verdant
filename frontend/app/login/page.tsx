"use client";

import { loginApi, resendVerificationEmail } from "@/lib/api";
import { ApiError } from "@/util";
import { LoginForm, loginSchema } from "@/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

// ── Page ───────────────────────────────────────────────────────────────────
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
      console.log("try logged in");

      await loginApi(data);
      console.log("logged in");
      const redirect = searchParams.get("redirect") || "/";
      router.replace(redirect);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.statusCode === 401) {
          setError("password", { message: err.message });
        } else if (err.statusCode === 403 && err.message.includes("verify")) {
          setNotVerified(true);
        } else if (err.statusCode === 403) {
          setBannerError(err.message);
        } else {
          setBannerError("Something went wrong, please try again");
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

  return (
    <div className="min-h-screen bg-[#0f1c13] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="relative w-full max-w-[400px]">
        {/* Logo */}
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

        {/* Card */}
        <div className="bg-[#FAF7F0] rounded-[1.75rem] shadow-[0_40px_100px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)] overflow-hidden">
          {/* Top accent */}

          <div className="px-8 pt-7 pb-9">
            {/* Heading */}
            <div className="mb-6">
              <h1 className="font-playfair font-black text-verdant-dark text-[1.85rem] leading-tight">
                Welcome back
              </h1>
              <p className="text-verdant-muted text-sm mt-1.5">
                No account?{" "}
                <Link
                  href="/signup"
                  className="text-green font-semibold hover:underline"
                >
                  Sign up free
                </Link>
              </p>
            </div>

            {/* ── Banner — reserved height prevents layout shift ── */}
            <div className="mb-5 min-h-[44px]">
              {notVerified ? (
                <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 text-base">
                    ✉️
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-900 leading-snug">
                      Verify your email to continue
                    </p>
                    <p className="text-xs text-amber-700/80 mt-0.5 leading-relaxed">
                      We sent a link to your inbox. Check spam if you can&apos;t
                      find it.
                    </p>
                    <button
                      onClick={handleResend}
                      disabled={resendStatus !== "idle"}
                      className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-green/25 text-green px-3 py-1.5 rounded-full hover:bg-green hover:text-white hover:border-green transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {resendStatus === "sending" && (
                        <span className="w-3 h-3 border border-green/30 border-t-green rounded-full animate-spin" />
                      )}
                      {resendStatus === "idle" && "Resend verification email"}
                      {resendStatus === "sending" && "Sending…"}
                      {resendStatus === "sent" && "✓ Sent — check your inbox"}
                    </button>
                  </div>
                </div>
              ) : bannerError ? (
                <div className="rounded-2xl overflow-hidden border border-red-200/60">
                  <div className="bg-red-500 px-4 py-2 flex items-center gap-2">
                    <CircleAlert size={14} color="white" />
                    <p className="text-white text-[0.7rem] font-bold uppercase tracking-wider">
                      Sign in failed
                    </p>
                  </div>
                  <div className="bg-red-50 px-4 py-3">
                    <p className="text-red-700 text-sm leading-snug">
                      {bannerError}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="flex flex-col gap-4">
                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.62rem] font-bold uppercase tracking-[0.13em] text-verdant-muted">
                    Email address
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    autoFocus
                    autoComplete="email"
                    placeholder="you@email.com"
                    className={`border rounded-xl px-4 py-3 text-sm outline-none transition-all bg-white text-verdant-dark placeholder:text-[#ccc] focus:ring-2 focus:ring-green/10 ${
                      errors.email
                        ? "border-red-300 focus:border-red-400"
                        : "border-[#e0ddd5] focus:border-green"
                    }`}
                  />
                  <p className="text-[0.68rem] text-red-500 min-h-[14px] leading-none">
                    {errors.email?.message}
                  </p>
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5 -mt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[0.62rem] font-bold uppercase tracking-[0.13em] text-verdant-muted">
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-[0.65rem] text-green font-medium hover:underline"
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
                      className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all bg-white text-verdant-dark placeholder:text-[#ccc] focus:ring-2 focus:ring-green/10 pr-11 ${
                        errors.password
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
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <p className="text-[0.68rem] text-red-500 min-h-[14px] leading-none">
                    {errors.password?.message}
                  </p>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-green text-white py-3.5 rounded-xl font-semibold text-sm tracking-wide hover:bg-green-mid transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(45,106,79,0.3)] disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none mt-1"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-[2.5px] border-white/30 border-t-white rounded-full animate-spin" />
                      Signing you in…
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <p className="text-center text-sm text-white/70 mt-3">
          By signing in you agree to our{" "}
          <Link
            href="/terms"
            className="hover:text-white/40 underline transition-colors"
          >
            Terms
          </Link>
          {" & "}
          <Link
            href="/privacy"
            className="hover:text-white/40 underline transition-colors"
          >
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
