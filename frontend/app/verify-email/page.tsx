"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import { verifyEmail } from "@/lib/api";

type Status = "loading" | "success" | "error";

export default function VerifyEmailPage() {
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
        const data = await verifyEmail(token);
        setStatus("success");
        setTimeout(() => {
          router.push(
            `/login?message=${encodeURIComponent(data.message || "Email verified! You can now sign in.")}`,
          );
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
    <>
      <main className="min-h-screen bg-cream flex items-center justify-center px-6 py-24">
        {/* Background texture */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_40%,rgba(82,183,136,0.07),transparent)] pointer-events-none" />

        <div className="relative w-full max-w-md">
          {/* Card */}
          <div className="bg-white border border-green/10 rounded-3xl shadow-[0_8px_40px_rgba(45,106,79,0.1)] overflow-hidden">
            {/* Top green accent bar */}
            <div className="h-1.5 bg-gradient-to-r from-green via-green-light to-green-pale" />

            <div className="px-10 py-12 text-center">
              {/* Logo */}
              <Link
                href="/"
                className="font-playfair text-2xl font-black text-green inline-block mb-10"
              >
                Ver<em className="not-italic text-green-light">dant</em>
              </Link>

              {/* ── Loading ── */}
              {status === "loading" && (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-green-pale flex items-center justify-center mb-6">
                    <Loader size={34} className="text-green animate-spin" />
                  </div>
                  <h1 className="font-playfair font-black text-verdant-dark text-2xl mb-3">
                    Verifying your email
                  </h1>
                  <p className="text-verdant-muted text-sm leading-relaxed">
                    Hang on a moment while we confirm your address...
                  </p>

                  {/* Animated dots */}
                  <div className="flex gap-1.5 mt-6">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-green-light"
                        style={{
                          animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* ── Success ── */}
              {status === "success" && (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-green-pale flex items-center justify-center mb-6">
                    <CheckCircle size={38} className="text-green" />
                  </div>
                  <h1 className="font-playfair font-black text-verdant-dark text-2xl mb-3">
                    You&apos;re verified!
                  </h1>
                  <p className="text-verdant-muted text-sm leading-relaxed mb-8">
                    Your email has been confirmed. Redirecting you to sign in...
                  </p>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-green-pale rounded-full overflow-hidden">
                    <div className="h-full bg-green rounded-full animate-[grow_2s_ease-in-out_forwards]" />
                  </div>

                  <p className="text-xs text-[#bbb] mt-3">
                    Redirecting in 2 seconds
                  </p>
                </div>
              )}

              {/* ── Error ── */}
              {status === "error" && (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
                    <XCircle size={38} className="text-red-400" />
                  </div>
                  <h1 className="font-playfair font-black text-verdant-dark text-2xl mb-3">
                    Verification failed
                  </h1>
                  <p className="text-verdant-muted text-sm leading-relaxed mb-8">
                    {message}
                  </p>

                  <div className="flex flex-col gap-3 w-full">
                    <Link
                      href="/login"
                      className="w-full bg-green text-white py-3.5 rounded-full text-sm font-semibold hover:bg-green-mid transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(45,106,79,0.28)] text-center"
                    >
                      Back to Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="w-full border border-[#ddd] text-verdant-text py-3.5 rounded-full text-sm font-medium hover:border-green hover:text-green transition-colors text-center"
                    >
                      Create a new account
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Footer strip */}
            <div className="border-t border-green/10 px-10 py-5 bg-green-pale/40 text-center">
              <p className="text-xs text-verdant-muted">
                Didn&apos;t receive an email?{" "}
                <Link
                  href="/resend-verification"
                  className="text-green font-medium hover:underline"
                >
                  Resend verification link
                </Link>
              </p>
            </div>
          </div>

          {/* Below card trust note */}
          <p className="text-center text-xs text-[#bbb] mt-6">
            Need help?{" "}
            <Link href="/contact" className="text-green hover:underline">
              Contact our support team
            </Link>
          </p>
        </div>
      </main>

      {/* Inline keyframes for bounce + progress bar grow */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes grow {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </>
  );
}
