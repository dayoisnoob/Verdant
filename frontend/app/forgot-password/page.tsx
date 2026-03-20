"use client";

import { forgotPassword } from "@/lib/api";
import {
  AlertCircle,
  ArrowLeft,
  Lightbulb,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";
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

  const inputCls = (hasError: boolean) =>
    `w-full border-2 bg-gray-50/50 rounded-xl px-4 py-3.5 text-sm outline-none transition-all font-bold text-verdant-dark placeholder:text-gray-400 ${
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
            <div className="mb-8">
              <div className="w-16 h-16 rounded-2xl bg-green/10 border border-green/20 flex items-center justify-center mb-6 shadow-sm">
                <Lock className="w-8 h-8 text-green" strokeWidth={2} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-green mb-2">
                Account Recovery
              </p>
              <h1 className="font-playfair font-black text-verdant-dark text-3xl mb-3 leading-tight">
                {sent ? "Check your inbox" : "Forgot Password?"}
              </h1>
              <p className="text-gray-500 font-medium text-sm leading-relaxed">
                {sent
                  ? `We sent a reset link to ${email}. It expires in 15 minutes.`
                  : "Enter your account email and we'll send you a link to reset it securely."}
              </p>
            </div>

            {sent ? (
              <div className="flex flex-col gap-6">
                <div className="bg-green/5 border border-green/20 rounded-2xl p-5 flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-green/10 flex items-center justify-center flex-shrink-0 text-green">
                    <Mail size={20} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-verdant-dark leading-tight mb-1">
                      Email on its way
                    </p>
                    <p className="text-xs font-medium text-gray-500 leading-relaxed">
                      Can&apos;t find it? Check your spam folder or{" "}
                      <button
                        onClick={() => setSent(false)}
                        className="text-green font-bold hover:text-green-mid transition-colors"
                      >
                        try again
                      </button>
                      .
                    </p>
                  </div>
                </div>

                <Link
                  href="/login"
                  className="w-full bg-green text-white py-4 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-green-mid transition-all shadow-sm flex items-center justify-center text-center"
                >
                  Back to Sign In
                </Link>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="flex flex-col gap-5"
              >
                {error && (
                  <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 mb-1">
                    <AlertCircle
                      size={18}
                      strokeWidth={2.5}
                      className="text-red-500 flex-shrink-0"
                    />
                    <p className="text-sm font-bold text-red-600 leading-snug">
                      {error}
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    Email Address
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
                    className={inputCls(!!error)}
                  />
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
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>

                <div className="mt-2 text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-green transition-colors"
                  >
                    <ArrowLeft size={14} strokeWidth={2.5} /> Back to Sign In
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="w-full mt-6 bg-white border border-gray-200 rounded-2xl p-5 flex gap-4 items-start shadow-sm">
          <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center flex-shrink-0 text-yellow-600">
            <Lightbulb size={16} strokeWidth={2.5} />
          </div>
          <p className="text-xs font-medium text-gray-500 leading-relaxed pt-0.5">
            Still can&apos;t get in?{" "}
            <Link
              href="/contact"
              className="text-verdant-dark font-bold hover:text-green transition-colors"
            >
              Contact support
            </Link>{" "}
            and we&apos;ll get you back into your account within 24 hours.
          </p>
        </div>
      </div>
    </div>
  );
}
