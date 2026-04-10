"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserAddresses, updateUserAddress } from "@/lib/api";
import { AddressFormData } from "@/validations";
import { Loader2, MapPin, Plus } from "lucide-react";
import { AddressApi } from "@/types";
import AddressCard from "./AddressCard";
import AddressModal from "./AddressModal";

export default function AddressesTab() {
  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => getUserAddresses(),
  });

  // Centralized state for both Adding and Editing
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    editingAddress: AddressApi | null;
  }>({
    isOpen: false,
    editingAddress: null,
  });

  const openAddModal = () =>
    setModalState({ isOpen: true, editingAddress: null });
  const openEditModal = (address: AddressApi) =>
    setModalState({ isOpen: true, editingAddress: address });
  const closeModal = () =>
    setModalState({ isOpen: false, editingAddress: null });

  // We pass this to the modal so it can handle the try/catch and loading states
  const handleEditSubmit = async (id: string, data: AddressFormData) => {
    await updateUserAddress({ addressId: id, data });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm py-24 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-green animate-spin mb-4" />
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Loading addresses...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full relative">
      {/* ── Header Area ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2 sm:pb-0 -mx-6 px-6 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-widest border-2 bg-green border-green text-white shadow-sm whitespace-nowrap">
            Saved Addresses
            <span className="text-[10px] w-5 h-5 rounded-md flex items-center justify-center bg-white/20 text-white ml-1">
              {addresses.length}
            </span>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-verdant-dark text-white px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors shadow-sm whitespace-nowrap"
        >
          <Plus size={16} strokeWidth={2.5} />
          Add New
        </button>
      </div>

      {/* ── Content Area ── */}
      {addresses.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm py-24 flex flex-col items-center justify-center text-center px-6">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
            <MapPin className="w-10 h-10 text-gray-400" strokeWidth={1.5} />
          </div>
          <h2 className="font-playfair font-black text-verdant-dark text-3xl mb-3">
            No addresses saved
          </h2>
          <p className="text-gray-500 font-medium text-sm max-w-sm mb-8 leading-relaxed">
            Add a delivery address to make your checkout experience faster and
            smoother.
          </p>
          <button
            onClick={openAddModal}
            className="bg-green text-white px-8 py-4 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-green-mid transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus size={18} strokeWidth={2.5} /> Add Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEditClick={() => openEditModal(address)}
            />
          ))}
        </div>
      )}

      {/* ── Global Modal ── */}
      <AddressModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        addressToEdit={modalState.editingAddress}
        onEditSubmit={handleEditSubmit}
      />
    </div>
  );
}
