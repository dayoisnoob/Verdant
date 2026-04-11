import { Dispatch, SetStateAction } from "react";

interface DeliveryNotesProps {
  deliveryNotes: string;
  setDeliveryNotes: Dispatch<SetStateAction<string>>;
}

const DeliveryNotes = ({
  deliveryNotes,
  setDeliveryNotes,
}: DeliveryNotesProps) => {
  const inputStyles =
    "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green focus:ring-4 focus:ring-green/10 transition-all bg-gray-50/50 hover:bg-white text-verdant-dark placeholder:text-gray-400";

  return (
    <div className="bg-white/85 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-50">
        <h3 className="font-bold text-verdant-dark text-lg">Delivery Notes</h3>
      </div>
      <div className="p-6 bg-gray-50/30">
        <textarea
          value={deliveryNotes}
          onChange={(e) => setDeliveryNotes(e.target.value)}
          rows={3}
          placeholder="e.g. Call on arrival, landmark is the blue gate..."
          className={`${inputStyles} resize-none`}
        />
      </div>
    </div>
  );
};

export default DeliveryNotes;
