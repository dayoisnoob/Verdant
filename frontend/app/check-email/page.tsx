"use client";

import { resendVerificationEmail } from "@/lib/api";
import { useAuthStore } from "@/store/store";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function CheckEmailPage() {
  const email = useAuthStore((state) => state.signUpEmail);
  const [error, setError] = useState("");

  const handleResend = async () => {
    setError("");

    try {
      await resendVerificationEmail(email);
      toast.success("Verification email has been sent to your email");
    } catch {
      setError("Failed to resend verification email.");
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Minimal nav */}
      <div className="px-10 py-6 border-b border-green/10">
        <Link href="/" className="font-playfair text-2xl font-black text-green">
          Ver<em className="not-italic text-green-light">dant</em>
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-md w-full text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-green-pale rounded-full flex items-center justify-center mx-auto mb-8">
            <svg
              viewBox="0 0 24 24"
              className="w-9 h-9 text-green"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Heading */}
          <h1 className="font-playfair font-black text-verdant-dark text-4xl leading-tight mb-3">
            Check your email
          </h1>

          {/* Subtext — swap the hardcoded email for the one from your auth state/context */}
          <p className="text-verdant-muted text-base leading-relaxed mb-2">
            We sent a verification link to
          </p>
          <p className="font-semibold text-verdant-dark text-base mb-6">
            {email}
          </p>
          <p className="text-verdant-muted text-sm leading-relaxed mb-10">
            Click the link in that email to activate your account. It expires in{" "}
            <span className="font-medium text-verdant-dark">24 hours</span>.
          </p>

          {/* Steps */}
          <div className="bg-white border border-green/10 rounded-2xl p-6 text-left mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-green mb-4">
              What to do next
            </p>
            <div className="flex flex-col gap-4">
              {[
                { step: "1", text: "Open your email inbox" },
                { step: "2", text: "Look for an email from hello@verdant.co" },
                { step: "3", text: 'Click "Verify my account" in the email' },
                { step: "4", text: "You'll be redirected back to sign in" },
              ].map((item) => (
                <div key={item.step} className="flex items-center gap-4">
                  <div className="w-7 h-7 rounded-full bg-green-pale text-green text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {item.step}
                  </div>
                  <span className="text-sm text-verdant-muted">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Resend — wire up onClick to POST /auth/resend-verification */}
          <p className="text-sm text-verdant-muted mb-3">
            Didn&apos;t receive it? Check your spam folder or
          </p>
          <button
            type="button"
            className="text-sm font-semibold text-green hover:underline underline-offset-2 transition-all"
            onClick={handleResend}
          >
            Resend verification email
          </button>

          {error && <p className="text-rose-500 text-xs mt-1">{error}</p>}

          {/* Divider */}
          <div className="h-px bg-[#e5e5e5] my-8" />

          {/* Wrong email escape hatch */}
          <p className="text-xs text-[#bbb]">
            Wrong email address?{" "}
            <Link
              href="/signup"
              className="text-green font-medium hover:underline underline-offset-2"
            >
              Go back and sign up again
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
