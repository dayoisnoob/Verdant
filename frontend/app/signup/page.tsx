"use client";

import { registerApi } from "@/lib/api";
import { handleFormError } from "@/lib/api/helpers";
import { useAuthStore } from "@/store/store";
import { ApiError } from "@/util";
import PasswordStrengthBar from "react-password-strength-bar";
import { RegistrationForm, registrationSchema } from "@/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Leaf } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

function BackgroundDecor() {
  return (
    <>
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-green-mid/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-24 w-96 h-96 rounded-full bg-orange/8 blur-3xl pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px",
        }}
      />
      <div className="absolute top-8 left-8 text-green-mid/15 pointer-events-none select-none rotate-45">
        <Leaf size={52} strokeWidth={0.8} />
      </div>
      <div className="absolute bottom-8 right-8 text-green-mid/10 pointer-events-none select-none rotate-[220deg]">
        <Leaf size={36} strokeWidth={0.8} />
      </div>
    </>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const setEmail = useAuthStore((s) => s.setEmail);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setError: setSignUpError,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationForm>({ resolver: zodResolver(registrationSchema) });

  const onSubmit = async (data: RegistrationForm) => {
    try {
      await registerApi(data);
      setEmail(data.email);
      router.push("/check-email");
    } catch (err) {
      handleFormError(err, setSignUpError, {
        409: { field: "email", message: (err as ApiError).message },
      });
    }
  };

  const password = useWatch({ control, name: "password", defaultValue: "" });

  return (
    <div className="min-h-screen bg-[#0f1c13] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <BackgroundDecor />

      <div className="relative w-full max-w-[440px]">
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

          <div className="px-8 pt-7 pb-9">
            {/* Heading */}
            <div className="mb-6">
              <h1 className="font-playfair font-black text-verdant-dark text-[1.85rem] leading-tight">
                Create account
              </h1>
              <p className="text-verdant-muted text-sm mt-1.5">
                Already a member?{" "}
                <Link
                  href="/login"
                  className="text-green font-semibold hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="flex flex-col gap-4"
            >
              {/* Name */}
              <div className="grid grid-cols-2 gap-3">
                {(["firstName", "lastName"] as const).map((field) => (
                  <div key={field} className="flex flex-col gap-1.5">
                    <label className="text-[0.62rem] font-bold uppercase tracking-[0.13em] text-verdant-muted">
                      {field === "firstName" ? "First name" : "Last name"}
                    </label>
                    <input
                      {...register(field)}
                      type="text"
                      placeholder={
                        field === "firstName" ? "first name" : "last name"
                      }
                      className={`border rounded-xl px-4 py-3 text-sm outline-none transition-all bg-white text-verdant-dark placeholder:text-[#ccc] focus:ring-2 focus:ring-green/10 ${
                        errors[field]
                          ? "border-red-300 focus:border-red-400"
                          : "border-[#e0ddd5] focus:border-green"
                      }`}
                    />
                    <p className="text-[0.68rem] text-red-500 min-h-[14px] leading-none">
                      {errors[field]?.message}
                    </p>
                  </div>
                ))}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5 -mt-1">
                <label className="text-[0.62rem] font-bold uppercase tracking-[0.13em] text-verdant-muted">
                  Email address
                </label>
                <input
                  {...register("email")}
                  type="email"
                  autoComplete="email"
                  placeholder="example@email.com"
                  className={`border rounded-xl px-4 py-3 text-sm outline-none transition-all bg-white text-verdant-dark placeholder:text-[#ccc] focus:ring-2 focus:ring-green/10 ${
                    errors.email
                      ? "border-red-300 focus:border-red-400"
                      : "border-[#e0ddd5] focus:border-green"
                  }`}
                />
                <p className="text-[0.68rem] text-red-500 min-h-[14px] leading-none">
                  {errors.email?.message}
                </p>
              </div>

              {/* Password + strength */}
              <div className="flex flex-col gap-1.5 -mt-1">
                <label className="text-[0.62rem] font-bold uppercase tracking-[0.13em] text-verdant-muted">
                  Password
                </label>
                <div className="relative">
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="password"
                    className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all bg-white text-verdant-dark placeholder:text-[#ccc] focus:ring-2 focus:ring-green/10 pr-11 ${
                      errors.password
                        ? "border-red-300 focus:border-red-400"
                        : "border-[#e0ddd5] focus:border-green"
                    }`}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#bbb] hover:text-green transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                {/* Strength bar — only shows when typing */}
                {password && <PasswordStrengthBar password={password} />}

                <p className="text-[0.68rem] text-red-500 min-h-[14px] leading-none">
                  {errors.password?.message}
                </p>
              </div>

              {/* Confirm password */}
              <div className="flex flex-col gap-1.5 -mt-1">
                <label className="text-[0.62rem] font-bold uppercase tracking-[0.13em] text-verdant-muted">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    {...register("confirmPassword")}
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all bg-white text-verdant-dark placeholder:text-[#ccc] focus:ring-2 focus:ring-green/10 pr-11 ${
                      errors.confirmPassword
                        ? "border-red-300 focus:border-red-400"
                        : "border-[#e0ddd5] focus:border-green"
                    }`}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirmPassword((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#bbb] hover:text-green transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={15} />
                    ) : (
                      <Eye size={15} />
                    )}
                  </button>
                </div>
                <p className="text-[0.68rem] text-red-500 min-h-[14px] leading-none">
                  {errors.confirmPassword?.message}
                </p>
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
                    Creating your account…
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Member perks — below the fold, non-intrusive */}
            <div className="mt-7 pt-6 border-t border-[#ebebeb]">
              <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-verdant-muted mb-3">
                What you get
              </p>
              <div className="grid grid-cols-2 gap-y-2.5 gap-x-3">
                {[
                  { icon: "🌅", text: "Early harvest access" },
                  { icon: "🚚", text: "Free delivery over £40" },
                  { icon: "⭐", text: "Loyalty rewards" },
                  { icon: "📬", text: "Weekly harvest notes" },
                ].map((perk) => (
                  <div key={perk.text} className="flex items-center gap-2">
                    <span className="text-sm">{perk.icon}</span>
                    <span className="text-[0.68rem] text-verdant-muted leading-tight">
                      {perk.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
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

        <p className="text-center text-[0.6rem] text-white/20 mt-3">
          By signing up you agree to our{" "}
          <Link
            href="/terms"
            className="hover:text-white/40 underline transition-colors"
          >
            Terms
          </Link>
          {" & "}
          <Link
            href="/privacy"
            className="hover:text-white/40 underline transition-colors"
          >
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
