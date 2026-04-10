"use client";

import { addUserAddress } from "@/lib/api";
import { NIGERIAN_STATES } from "@/lib/constants";
import { AddressApi } from "@/types";
import { ApiError } from "@/util";
import { AddressFormData, addressSchema } from "@/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

/* ── Form UI Components ── */

const inputCls =
  "w-full border-2 border-gray-100 bg-gray-50 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-green focus:bg-white transition-all text-verdant-dark font-bold placeholder:text-gray-300";

const Field = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
      {label}
    </label>
    {children}
    {error && <p className="text-xs font-bold text-red-500 mt-0.5">{error}</p>}
  </div>
);

const AddressFields = ({
  register,
  errors,
}: {
  register: ReturnType<typeof useForm<AddressFormData>>["register"];
  errors: Partial<Record<keyof AddressFormData, { message?: string }>>;
}) => (
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
        <div className="flex border-2 border-gray-100 bg-gray-50 rounded-xl overflow-hidden focus-within:border-green focus-within:bg-white transition-all">
          <span className="flex items-center px-4 text-sm text-gray-400 border-r-2 border-gray-100 flex-shrink-0 font-bold bg-white">
            +234
          </span>
          <input
            {...register("phone1")}
            type="tel"
            placeholder="080 0000 0000"
            className="flex-1 min-w-0 px-4 py-3.5 text-sm font-bold outline-none bg-transparent text-verdant-dark placeholder:text-gray-300"
          />
        </div>
      </Field>
      <Field label="Alternative Phone" error={errors.phone2?.message}>
        <div className="flex border-2 border-gray-100 bg-gray-50 rounded-xl overflow-hidden focus-within:border-green focus-within:bg-white transition-all">
          <span className="flex items-center px-4 text-sm text-gray-400 border-r-2 border-gray-100 flex-shrink-0 font-bold bg-white">
            +234
          </span>
          <input
            {...register("phone2")}
            type="tel"
            placeholder="070 0000 0000"
            className="flex-1 min-w-0 px-4 py-3.5 text-sm font-bold outline-none bg-transparent text-verdant-dark placeholder:text-gray-300"
          />
        </div>
      </Field>
    </div>
  </div>
);

/* ── Main Modal Component ── */

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  addressToEdit?: AddressApi | null;
  onEditSubmit?: (id: string, data: AddressFormData) => Promise<void>;
}

export default function AddressModal({
  isOpen,
  onClose,
  addressToEdit,
  onEditSubmit,
}: AddressModalProps) {
  const qc = useQueryClient();
  const isEditing = !!addressToEdit;

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: isEditing
      ? {
          firstName: addressToEdit.firstName,
          lastName: addressToEdit.lastName ?? "",
          phone1: addressToEdit.phone1.replace(/^\+234/, ""),
          phone2: addressToEdit.phone2?.replace(/^\+234/, "") ?? "",
          streetAddress: addressToEdit.streetAddress,
          state: addressToEdit.state,
        }
      : undefined,
  });

  if (!isOpen) return null;

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: AddressFormData) => {
    try {
      if (isEditing && onEditSubmit) {
        await onEditSubmit(addressToEdit.id, data);
        toast.success("Address updated successfully");
      } else {
        await addUserAddress(data);
        toast.success("Address added successfully");
      }
      qc.invalidateQueries({ queryKey: ["addresses"] });
      handleClose();
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-verdant-dark/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden max-h-full animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 sm:px-8 sm:py-6 border-b-2 border-gray-100 bg-gray-50 flex-shrink-0">
          <h2 className="font-playfair font-black text-verdant-dark text-2xl">
            {isEditing ? "Edit Address" : "Add New Address"}
          </h2>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:border-verdant-dark hover:text-verdant-dark transition-colors shadow-sm"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Scrollable Form Area */}
        <div className="overflow-y-auto custom-scrollbar p-6 sm:p-8">
          <form id="address-form" onSubmit={handleSubmit(onSubmit)}>
            <AddressFields register={register} errors={errors} />
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="px-6 py-5 sm:px-8 bg-white border-t-2 border-gray-100 flex flex-col sm:flex-row gap-3 flex-shrink-0">
          <button
            type="submit"
            form="address-form"
            disabled={isSubmitting}
            className="flex-1 bg-green text-white py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-green-mid transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed order-1 sm:order-2 flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            {isSubmitting ? "Saving..." : "Save Address"}
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 py-4 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-500 bg-white border-2 border-gray-200 hover:border-gray-300 hover:text-verdant-dark transition-colors order-2 sm:order-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
