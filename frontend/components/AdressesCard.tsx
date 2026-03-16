"use client";

import { removeAddress, setDefaultAddress, addUserAddress } from "@/lib/api";
import { AddressFormData, addressSchema } from "@/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import {
  MapPin,
  Pencil,
  Star,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AddressApi } from "@/types";
import { NIGERIAN_STATES } from "@/lib/constants";
import { ApiError } from "@/util";

export const inputCls =
  "w-full border border-gray-200 bg-gray-50/50 rounded-xl px-4 py-3 text-sm outline-none focus:border-green focus:ring-4 focus:ring-green/10 transition-all hover:bg-white text-verdant-dark font-bold placeholder:text-gray-400";

export const Field = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
        {label}
      </label>
      {children}
      {error && <p className="text-xs font-bold text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export const AddressFields = ({
  register,
  errors,
}: {
  register: ReturnType<typeof useForm<AddressFormData>>["register"];
  errors: Partial<Record<keyof AddressFormData, { message?: string }>>;
}) => {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="First name" error={errors.firstName?.message}>
          <input
            {...register("firstName")}
            type="text"
            placeholder="Jane"
            className={inputCls}
          />
        </Field>
        <Field label="Last name (optional)" error={errors.lastName?.message}>
          <input
            {...register("lastName")}
            type="text"
            placeholder="Doe"
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Street address" error={errors.streetAddress?.message}>
        <input
          {...register("streetAddress")}
          type="text"
          placeholder="12 Bode Thomas Street, Surulere"
          className={inputCls}
        />
      </Field>

      <Field label="State / Region" error={errors.state?.message}>
        <select
          {...register("state")}
          className={`${inputCls} cursor-pointer appearance-none`}
        >
          <option value="" disabled hidden>
            Select your state
          </option>
          {NIGERIAN_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Primary Phone" error={errors.phone1?.message}>
          <div className="flex border border-gray-200 rounded-xl overflow-hidden focus-within:border-green focus-within:ring-4 focus-within:ring-green/10 transition-all bg-gray-50/50 hover:bg-white">
            <span className="flex items-center px-4 text-sm text-gray-500 border-r border-gray-200 flex-shrink-0 font-bold bg-gray-100/50">
              +234
            </span>
            <input
              {...register("phone1")}
              type="tel"
              placeholder="080 0000 0000"
              className="flex-1 min-w-0 px-4 py-3 text-sm font-bold outline-none bg-transparent text-verdant-dark placeholder:text-gray-400"
            />
          </div>
        </Field>
        <Field label="Alternative Phone" error={errors.phone2?.message}>
          <div className="flex border border-gray-200 rounded-xl overflow-hidden focus-within:border-green focus-within:ring-4 focus-within:ring-green/10 transition-all bg-gray-50/50 hover:bg-white">
            <span className="flex items-center px-4 text-sm text-gray-500 border-r border-gray-200 flex-shrink-0 font-bold bg-gray-100/50">
              +234
            </span>
            <input
              {...register("phone2")}
              type="tel"
              placeholder="070 0000 0000"
              className="flex-1 min-w-0 px-4 py-3 text-sm font-bold outline-none bg-transparent text-verdant-dark placeholder:text-gray-400"
            />
          </div>
        </Field>
      </div>
    </div>
  );
};

export const AddAddressForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const qc = useQueryClient();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormData>({ resolver: zodResolver(addressSchema) });

  const onSubmit = async (data: AddressFormData) => {
    try {
      await addUserAddress(data);
      qc.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address added successfully");
      reset();
      onSuccess();
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        for (const { field, message } of err.errors) {
          setError(field as keyof AddressFormData, { message });
        }
      } else {
        toast.error("Something went wrong, please try again");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <AddressFields register={register} errors={errors} />

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-green text-white py-4 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-green-mid transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed mt-2"
      >
        {isSubmitting ? "Adding Address..." : "Save New Address"}
      </button>
    </form>
  );
};

