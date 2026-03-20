"use client";

import { resendVerificationEmail } from "@/lib/api";
import { useEmailStore } from "@/store/store";
import { ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function CheckEmailPage() {
  const email = useEmailStore((s) => s.email);
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent">(
    "idle",
  );

  const handleResend = async () => {
    if (resendStatus !== "idle" || !email) return;
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
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-[420px] flex flex-col items-center">
        <Link
          href="/"
          className="font-playfair text-3xl sm:text-4xl font-black text-verdant-dark tracking-tight hover:text-green transition-colors mb-8"
        >
          Ver<em className="not-italic text-green">dant</em>
        </Link>

        <div className="w-full bg-white/70 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 p-8 sm:p-10 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-green/10 border border-green/20 flex items-center justify-center mb-6 shadow-sm">
            <Mail className="w-8 h-8 text-green" strokeWidth={2} />
          </div>

          <h1 className="font-playfair font-black text-verdant-dark text-3xl mb-3">
            Check your inbox
          </h1>

          <p className="text-gray-500 font-medium text-sm leading-relaxed mb-8">
            We sent a verification link to <br />
            <span className="font-bold text-verdant-dark">
              {email || "your email"}
            </span>
            . Click the link to verify your account.
          </p>

          <div className="w-full flex flex-col gap-4">
            <button
              onClick={handleResend}
              disabled={resendStatus !== "idle" || !email}
              className={`w-full py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-sm flex justify-center items-center gap-2 ${
                resendStatus === "sent"
                  ? "bg-green-pale text-green border-2 border-green-light shadow-none"
                  : "bg-green text-white hover:bg-green-mid disabled:opacity-60 disabled:cursor-not-allowed"
              }`}
            >
              {resendStatus === "sending" && (
                <Loader2 size={16} strokeWidth={2.5} className="animate-spin" />
              )}
              {resendStatus === "idle" && "Resend Email"}
              {resendStatus === "sending" && "Sending..."}
              {resendStatus === "sent" && (
                <>
                  <CheckCircle2 size={16} strokeWidth={2.5} /> Sent Successfully
                </>
              )}
            </button>

            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Don&apos;t see it? Check your spam folder.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center flex flex-col gap-3">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-green transition-colors"
          >
            <ArrowLeft size={14} strokeWidth={2.5} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
