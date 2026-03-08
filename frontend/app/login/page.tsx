"use client";

import { login, resendVerificationEmail } from "@/lib/api";
import { EyeClosed, EyeIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

type LoginForm = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [notVerified, setNotVerified] = useState(false);
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent">(
    "idle",
  );

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      setError("");
      setNotVerified(false);
      await login(data);
      router.push(redirect);
    } catch (err) {
      if (err instanceof Error) {
        console.log(err);
        setError(err.message);
        if (
          err.message.toLowerCase().includes("verify") ||
          err.message.toLowerCase().includes("verified")
        ) {
          setNotVerified(true);
        }
      } else {
        setError("Something went wrong");
      }
    }
  };

  const handleResend = async () => {
    const email = getValues("email");

    if (!email) {
      setError("Please enter your email first.");
      return;
    }

    setResendStatus("sending");

    try {
      await resendVerificationEmail(email);
      setResendStatus("sent");
    } catch {
      setResendStatus("idle");
      setError("Failed to resend verification email.");
    }
  };

  return (
    <div className="h-screen grid grid-cols-2">
      {/* ── Left — Visual Panel ── */}
      <div className="relative overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=900&h=1200&fit=crop"
          alt="Farm at dawn"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-green-dark/70 via-green/50 to-green-dark/60" />

        {/* Logo */}
        <div className="absolute top-8 left-10">
          <Link
            href="/"
            className="font-playfair text-2xl font-black text-white"
          >
            Ver<em className="not-italic text-green-light">dant</em>
          </Link>
        </div>

        {/* Quote */}
        <div className="absolute bottom-12 left-10 right-10">
          <div className="w-10 h-0.5 bg-green-light mb-5" />
          <blockquote className="font-playfair text-2xl italic text-white leading-relaxed mb-4">
            &ldquo;The freshest produce, delivered before the dew dries.&rdquo;
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-green-light/30 border border-green-light/50 flex items-center justify-center text-lg">
              🌱
            </div>
            <div>
              <div className="text-white text-sm font-medium">
                Verdant Promise
              </div>
              <div className="text-white/60 text-xs">
                Harvested today, at your door tomorrow
              </div>
            </div>
          </div>
        </div>

        {/* Floating stat cards */}
        <div className="absolute top-1/3 left-10 right-10 flex flex-col gap-3">
          {[
            { icon: "🚜", num: "120+", label: "Partner Farms" },
            { icon: "⚡", num: "24h", label: "Harvest to Door" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4 flex items-center gap-4 w-fit"
            >
              <span className="text-2xl">{s.icon}</span>
              <div>
                <div className="font-playfair font-bold text-white text-xl leading-none">
                  {s.num}
                </div>
                <div className="text-white/70 text-xs mt-0.5">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right — Form Panel ── */}
      <div className="bg-cream flex flex-col justify-center px-16 py-12 overflow-y-auto">
        <div className="max-w-md w-full mx-auto">
          {/* Header */}
          <div className="mb-10">
            <p className="text-xs tracking-[0.15em] uppercase text-green mb-2">
              Welcome back
            </p>
            <h1 className="font-playfair font-black text-verdant-dark text-4xl leading-tight">
              Sign in to
              <br />
              your account
            </h1>
            <p className="text-verdant-muted text-sm mt-3">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-green font-medium hover:underline"
              >
                Create one free
              </Link>
            </p>
          </div>

          {/* Social login */}
          {/* <div className="flex flex-col gap-3 mb-8">
            <button className="w-full flex items-center justify-center gap-3 border border-[#e5e5e5] bg-white rounded-xl py-3.5 text-sm font-medium text-verdant-dark hover:border-green hover:bg-green-pale/30 transition-all duration-200">
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            <button className="w-full flex items-center justify-center gap-3 border border-[#e5e5e5] bg-white rounded-xl py-3.5 text-sm font-medium text-verdant-dark hover:border-green hover:bg-green-pale/30 transition-all duration-200">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
              Continue with GitHub
            </button>
          </div> */}

          {/* Divider */}
          {/* <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-[#e5e5e5]" />
            <span className="text-xs text-[#bbb] uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-[#e5e5e5]" />
          </div> */}

          <div className={`mb-6 ${error ? "min-h-[64px]" : ""}`}>
            {notVerified ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-sm text-yellow-800">
                  Please verify your email before signing in.
                </p>
                <button
                  onClick={handleResend}
                  disabled={resendStatus === "sending"}
                  className="mt-2 text-sm font-medium text-green hover:underline disabled:opacity-50"
                >
                  {resendStatus === "sending"
                    ? "Sending..."
                    : resendStatus === "sent"
                      ? "Verification email sent ✓"
                      : "Resend verification email"}
                </button>
              </div>
            ) : error ? (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 rounded-xl p-4 text-sm">
                {error}
              </div>
            ) : null}
          </div>

          {/* Form — wire up onSubmit */}
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-verdant-dark uppercase tracking-wider">
                Email address
              </label>

              <input
                autoFocus
                autoComplete="email"
                {...register("email")}
                type="email"
                placeholder="jane@email.com"
                className="border border-[#e5e5e5] rounded-xl px-4 py-3.5 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/10 transition-all bg-white text-verdant-dark placeholder:text-[#ccc]"
              />

              <p className="text-rose-500 text-xs mt-1 min-h-[16px]">
                {errors.email?.message}
              </p>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5 mt-5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-verdant-dark uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-green hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full border border-[#e5e5e5] rounded-xl px-4 py-3.5 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/10 transition-all bg-white text-verdant-dark placeholder:text-[#ccc] pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#bbb] hover:text-green transition-colors"
                >
                  {showPassword ? <EyeIcon /> : <EyeClosed />}
                </button>
              </div>

              <p className="text-rose-500 text-xs mt-1 min-h-[16px]">
                {errors.password?.message}
              </p>
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-3 cursor-pointer group mt-5">
              <div className="w-5 h-5 rounded-md border-2 border-[#e5e5e5] group-hover:border-green transition-colors flex items-center justify-center flex-shrink-0" />
              <span className="text-sm text-verdant-muted">
                Keep me signed in
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-green text-white py-4 rounded-full font-semibold text-base hover:bg-green-mid transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(45,106,79,0.28)] mt-6"
            >
              {isSubmitting ? "Signing you in" : "Sign In"}
            </button>
          </form>

          {/* Footer note */}
          <p className="text-center text-xs text-[#bbb] mt-8 leading-relaxed">
            By signing in you agree to our{" "}
            <Link href="/terms" className="text-green hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-green hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
