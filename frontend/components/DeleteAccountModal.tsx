"use client";

import { useAuthStore } from "@/store/store";
import { ApiError } from "@/util";
import { CircleAlert, CircleX, Eye, EyeClosed, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
}

export default function DeleteAccountModal({
  isOpen,
  onClose,
  onConfirm,
}: DeleteAccountModalProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!password) {
      setError("Please enter your password to continue.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await onConfirm(password);
      logout();
      router.push("/");
    } catch (err: unknown) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Incorrect password. Please try again.",
      );
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    setPassword("");
    setError("");
    setShowPassword(false);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        {/* Modal */}
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-7 pt-7 pb-5">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <Trash color="red" />
            </div>
            <h2 className="font-playfair font-bold text-verdant-dark text-2xl">
              Delete your account?
            </h2>
            <p className="text-verdant-muted text-sm mt-2 leading-relaxed">
              This will permanently remove your account, order history, saved
              addresses, and all personal data.{" "}
              <span className="font-medium text-verdant-dark">
                This cannot be undone.
              </span>
            </p>
          </div>

          {/* What will be deleted */}
          <div className="mx-7 mb-5 bg-red-50 rounded-xl px-4 py-3.5 flex flex-col gap-2">
            {[
              "Your account and profile",
              "All order history",
              "Saved addresses and preferences",
              "Loyalty points and rewards",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2.5 text-sm text-red-400"
              >
                <CircleX size={14} /> {item}
              </div>
            ))}
          </div>

          {/* Password field */}
          <div className="px-7 pb-2">
            <label className="text-xs font-semibold text-verdant-dark uppercase tracking-wider block mb-1.5">
              Confirm your password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
                placeholder="Enter your password"
                className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all bg-white text-verdant-dark placeholder:text-[#ccc] pr-11 ${
                  error
                    ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                    : "border-[#e5e5e5] focus:border-green focus:ring-2 focus:ring-green/10"
                }`}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#bbb] hover:text-verdant-muted transition-colors"
              >
                {showPassword ? <EyeClosed /> : <Eye />}
              </button>
            </div>
            {error && (
              <p className="text-xs text-red-400 mt-2 flex items-center gap-1.5">
                <CircleAlert size={18} />
                {error}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="px-7 py-6 flex gap-3">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 border border-[#e5e5e5] text-verdant-muted py-3 rounded-full text-sm font-medium hover:border-green hover:text-green transition-all disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading || !password}
              className="flex-1 bg-red-400 text-white py-3 rounded-full text-sm font-semibold hover:bg-red-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth={4}
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Deleting...
                </>
              ) : (
                "Delete my account"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