export default function AddressCard({
  address,
  onEdit,
}: {
  address: AddressApi;
  onEdit: (id: string, data: AddressFormData) => Promise<void>;
}) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isRemovingAddress, setIsRemovingAddress] = useState(false);

  const fullName = [address.firstName, address.lastName]
    .filter(Boolean)
    .join(" ");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      firstName: address.firstName,
      lastName: address.lastName ?? "",
      phone1: address.phone1.replace(/^\+234/, ""),
      phone2: address.phone2?.replace(/^\+234/, "") ?? "",
      streetAddress: address.streetAddress,
      state: address.state,
    },
  });

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddress(id);
      qc.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Default address updated");
    } catch {
      toast.error("Failed to update default address");
    }
  };

  const handleRemoveAddress = async (id: string) => {
    setIsRemovingAddress(true);
    try {
      await removeAddress(id);
      qc.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address removed successfully");
    } catch {
      toast.error("Failed to remove address");
      setIsRemovingAddress(false);
    }
  };

  const onSubmit = async (data: AddressFormData) => {
    await onEdit(address.id, data);
    setEditing(false);
  };

  const cancelEdit = () => {
    reset();
    setEditing(false);
    setConfirmDelete(false);
  };

  // ── VIEW MODE ──
  if (!editing) {
    return (
      <div
        className={`relative bg-white rounded-2xl border-2 transition-all duration-200 overflow-hidden flex flex-col ${
          address.isDefault
            ? "border-green shadow-sm"
            : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
        }`}
      >
        {address.isDefault && (
          <div className="absolute top-0 right-0 bg-green text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-bl-xl z-10 flex items-center gap-1.5">
            <CheckCircle2 size={12} strokeWidth={3} /> Default
          </div>
        )}

        <div className="p-6 flex-1">
          <div className="flex items-start gap-4 mb-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                address.isDefault
                  ? "bg-green/10 text-green"
                  : "bg-gray-50 text-gray-400"
              }`}
            >
              <MapPin size={24} strokeWidth={2} />
            </div>
            <div className="min-w-0 pt-1">
              <p className="font-bold text-verdant-dark text-lg leading-tight truncate">
                {fullName}
              </p>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1 truncate">
                {address.state}
              </p>
            </div>
          </div>

          <div className="pl-16 flex flex-col gap-1.5 mb-6">
            <p className="text-sm font-medium text-gray-600 leading-relaxed">
              {address.streetAddress}
            </p>
            <div className="flex flex-col gap-1 mt-2">
              <p className="text-xs font-bold text-gray-500 tracking-wider">
                +234 {address.phone1}
              </p>
              {address.phone2 && (
                <p className="text-xs font-bold text-gray-500 tracking-wider">
                  +234 {address.phone2}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Row Footer */}
        <div className="border-t border-gray-100 bg-gray-50/50 p-4">
          {!confirmDelete ? (
            <div className="flex items-center gap-3 flex-wrap">
              {!address.isDefault && (
                <button
                  onClick={() => handleSetDefault(address.id)}
                  className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-white border border-gray-200 px-4 py-2 rounded-lg hover:border-green hover:text-green transition-colors"
                >
                  <Star size={14} strokeWidth={2.5} />
                  Set Default
                </button>
              )}
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-white border border-gray-200 px-4 py-2 rounded-lg hover:border-gray-300 hover:text-verdant-dark transition-colors"
              >
                <Pencil size={14} strokeWidth={2.5} />
                Edit
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors ml-auto px-2"
              >
                <Trash2 size={16} strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 bg-red-50 p-3 rounded-xl border border-red-100">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle size={16} strokeWidth={2.5} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Remove?
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs font-bold text-gray-500 hover:text-verdant-dark bg-white border border-gray-200 px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRemoveAddress(address.id)}
                  disabled={isRemovingAddress}
                  className="text-xs font-bold text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  Yes, Remove
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── EDIT MODE ──
  return (
    <div className="bg-white rounded-2xl border-2 border-green shadow-sm overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
        <p className="font-bold text-base text-verdant-dark">Edit Address</p>
        <button
          onClick={cancelEdit}
          className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-verdant-dark transition-colors shadow-sm"
        >
          <X size={16} strokeWidth={2.5} />
        </button>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-6 flex flex-col gap-6"
      >
        <AddressFields register={register} errors={errors} />

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-green text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-green-mid transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed order-1 sm:order-2"
          >
            {isSubmitting ? "Saving Changes..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={cancelEdit}
            className="flex-1 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-500 bg-white border-2 border-gray-200 hover:border-gray-300 hover:text-verdant-dark transition-colors order-2 sm:order-1"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
