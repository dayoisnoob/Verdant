"use client";

import { removeAddress, setDefaultAddress } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import {
  MapPin,
  Pencil,
  Star,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AddressApi } from "@/types";

interface AddressCardProps {
  address: AddressApi;
  onEditClick: () => void;
}

export default function AddressCard({
  address,
  onEditClick,
}: AddressCardProps) {
  const qc = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const fullName = [address.firstName, address.lastName]
    .filter(Boolean)
    .join(" ");

  const handleSetDefault = async () => {
    try {
      await setDefaultAddress(address.id);
      qc.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Default address updated");
    } catch {
      toast.error("Failed to update default address");
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await removeAddress(address.id);
      qc.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address removed successfully");
    } catch {
      toast.error("Failed to remove address");
      setIsRemoving(false);
    }
  };

  return (
    <div
      className={`relative rounded-3xl border-2 transition-all duration-300 overflow-hidden flex flex-col h-full ${
        address.isDefault
          ? "bg-green/5 border-green shadow-sm"
          : "bg-white/85 border-gray-100 hover:border-gray-200"
      }`}
    >
      {address.isDefault && (
        <div className="absolute top-0 right-0 bg-green text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-bl-2xl z-10 flex items-center gap-1.5 shadow-sm">
          <CheckCircle2 size={14} strokeWidth={3} /> Default
        </div>
      )}

      <div className="p-6 sm:p-8 flex-1">
        <div className="flex items-start gap-5 mb-5">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border-2 ${
              address.isDefault
                ? "bg-green text-white border-green-light"
                : "bg-verdant-dark text-white border-black"
            }`}
          >
            <MapPin size={24} strokeWidth={2.5} />
          </div>
          <div className="min-w-0 pt-1.5">
            <p className="font-playfair font-black text-verdant-dark text-2xl leading-tight truncate">
              {fullName}
            </p>
            <p
              className={`text-[10px] font-bold uppercase tracking-widest mt-1.5 truncate ${
                address.isDefault ? "text-green" : "text-gray-400"
              }`}
            >
              {address.state}
            </p>
          </div>
        </div>

        <div className="pl-[76px] flex flex-col gap-4">
          <p className="text-lg font-medium text-gray-600 leading-relaxed">
            {address.streetAddress}
          </p>
          <div className="flex gap-1.5">
            <p className="text-xs font-bold text-verdant-dark tracking-wider bg-green/45 w-fit px-3 py-1.5 rounded-lg border border-gray-100">
              {address.phone1}
            </p>
            {address.phone2 && (
              <p className="text-xs font-bold text-verdant-dark tracking-wider bg-green/45 w-fit px-3 py-1.5 rounded-lg border border-gray-100">
                {address.phone2}
              </p>
            )}
          </div>
        </div>
      </div>

      <div
        className={`p-5 sm:px-8 border-t-2 mt-auto ${
          address.isDefault
            ? "border-green/20 bg-green/10"
            : "border-gray-100 bg-gray-50/50"
        }`}
      >
        {!confirmDelete ? (
          <div className="flex items-center gap-3 flex-wrap">
            {!address.isDefault && (
              <button
                onClick={handleSetDefault}
                className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-gray-500 bg-white border-2 border-gray-200 px-4 py-2.5 rounded-xl hover:border-green hover:text-green transition-colors shadow-sm"
              >
                <Star size={14} strokeWidth={2.5} />
                Set Default
              </button>
            )}
            <button
              onClick={onEditClick}
              className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-gray-500 bg-white border-2 border-gray-200 px-4 py-2.5 rounded-xl hover:border-verdant-dark hover:text-verdant-dark transition-colors shadow-sm"
            >
              <Pencil size={14} strokeWidth={2.5} />
              Edit
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-white border-2 border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-colors ml-auto shadow-sm"
            >
              <Trash2 size={16} strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-red-50 p-4 rounded-2xl border-2 border-red-200">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle size={16} strokeWidth={3} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">
                Delete?
              </span>
            </div>
            <div className="flex items-center gap-2 w-full xl:w-auto">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 xl:flex-none text-[10px] uppercase tracking-widest font-bold text-gray-500 hover:text-verdant-dark bg-white border-2 border-gray-200 px-4 py-2.5 rounded-xl transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleRemove}
                disabled={isRemoving}
                className="flex-1 xl:flex-none text-[10px] uppercase tracking-widest font-bold text-white bg-red-500 border-2 border-red-500 hover:bg-red-600 hover:border-red-600 px-4 py-2.5 rounded-xl transition-colors shadow-sm disabled:opacity-50"
              >
                Confirm
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
