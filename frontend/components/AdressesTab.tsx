"use client";

import { getUserAddresses, updateUserAddresses } from "@/lib/api";
import { MAX_ADDRESSES } from "@/lib/constants";
import { Address } from "@/types";
import { AddressFormData } from "@/validations";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import AddressCard from "./AddressCard";
import { AddAddressForm } from "./AddressFields";

export default function AddressesTab() {
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);

  const { data: addresses = [], isLoading } = useQuery<Address[]>({
    queryKey: ["addresses"],
    queryFn: async () => (await getUserAddresses()).data,
  });

  const handleEdit = async (id: string, data: AddressFormData) => {
    await updateUserAddresses({ addressId: id, data });
    qc.invalidateQueries({ queryKey: ["addresses"] });
    toast.success("Address updated");
  };

  const canAdd = addresses.length < MAX_ADDRESSES;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-verdant-muted mt-1">
            {addresses.length} of {MAX_ADDRESSES} saved
          </p>
        </div>
        {canAdd && !adding && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 bg-green text-white text-sm font-semibold px-4 py-2.5 rounded-full hover:bg-green-mid transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(45,106,79,0.28)]"
          >
            <Plus size={15} />
            Add address
          </button>
        )}
      </div>

      {/* Inline add panel */}
      {adding && (
        <div className="bg-[#faf8f4] rounded-2xl border border-green/30 shadow-[0_0_0_1px_rgba(45,106,79,0.06),0_4px_20px_rgba(45,106,79,0.07)] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#ede9e1]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-green-pale rounded-lg flex items-center justify-center">
                <MapPin size={14} className="text-green" />
              </div>
              <p className="font-semibold text-sm text-verdant-dark">
                New Address
              </p>
            </div>
            <button
              onClick={() => setAdding(false)}
              className="text-verdant-muted hover:text-verdant-dark transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <div className="p-5">
            <AddAddressForm onSuccess={() => setAdding(false)} />
          </div>
        </div>
      )}

      {/* Skeleton */}
      {isLoading && (
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-36 bg-[#faf8f4] rounded-2xl border border-[#e8e4dc] animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && addresses.length === 0 && !adding && (
        <div className="bg-[#faf8f4] rounded-2xl border border-[#e8e4dc] px-8 py-14 flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 bg-green-pale rounded-2xl flex items-center justify-center">
            <MapPin size={24} className="text-green" strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-playfair font-bold text-verdant-dark text-lg">
              No saved addresses
            </p>
            <p className="text-sm text-verdant-muted mt-1 max-w-[230px] mx-auto leading-relaxed">
              Add a delivery address and checkout will be faster next time
            </p>
          </div>
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 bg-green text-white text-sm font-semibold px-5 py-3 rounded-full hover:bg-green-mid transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(45,106,79,0.28)]"
          >
            <Plus size={15} />
            Add your first address
          </button>
        </div>
      )}

      {/* Address list */}
      {!isLoading && addresses.length > 0 && (
        <div className="flex flex-col gap-3">
          {[...addresses]
            .sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
            .map((addr) => (
              <AddressCard key={addr.id} address={addr} onEdit={handleEdit} />
            ))}
        </div>
      )}

      {/* Cap notice */}
      {!canAdd && !adding && (
        <div className="bg-[#faf8f4] border border-[#e8e4dc] rounded-xl px-4 py-3 flex items-center gap-2.5">
          <span className="text-base flex-shrink-0">📍</span>
          <p className="text-xs text-verdant-muted leading-relaxed">
            You&apos;ve reached the maximum of{" "}
            <span className="font-semibold text-verdant-dark">
              {MAX_ADDRESSES}
            </span>{" "}
            saved addresses. Remove one to add another.
          </p>
        </div>
      )}
    </div>
  );
}
