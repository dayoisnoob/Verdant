"use client";

import { removeAddress, setDefaultAddress } from "@/lib/api";
import { Address } from "@/types";
import { AddressFormData, addressSchema } from "@/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Star, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AddressFields } from "./AddressFields";

export default function AddressCard({
  address,
  onEdit,
}: {
  address: Address;
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
      const res = await setDefaultAddress(id);
      qc.invalidateQueries({ queryKey: ["addresses"] });
      toast.success(res.message);
    } catch {
      toast.error("Failed to update default address");
    }
  };

  const handleRemoveAddress = async (id: string) => {
    setIsRemovingAddress(true);
    try {
      const res = await removeAddress(id);
      qc.invalidateQueries({ queryKey: ["addresses"] });
      toast.success(res.message);
    } catch {
      toast.error("Failed to remove address");
    } finally {
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
  };

  // ── View mode ────────────────────────────────────────────────────────────
  if (!editing) {
    return (
      <div
        className={`relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
          address.isDefault
            ? "border-green shadow-[0_0_0_1px_rgba(45,106,79,0.12),0_4px_16px_rgba(45,106,79,0.08)]"
            : "border-[#ebebeb] hover:border-green/30 hover:shadow-sm"
        }`}
      >
        {/* Default ribbon */}
        {address.isDefault && (
          <div className="absolute top-0 right-0">
            <div className="bg-green text-white text-[0.55rem] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-xl">
              Default
            </div>
          </div>
        )}

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                address.isDefault ? "bg-green-pale" : "bg-[#f5f5f5]"
              }`}
            >
              📍
            </div>
            <div className="min-w-0 pt-0.5">
              <p className="font-semibold text-verdant-dark text-sm leading-tight">
                {fullName}
              </p>
              <p className="text-xs text-verdant-muted mt-0.5">
                {address.state}
              </p>
            </div>
          </div>

          {/* Address detail */}
          <div className="pl-[3.25rem] flex flex-col gap-1 mb-4">
            <p className="text-sm text-verdant-dark leading-snug">
              {address.streetAddress}
            </p>
            <p className="text-xs text-verdant-muted mt-0.5">
              {address.phone1}
            </p>
            {address.phone2 && (
              <p className="text-xs text-verdant-muted">{address.phone2}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pl-[3.25rem] flex-wrap">
            {!address.isDefault && (
              <button
                onClick={() => handleSetDefault(address.id)}
                // disabled={settingDefault}
                className="flex items-center gap-1.5 text-[0.7rem] text-verdant-muted border border-[#e8e8e8] px-3 py-1.5 rounded-full hover:border-green hover:text-green transition-all disabled:opacity-50"
              >
                <Star size={11} />
                Set as default
              </button>
            )}

            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-[0.7rem] text-verdant-muted border border-[#e8e8e8] px-3 py-1.5 rounded-full hover:border-green hover:text-green transition-all"
            >
              <Pencil size={11} />
              Edit
            </button>

            {/* Two-step delete */}
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 text-[0.7rem] text-verdant-muted border border-[#e8e8e8] px-3 py-1.5 rounded-full hover:border-red-300 hover:text-red-400 transition-all ml-auto"
              >
                <Trash2 size={11} />
                Remove
              </button>
            ) : (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-[0.7rem] text-red-400 font-medium">
                  Sure?
                </span>
                <button
                  onClick={() => handleRemoveAddress(address.id)}
                  disabled={isRemovingAddress}
                  className="text-[0.7rem] bg-red-50 text-red-500 border border-red-200 px-3 py-1.5 rounded-full hover:bg-red-100 transition-all disabled:opacity-50"
                >
                  {/* {deleting ? "Removing…" : "Yes, remove"} */}
                  yes, remove
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-[0.7rem] text-verdant-muted hover:text-verdant-dark transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Edit mode ────────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-2xl border border-green shadow-[0_0_0_1px_rgba(45,106,79,0.1),0_4px_20px_rgba(45,106,79,0.08)] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f0f0]">
        <p className="font-semibold text-sm text-verdant-dark">Edit Address</p>
        <button
          onClick={cancelEdit}
          className="text-verdant-muted hover:text-verdant-dark transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-5 flex flex-col gap-4"
      >
        <AddressFields register={register} errors={errors} />

        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-green text-white py-3 rounded-xl text-sm font-semibold hover:bg-green-mid transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(45,106,79,0.28)] disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
          >
            {isSubmitting ? "Saving…" : "Save Address"}
          </button>
          <button
            type="button"
            onClick={cancelEdit}
            className="px-5 py-3 rounded-xl text-sm font-medium text-verdant-muted border border-[#e8e8e8] hover:border-green/30 hover:text-verdant-dark transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
