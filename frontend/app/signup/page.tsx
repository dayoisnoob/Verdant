"use client";

import { registerApi } from "@/lib/api";
import { useAuthStore } from "@/store/store";
import { ApiError } from "@/util";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeClosed, EyeIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

interface SignupForm {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const signupSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .trim(),
    lastName: z.string().min(2).trim().optional(),
    email: z.string().email("please enter a valid email").trim().toLowerCase(),
    password: z
      .string()
      .min(8, "password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [globalError, setGlobalError] = useState("");

  const setEmail = useAuthStore((state) => state.setEmail);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const handleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };
  const handleShowConfirmPassword = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const onSubmit = async (data: SignupForm) => {
    console.log(data);
    try {
      await registerApi(data);
      setEmail(data.email);
      router.push("/check-email");
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        for (const { field, message } of err.errors) {
          setError(field as keyof SignupForm, { message });
        }
      } else if (err instanceof Error) {
        setGlobalError(err.message || "Something went wrong.");
      }
    }
  };
  return (
    <div className="min-h-screen grid grid-cols-2">
      {/* ── Left — Form Panel ── */}
      <div className="bg-cream flex flex-col justify-center px-16 py-12">
        <div className="max-w-md w-full mx-auto">
          {/* Logo */}
          <Link
            href="/"
            className="font-playfair text-2xl font-black text-green mb-10 block"
          >
            Ver<em className="not-italic text-green-light">dant</em>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <p className="text-xs tracking-[0.15em] uppercase text-green mb-2">
              Join Verdant
            </p>
            <h1 className="font-playfair font-black text-verdant-dark text-4xl leading-tight">
              Create your
              <br />
              account
            </h1>
            <p className="text-verdant-muted text-sm mt-3">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-green font-medium hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Social signup */}
          <div className="flex flex-col gap-3 mb-7">
            <button className="w-full flex items-center justify-center gap-3 border border-[#e5e5e5] bg-white rounded-xl py-3.5 text-sm font-medium text-verdant-dark hover:border-green hover:bg-green-pale/30 transition-all duration-200">
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign up with Google
            </button>
            <button className="w-full flex items-center justify-center gap-3 border border-[#e5e5e5] bg-white rounded-xl py-3.5 text-sm font-medium text-verdant-dark hover:border-green hover:bg-green-pale/30 transition-all duration-200">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              Sign up with GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-7">
            <div className="flex-1 h-px bg-[#e5e5e5]" />
            <span className="text-xs text-[#bbb] uppercase tracking-wider">
              or
            </span>
            <div className="flex-1 h-px bg-[#e5e5e5]" />
          </div>

          {globalError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm px-4 py-3 rounded mb-6">
              {globalError}
            </div>
          )}

          {/* Form — wire up onSubmit */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-verdant-dark uppercase tracking-wider">
                  First name
                </label>
                <input
                  {...register("firstName")}
                  type="text"
                  placeholder="Jane"
                  className="border border-[#e5e5e5] rounded-xl px-4 py-3.5 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/10 transition-all bg-white text-verdant-dark placeholder:text-[#ccc]"
                />
                {errors.firstName && (
                  <p className="text-rose-500 text-xs mt-1">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-verdant-dark uppercase tracking-wider">
                  Last name
                </label>
                <input
                  {...register("lastName")}
                  type="text"
                  placeholder="Doe"
                  className="border border-[#e5e5e5] rounded-xl px-4 py-3.5 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/10 transition-all bg-white text-verdant-dark placeholder:text-[#ccc]"
                />
                {errors.lastName && (
                  <p className="text-rose-500 text-xs mt-1">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-verdant-dark uppercase tracking-wider">
                Email address
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="jane@email.com"
                className="border border-[#e5e5e5] rounded-xl px-4 py-3.5 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/10 transition-all bg-white text-verdant-dark placeholder:text-[#ccc]"
              />
              {errors.email && (
                <p className="text-rose-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-verdant-dark uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  className="w-full border border-[#e5e5e5] rounded-xl px-4 py-3.5 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/10 transition-all bg-white text-verdant-dark placeholder:text-[#ccc] pr-12"
                />
                {errors.password && (
                  <p className="text-rose-500 text-xs mt-1">
                    {errors.password.message}
                  </p>
                )}
                {/* Show/hide toggle — wire up onClick */}
                <button
                  type="button"
                  onClick={handleShowPassword}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#bbb] hover:text-green transition-colors"
                >
                  {showPassword ? <EyeIcon /> : <EyeClosed />}
                </button>
              </div>

              {/* Password strength bar — wire up dynamically */}
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex-1 h-1 rounded-full bg-[#e5e5e5]"
                    // Add conditional colour classes based on password strength
                  />
                ))}
              </div>
              <p className="text-[0.68rem] text-[#bbb]">
                Use 8+ characters with a mix of letters, numbers and symbols
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-verdant-dark uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  {...register("confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  className="w-full border border-[#e5e5e5] rounded-xl px-4 py-3.5 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/10 transition-all bg-white text-verdant-dark placeholder:text-[#ccc] pr-12"
                />
                {errors.confirmPassword && (
                  <p className="text-rose-500 text-xs mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
                {/* Show/hide toggle — wire up onClick */}
                <button
                  type="button"
                  onClick={handleShowConfirmPassword}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#bbb] hover:text-green transition-colors"
                >
                  {showConfirmPassword ? <EyeIcon /> : <EyeClosed />}
                </button>
              </div>
            </div>

            {/* Submit — wire up */}
            <button
              type="submit"
              className="w-full bg-green text-white py-4 rounded-full font-semibold text-base hover:bg-green-mid transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(45,106,79,0.28)] mt-2"
            >
              {isSubmitting ? "Creating..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-xs text-[#bbb] mt-6 leading-relaxed">
            By signing up you agree to our{" "}
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

      {/* ── Right — Visual Panel ── */}
      <div className="relative overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=900&h=1200&fit=crop"
          alt="Fresh strawberries"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-bl from-green-dark/65 via-green/45 to-green-dark/55" />

        {/* Top badge */}
        <div className="absolute top-10 right-10">
          <div className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl px-5 py-3 text-center">
            <div className="font-playfair font-bold text-white text-2xl">
              Free
            </div>
            <div className="text-white/70 text-xs mt-0.5">to join, always</div>
          </div>
        </div>

        {/* Perks list */}
        <div className="absolute top-1/2 -translate-y-1/2 left-10 right-10">
          <p className="text-xs tracking-[0.15em] uppercase text-green-light mb-5">
            Member benefits
          </p>
          <div className="flex flex-col gap-4">
            {[
              {
                icon: "🌅",
                title: "Early harvest access",
                desc: "First pick of limited seasonal produce before it sells out",
              },
              {
                icon: "🚚",
                title: "Free delivery over £40",
                desc: "No delivery charges when you spend £40 or more",
              },
              {
                icon: "⭐",
                title: "Loyalty rewards",
                desc: "Earn points on every order, redeem for free produce",
              },
              {
                icon: "📬",
                title: "Weekly harvest notes",
                desc: "Know what's growing before it even hits the shop",
              },
            ].map((perk) => (
              <div key={perk.title} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-xl flex-shrink-0">
                  {perk.icon}
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">
                    {perk.title}
                  </div>
                  <div className="text-white/60 text-xs mt-0.5 leading-relaxed">
                    {perk.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom testimonial */}
        <div className="absolute bottom-10 left-10 right-10">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5">
            <div className="flex gap-0.5 mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <svg
                  key={s}
                  viewBox="0 0 24 24"
                  className="w-3.5 h-3.5"
                  fill="#F59E0B"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              ))}
            </div>
            <p className="text-white/90 text-sm italic leading-relaxed">
              &ldquo;The tomatoes arrived still warm from the sun. I&apos;ve
              never tasted anything like it from a delivery.&rdquo;
            </p>
            <p className="text-white/50 text-xs mt-2">
              — Amara T., member since 2022
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
