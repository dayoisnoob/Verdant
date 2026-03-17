import { useCart } from "@/hooks";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";

type QuantityProps = {
  qtyInCart: number;
  productId: string;
  isStockLimitReached: boolean;
  isCartLimitReached: boolean;
};
const QuantityStepper = ({
  qtyInCart,
  productId,
  isStockLimitReached,
  isCartLimitReached,
}: QuantityProps) => {
  const { updateQuantity, removeItem } = useCart();

  const handleIncrement = () => {
    updateQuantity(productId, 1);
    toast.success("Item updated successfully");
  };
  const handleDecrement = () => {
    if (qtyInCart < 1) {
      removeItem(productId);
    } else {
      updateQuantity(productId, -1);
      console.log(qtyInCart);
      toast.success("Item updated successfully");
    }
  };

  return qtyInCart >= 1 ? (
    <div className="flex items-center justify-between border-2 border-gray-200 bg-white rounded-xl overflow-hidden w-full sm:w-40 flex-shrink-0">
      <button
        onClick={handleDecrement}
        className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-verdant-dark hover:bg-gray-50 transition-colors"
      >
        <Minus size={18} strokeWidth={2.5} />
      </button>
      <span className="text-lg font-bold text-verdant-dark w-12 text-center">
        {qtyInCart}
      </span>
      <button
        disabled={isStockLimitReached || isCartLimitReached}
        onClick={handleIncrement}
        className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-verdant-dark hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus size={18} strokeWidth={2.5} />
      </button>
    </div>
  ) : null;
};

export default QuantityStepper;
