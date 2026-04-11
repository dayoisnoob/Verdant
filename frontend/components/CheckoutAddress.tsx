import { AddressApi } from "@/types";
import { MapPin } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

interface CheckoutAddressCard {
  selectedAddressId: string;
  setManualSelection: Dispatch<SetStateAction<string | null>>;
  address: AddressApi;
}

const CheckoutAddress = ({
  selectedAddressId,
  setManualSelection,
  address,
}: CheckoutAddressCard) => {
  const isSelected = selectedAddressId === address.id;

  return (
    <button
      key={address.id}
      type="button"
      onClick={() => setManualSelection(address.id)}
      className={`relative w-full text-left rounded-xl border-2 p-5 transition-all duration-200 group ${
        isSelected
          ? "border-green bg-green/5 shadow-[0_0_0_4px_rgba(45,106,79,0.05)]"
          : "border-gray-200 bg-white hover:border-green/40 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
            isSelected
              ? "border-green bg-green"
              : "border-gray-300 group-hover:border-green/50"
          }`}
        >
          {isSelected && <div className="w-2 h-2 rounded-full bg-white/85" />}
        </div>

        <div className="relative flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <p className="text-base font-bold text-verdant-dark">
              {address.streetAddress}
            </p>
            {address.isDefault && (
              <span className="absolute -top-5 -right-4 text-[10px] font-bold uppercase tracking-wider bg-green/10 text-green px-2.5 py-1 rounded-md">
                Default
              </span>
            )}
          </div>
          <div className="space-y-1 mt-2">
            <p className="text-sm text-gray-500 flex items-center gap-1.5">
              <MapPin size={14} className="text-gray-400" />
              {address.state}
            </p>
            <p className="text-sm text-gray-600 font-medium">
              {address.firstName} {address.lastName}
            </p>
            <p className="text-sm text-gray-500">
              {address.phone1}
              {address.phone2 && ` • ${address.phone2}`}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
};

export default CheckoutAddress;
