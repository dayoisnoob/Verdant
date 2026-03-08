"use client";

import { forgotPassword } from "@/lib/api";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    try {
      if (!email) return;
      await forgotPassword(email);
      toast.success(
        "If this email exists, we'll send a link to retrieve your password",
      );
    } catch {
      setError("Failed to send reset link");
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
        <div className="max-w-md w-full">
          {/* Icon */}
          <div className="w-20 h-20 bg-green-pale rounded-full flex items-center justify-center mb-8">
            <svg
              viewBox="0 0 24 24"
              className="w-9 h-9 text-green"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Heading */}
          <p className="text-xs tracking-[0.15em] uppercase text-green mb-2">
            Account recovery
          </p>
          <h1 className="font-playfair font-black text-verdant-dark text-4xl leading-tight mb-3">
            Forgot your
            <br />
            password?
          </h1>
          <p className="text-verdant-muted text-sm leading-relaxed mb-10">
            No worries. Enter the email address on your account and we&apos;ll
            send you a link to reset it.
          </p>

          {/* Form — wire up onSubmit to POST /auth/forgot-password */}
          <form className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-verdant-dark uppercase tracking-wider">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                name="email"
                placeholder="jane@email.com"
                className="border border-[#e5e5e5] rounded-xl px-4 py-3.5 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/10 transition-all bg-white text-verdant-dark placeholder:text-[#ccc]"
              />
            </div>

            {/* Submit — wire up */}
            <button
              type="submit"
              onClick={handleSubmit}
              className="w-full bg-green text-white py-4 rounded-full font-semibold text-base hover:bg-green-mid transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(45,106,79,0.28)]"
            >
              Send Reset Link
            </button>
          </form>

          {/* Back to login */}
          <div className="flex items-center justify-center gap-2 mt-8">
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 text-[#bbb]"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <Link
              href="/login"
              className="text-sm text-verdant-muted hover:text-green transition-colors"
            >
              Back to sign in
            </Link>
          </div>

          {/* Divider */}
          <div className="h-px bg-[#e5e5e5] my-8" />

          {/* Help note */}
          <div className="bg-white border border-green/10 rounded-2xl p-5 flex gap-4 items-start">
            <div className="text-xl flex-shrink-0 mt-0.5">💡</div>
            <div>
              <p className="text-sm font-medium text-verdant-dark mb-1">
                Still can&apos;t get in?
              </p>
              <p className="text-xs text-verdant-muted leading-relaxed">
                Check your spam folder for the reset email, or{" "}
                <Link
                  href="/contact"
                  className="text-green font-medium hover:underline underline-offset-2"
                >
                  contact our support team
                </Link>{" "}
                and we&apos;ll get you back in within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
