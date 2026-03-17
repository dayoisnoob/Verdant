"use client";

import { register as registerApi } from "@/lib/api";
import { handleFormError } from "@/lib/helpers";
import { useEmailStore } from "@/store/store";
import { ApiError } from "@/util";
import { RegistrationForm, registrationSchema } from "@/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import PasswordStrengthBar from "react-password-strength-bar";

export default function SignupPage() {
  const router = useRouter();
  const setEmail = useEmailStore((s) => s.setEmail);

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

  const inputCls = (hasError: boolean) =>
    `w-full border-2 bg-gray-50/50 rounded-xl px-4 py-3.5 text-sm outline-none transition-all font-bold text-verdant-dark placeholder:text-gray-400 ${
      hasError
        ? "border-red-200 focus:border-red-400 focus:bg-white"
        : "border-gray-200 focus:border-green hover:bg-white"
    }`;

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-[460px] flex flex-col items-center">
        {/* ── Logo ── */}
        <Link
          href="/"
          className="font-playfair text-3xl sm:text-4xl font-black text-verdant-dark tracking-tight hover:text-green transition-colors mb-8"
        >
          Ver<em className="not-italic text-green">dant</em>
        </Link>

        {/* ── Card ── */}
        <div className="w-full bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden">
          <div className="px-6 py-8 sm:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="font-playfair font-black text-verdant-dark text-3xl mb-2">
                Create Account
              </h1>
              <p className="text-gray-500 font-medium text-sm">
                Already a member?{" "}
                <Link
                  href="/login"
                  className="text-green font-bold hover:text-green-mid transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>

            {/* ── Form ── */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="flex flex-col gap-5"
            >
              {/* Name Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {(["firstName", "lastName"] as const).map((field) => (
                  <div key={field} className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      {field === "firstName" ? "First Name" : "Last Name"}
                    </label>
                    <input
                      {...register(field)}
                      type="text"
                      placeholder={field === "firstName" ? "Jane" : "Doe"}
                      className={inputCls(!!errors[field])}
                    />
                    {errors[field] && (
                      <p className="text-xs font-bold text-red-500 mt-0.5">
                        {errors[field]?.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Email Address
                </label>
                <input
                  {...register("email")}
                  type="email"
                  autoComplete="email"
                  placeholder="you@email.com"
                  className={inputCls(!!errors.email)}
                />
                {errors.email && (
                  <p className="text-xs font-bold text-red-500 mt-0.5">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Password
                </label>
                <div className="relative">
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className={`${inputCls(!!errors.password)} pr-12`}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-verdant-dark transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff size={18} strokeWidth={2.5} />
                    ) : (
                      <Eye size={18} strokeWidth={2.5} />
                    )}
                  </button>
                </div>

                {password && (
                  <div className="mt-1">
                    <PasswordStrengthBar
                      password={password}
                      className="!mb-0"
                    />
                  </div>
                )}

                {errors.password && (
                  <p className="text-xs font-bold text-red-500 mt-0.5">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    {...register("confirmPassword")}
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className={`${inputCls(!!errors.confirmPassword)} pr-12`}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirmPassword((p) => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-verdant-dark transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} strokeWidth={2.5} />
                    ) : (
                      <Eye size={18} strokeWidth={2.5} />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs font-bold text-red-500 mt-0.5">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
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
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* ── Footer Links ── */}
        <p className="text-center text-xs font-bold text-gray-400 mt-8 uppercase tracking-widest">
          By signing up you agree to our{" "}
          <Link
            href="/terms"
            className="text-gray-500 hover:text-green transition-colors"
          >
            Terms
          </Link>
          {" & "}
          <Link
            href="/privacy"
            className="text-gray-500 hover:text-green transition-colors"
          >
            Privacy
          </Link>
        </p>
      </div>
    </div>
  );
}
