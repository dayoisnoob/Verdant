"use client";

import { useAuthStore } from "@/store/store";
import { ApiError } from "@/util";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Trash2,
  XCircle,
} from "lucide-react";
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
      <div
        className="fixed inset-0 bg-verdant-dark/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 transition-opacity"
        onClick={handleClose}
      >
        <div
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 sm:p-8">
            <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-6 shadow-sm">
              <Trash2 className="w-8 h-8 text-red-500" strokeWidth={2} />
            </div>

            <h2 className="font-playfair font-black text-verdant-dark text-3xl mb-3">
              Delete account?
            </h2>
            <p className="text-gray-500 font-medium text-sm leading-relaxed mb-6">
              This action will permanently remove your account and all
              associated data.{" "}
              <span className="font-bold text-red-500">
                This cannot be undone.
              </span>
            </p>

            <div className="bg-red-50/50 border border-red-100 rounded-2xl p-5 mb-6 flex flex-col gap-3">
              {[
                "Your account and profile",
                "All order history",
                "Saved addresses and preferences",
                "Loyalty points and rewards",
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 text-sm font-bold text-red-600"
                >
                  <XCircle
                    size={16}
                    strokeWidth={2.5}
                    className="flex-shrink-0"
                  />
                  <span className="truncate">{item}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
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
                  placeholder="••••••••"
                  className={`w-full border-2 bg-gray-50/50 rounded-xl px-4 py-3.5 text-sm outline-none transition-all font-bold text-verdant-dark placeholder:text-gray-400 pr-12 ${
                    error
                      ? "border-red-200 focus:border-red-400 focus:bg-white"
                      : "border-gray-200 focus:border-green hover:bg-white"
                  }`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-verdant-dark transition-colors"
                >
                  {showPassword ? (
                    <EyeOff size={18} strokeWidth={2.5} />
                  ) : (
                    <Eye size={18} strokeWidth={2.5} />
                  )}
                </button>
              </div>
              {error && (
                <p className="text-xs font-bold text-red-500 mt-2 flex items-center gap-1.5">
                  <AlertCircle size={14} strokeWidth={2.5} />
                  {error}
                </p>
              )}
            </div>
          </div>

          <div className="px-6 py-5 sm:px-8 sm:py-6 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-500 bg-white border-2 border-gray-200 hover:border-gray-300 hover:text-verdant-dark transition-colors order-2 sm:order-1 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading || !password}
              className="flex-1 bg-red-500 text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 order-1 sm:order-2"
            >
              {isLoading ? (
                <>
                  <Loader2
                    size={16}
                    strokeWidth={2.5}
                    className="animate-spin"
                  />
                  Deleting...
                </>
              ) : (
                "Delete Account"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
