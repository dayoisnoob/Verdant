"use client";

import { verifyEmail } from "@/lib/api";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type Status = "loading" | "success" | "error";

function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>(token ? "loading" : "error");
  const [message, setMessage] = useState(
    token ? "" : "Invalid or missing verification token.",
  );

  useEffect(() => {
    if (!token) return;

    const verify = async () => {
      try {
        await verifyEmail(token);
        setStatus("success");
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } catch (err) {
        setStatus("error");
        setMessage(
          err instanceof Error
            ? err.message
            : "Verification failed. Please try again.",
        );
      }
    };

    verify();
  }, [token, router]);

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-[420px] flex flex-col items-center">
        <Link
          href="/"
          className="font-playfair text-3xl sm:text-4xl font-black text-verdant-dark tracking-tight hover:text-green transition-colors mb-8"
        >
          Ver<em className="not-italic text-green">dant</em>
        </Link>

        <div className="w-full bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 p-8 sm:p-10 text-center flex flex-col items-center">
          {status === "loading" && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-6 shadow-sm">
                <Loader2
                  className="w-8 h-8 text-gray-400 animate-spin"
                  strokeWidth={2.5}
                />
              </div>
              <h1 className="font-playfair font-black text-verdant-dark text-3xl mb-3">
                Verifying Email
              </h1>
              <p className="text-gray-500 font-medium text-sm leading-relaxed mb-2">
                Hang tight while we securely confirm your email address.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-green/10 border border-green/20 flex items-center justify-center mb-6 shadow-sm">
                <CheckCircle2
                  className="w-8 h-8 text-green"
                  strokeWidth={2.5}
                />
              </div>
              <h1 className="font-playfair font-black text-verdant-dark text-3xl mb-3">
                You&apos;re Verified!
              </h1>
              <p className="text-gray-500 font-medium text-sm leading-relaxed mb-6">
                Your account is ready to go.
              </p>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-green">
                <Loader2 size={14} className="animate-spin" strokeWidth={3} />{" "}
                Redirecting...
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-6 shadow-sm">
                <XCircle className="w-8 h-8 text-red-500" strokeWidth={2.5} />
              </div>
              <h1 className="font-playfair font-black text-verdant-dark text-3xl mb-3">
                Verification Failed
              </h1>
              <p className="text-gray-500 font-medium text-sm leading-relaxed mb-8">
                {message}
              </p>

              <div className="flex flex-col gap-3 w-full">
                <Link
                  href="/login"
                  className="w-full bg-green text-white py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-green-mid transition-all shadow-sm"
                >
                  Back to Sign In
                </Link>
                <Link
                  href="/signup"
                  className="w-full py-4 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-500 bg-white border-2 border-gray-200 hover:border-gray-300 hover:text-verdant-dark transition-colors"
                >
                  Create New Account
                </Link>
              </div>
            </>
          )}
        </div>

        {status === "error" && (
          <p className="text-center text-xs font-bold text-gray-400 mt-8 uppercase tracking-widest">
            Need help?{" "}
            <Link
              href="/contact"
              className="text-gray-500 hover:text-green transition-colors"
            >
              Contact Support
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPageWrapper() {
  return (
    <Suspense>
      <VerifyEmailPage />
    </Suspense>
  );
}
