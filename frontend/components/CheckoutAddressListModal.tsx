import { AddressApi } from "@/types";
import { Plus, X } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

interface CheckoutAddressListModalProps {
  isOpen: boolean;
  onClose: () => void;
  addresses: AddressApi[];
  selectedId: string | null;
  onSelect: Dispatch<SetStateAction<string | null>>;
  onAddNew: () => void;
}

function CheckoutAddressListModal({
  isOpen,
  onClose,
  addresses,
  selectedId,
  onSelect,
  onAddNew,
}: CheckoutAddressListModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-verdant-dark/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 fade-in duration-200">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-3xl">
          <h2 className="font-playfair font-bold text-xl text-verdant-dark">
            Saved Addresses
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-verdant-dark transition-colors"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar bg-gray-50/30">
          <button
            onClick={onAddNew}
            className="w-full flex items-center justify-center gap-2 text-sm font-bold text-green bg-green/10 px-4 py-4 rounded-xl hover:bg-green/20 transition-all shadow-sm mb-4"
          >
            <Plus size={16} strokeWidth={3} /> Add New Address
          </button>
          <div className="flex flex-col gap-3">
            {addresses.map((addr: AddressApi) => {
              const isSelected = selectedId === addr.id;
              return (
                <button
                  key={addr.id}
                  onClick={() => {
                    onSelect(addr.id);
                    onClose();
                  }}
                  className={`relative w-full text-left rounded-xl border-2 p-4 transition-all duration-200 ${isSelected ? "border-green bg-green/5" : "border-gray-200 bg-white hover:border-green/40"}`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${isSelected ? "border-green bg-green" : "border-gray-300"}`}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-bold text-verdant-dark">
                          {addr.streetAddress}
                        </p>
                        {addr.isDefault && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-green/10 text-green px-2 py-0.5 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 font-medium">
                        {addr.firstName} {addr.lastName}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {addr.state} • {addr.phone1}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutAddressListModal;
