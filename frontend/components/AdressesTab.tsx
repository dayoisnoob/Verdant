"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Plus, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import AddressCard, {
  Address,
  AddressFields,
  AddressFormData,
  addressSchema,
} from "@/components/AddressCard";
import {
  addUserAddress,
  getUserAddresses,
  updateUserAddresses,
} from "@/lib/api";
import { ApiError } from "@/util";

function AddAddressForm({ onSuccess }: { onSuccess: () => void }) {
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
      toast.success("Address added");
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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <AddressFields register={register} errors={errors} />

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-green text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-green-mid transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(45,106,79,0.28)] disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none mt-1"
      >
        {isSubmitting ? "Adding…" : "Add Address"}
      </button>
    </form>
  );
}

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

  const MAX = 5;
  const canAdd = addresses.length < MAX;

  return (
    <div className="max-w-xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-playfair font-bold text-verdant-dark text-2xl">
            My Addresses
          </h2>
          <p className="text-xs text-verdant-muted mt-1">
            {addresses.length} of {MAX} saved
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
        <div className="bg-white rounded-2xl border border-green shadow-[0_0_0_1px_rgba(45,106,79,0.1),0_4px_24px_rgba(45,106,79,0.1)] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f0f0]">
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
              className="h-36 bg-white rounded-2xl border border-[#ebebeb] animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && addresses.length === 0 && !adding && (
        <div className="bg-white rounded-2xl border border-[#ebebeb] px-8 py-14 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 bg-green-pale rounded-2xl flex items-center justify-center text-3xl">
            📍
          </div>
          <div>
            <p className="font-playfair font-bold text-verdant-dark text-lg">
              No saved addresses
            </p>
            <p className="text-sm text-verdant-muted mt-1 max-w-[240px] mx-auto leading-relaxed">
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

      {/* List — default pinned first */}
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
        <p className="text-xs text-verdant-muted text-center">
          You&apos;ve reached the maximum of {MAX} saved addresses. Remove one
          to add another.
        </p>
      )}
    </div>
  );
}
