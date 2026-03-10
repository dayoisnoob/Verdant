"use client";

import { resendVerificationEmail } from "@/lib/api";
import { useAuthStore } from "@/store/store";
import { Leaf } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

function BackgroundDecor() {
  return (
    <>
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-green-mid/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-24 w-96 h-96 rounded-full bg-orange/8 blur-3xl pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px",
        }}
      />
      <div className="absolute top-8 right-8 text-green-mid/15 pointer-events-none select-none">
        <Leaf size={52} strokeWidth={0.8} />
      </div>
      <div className="absolute bottom-8 left-8 text-green-mid/10 pointer-events-none select-none rotate-[200deg]">
        <Leaf size={36} strokeWidth={0.8} />
      </div>
    </>
  );
}

export default function CheckEmailPage() {
  const email = useAuthStore((state) => state.signUpEmail);
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent">(
    "idle",
  );

  const handleResend = async () => {
    if (resendStatus !== "idle") return;
    setResendStatus("sending");
    try {
      await resendVerificationEmail(email);
      setResendStatus("sent");
      toast.success("Verification email sent");
    } catch {
      setResendStatus("idle");
      toast.error("Failed to resend. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1c13] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <BackgroundDecor />

      <div className="relative w-full max-w-[400px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-block font-playfair text-3xl font-black text-white tracking-tight"
          >
            Ver<em className="not-italic text-green-light">dant</em>
          </Link>
          <p className="text-white/30 text-[0.65rem] mt-1.5 uppercase tracking-[0.2em]">
            Farm fresh · Delivered
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#FAF7F0] rounded-[1.75rem] shadow-[0_40px_100px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)] overflow-hidden">
          <div className="h-[3px] bg-green" />

          <div className="px-8 pt-8 pb-9">
            {/* Icon */}
            <div className="w-14 h-14 bg-green-pale rounded-2xl flex items-center justify-center mb-5 text-2xl">
              ✉️
            </div>

            {/* Heading */}
            <h1 className="font-playfair font-black text-verdant-dark text-[1.85rem] leading-tight mb-2">
              Check your inbox
            </h1>
            <p className="text-verdant-muted text-sm leading-relaxed">
              We sent a verification link to
            </p>
            <p className="font-semibold text-verdant-dark text-sm mt-0.5 mb-6 truncate">
              {email}
            </p>

            {/* Steps */}
            <div className="bg-white border border-green/8 rounded-2xl p-5 mb-5">
              <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-verdant-muted mb-4">
                What to do next
              </p>
              <div className="flex flex-col gap-3.5">
                {[
                  "Open your email inbox",
                  "Find the email from hello@verdant.co",
                  'Click "Verify my account"',
                  "You'll be redirected to sign in",
                ].map((text, i) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-pale text-green text-[0.6rem] font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </div>
                    <span className="text-xs text-verdant-muted leading-snug">
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expiry note */}
            <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-6">
              <span className="text-sm flex-shrink-0 mt-0.5">⏱</span>
              <p className="text-xs text-amber-700 leading-relaxed">
                The link expires in{" "}
                <span className="font-semibold">24 hours</span>. If it expires,
                request a new one below.
              </p>
            </div>

            {/* Resend */}
            <div className="text-center">
              <p className="text-xs text-verdant-muted mb-3">
                Didn&apos;t receive it? Check your spam folder or
              </p>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendStatus !== "idle"}
                className="inline-flex items-center gap-2 text-xs font-semibold bg-white border border-green/20 text-green px-4 py-2 rounded-full hover:bg-green hover:text-white hover:border-green transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {resendStatus === "sending" && (
                  <span className="w-3 h-3 border border-green/30 border-t-green rounded-full animate-spin" />
                )}
                {resendStatus === "idle" && "Resend verification email"}
                {resendStatus === "sending" && "Sending…"}
                {resendStatus === "sent" && "✓ Sent — check your inbox"}
              </button>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#ebebeb] my-6" />

            {/* Escape hatch */}
            <p className="text-center text-xs text-verdant-muted">
              Wrong email?{" "}
              <Link
                href="/signup"
                className="text-green font-semibold hover:underline"
              >
                Sign up again
              </Link>
              {" · "}
              <Link
                href="/login"
                className="text-green font-semibold hover:underline"
              >
                Back to sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Trust strip */}
        <div className="flex items-center justify-center gap-5 mt-6">
          {["🔒 Secure", "🌱 120+ farms", "⚡ Same-day harvest"].map((item) => (
            <span
              key={item}
              className="text-[0.6rem] text-white/25 tracking-wide"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
