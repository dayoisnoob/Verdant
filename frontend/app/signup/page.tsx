"use client";

import { registerApi } from "@/lib/api";
import { handleFormError } from "@/lib/api/helpers";
import { useAuthStore } from "@/store/store";
import { ApiError } from "@/util";
import { RegistrationForm, registrationSchema } from "@/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import PasswordStrengthBar from "react-password-strength-bar";

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
      <div className="relative w-full max-w-[440px]">
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
          </div>
        </div>

        <p className="text-center text-sm text-white/70 mt-3">
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
