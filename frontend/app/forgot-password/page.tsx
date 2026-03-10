"use client";

import { forgotPassword } from "@/lib/api";
import { Lock, Mail, MoveLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch {
      setError("Failed to send reset link. Please try again.");
    } finally {
      setIsSubmitting(false);
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
          <div className="px-8 pt-7 pb-9">
            {/* Icon */}
            <div className="w-12 h-12 bg-green-pale rounded-2xl flex items-center justify-center mb-5">
              <Lock color="green" />
            </div>

            {/* Heading — changes on success */}
            <div className="mb-6">
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.13em] text-green mb-1.5">
                Account recovery
              </p>
              <h1 className="font-playfair font-black text-verdant-dark text-[1.85rem] leading-tight">
                {sent ? "Check your inbox" : "Forgot your password?"}
              </h1>
              <p className="text-verdant-muted text-sm mt-1.5 leading-relaxed">
                {sent
                  ? `We sent a reset link to ${email}. It expires in 15 minutes.`
                  : "Enter your account email and we'll send you a link to reset it."}
              </p>
            </div>

            {/* ── Sent state ── */}
            {sent ? (
              <div className="flex flex-col gap-3">
                <div className="border border-green/20 rounded-2xl p-4 flex gap-3 items-start bg-green-pale/40">
                  <div className="w-8 h-8 rounded-xl bg-green-pale flex items-center justify-center flex-shrink-0 text-base">
                    <Mail size={20} color="blue" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-verdant-dark leading-snug">
                      Email on its way
                    </p>
                    <p className="text-xs text-verdant-muted mt-0.5 leading-relaxed">
                      Can&apos;t find it? Check your spam folder or{" "}
                      <button
                        onClick={() => setSent(false)}
                        className="text-green font-semibold hover:underline"
                      >
                        try again
                      </button>
                      .
                    </p>
                  </div>
                </div>

                <Link
                  href="/login"
                  className="w-full flex items-center justify-center gap-2 bg-green text-white py-3.5 rounded-xl font-semibold text-sm tracking-wide hover:bg-green-mid transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(45,106,79,0.3)] mt-1"
                >
                  Back to sign in
                </Link>
              </div>
            ) : (
              /* ── Form ── */
              <form onSubmit={handleSubmit} noValidate>
                <div className="flex flex-col gap-4">
                  {/* Error banner */}
                  {error && (
                    <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3.5 flex gap-3 items-start">
                      <span className="text-base flex-shrink-0 mt-0.5">⚠️</span>
                      <p className="text-sm text-red-600 leading-snug">
                        {error}
                      </p>
                    </div>
                  )}

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.62rem] font-bold uppercase tracking-[0.13em] text-verdant-muted">
                      Email address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError("");
                      }}
                      autoFocus
                      autoComplete="email"
                      placeholder="you@email.com"
                      className={`border rounded-xl px-4 py-3 text-sm outline-none transition-all bg-white text-verdant-dark placeholder:text-[#ccc] focus:ring-2 focus:ring-green/10 ${
                        error
                          ? "border-red-300 focus:border-red-400"
                          : "border-[#e0ddd5] focus:border-green"
                      }`}
                    />
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
                        Sending…
                      </span>
                    ) : (
                      "Send Reset Link"
                    )}
                  </button>

                  {/* Back to login */}
                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-1.5 text-sm text-verdant-muted hover:text-green transition-colors"
                  >
                    <MoveLeft size={14} /> Back to sign in
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="mt-4 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 flex gap-3 items-start">
          <span className="text-base flex-shrink-0">💡</span>
          <p className="text-xs text-white/50 leading-relaxed">
            Still can&apos;t get in?{" "}
            <Link
              href="/contact"
              className="text-white/70 font-medium hover:text-white transition-colors underline underline-offset-2"
            >
              Contact support
            </Link>{" "}
            and we&apos;ll get you back within 24 hours.
          </p>
        </div>

        <p className="text-center text-sm text-white/70 mt-3">
          Remember it?{" "}
          <Link
            href="/login"
            className="text-white/90 font-medium hover:text-white underline underline-offset-2 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
