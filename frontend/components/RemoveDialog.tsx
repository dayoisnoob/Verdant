import { useWishlist } from "@/hooks";

export function RemoveDialog({
  product,
  onClose,
  onRemove,
  onWishlist,
}: {
  product: { productId: string; name: string };
  onClose: () => void;
  onRemove: () => void;
  onWishlist: (e: React.MouseEvent) => void;
}) {
  const { wishlist } = useWishlist();
  const isWishlisted = wishlist.some((l) => l.id === product.productId);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40"
        onClick={onClose}
      />

      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm bg-white rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.15)] p-6">
        <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5 text-red-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h3 className="font-playfair font-bold text-verdant-dark text-lg leading-snug mb-1">
          Remove item?
        </h3>
        <p className="text-verdant-muted text-sm leading-relaxed mb-6">
          <span className="font-medium text-verdant-dark">{product.name}</span>{" "}
          will be removed from your basket. You can save it to your wishlist
          instead.
        </p>

        <div className="flex flex-col gap-2.5">
          {!isWishlisted && (
            <button
              onClick={onWishlist}
              className="w-full flex items-center justify-center gap-2 bg-green-pale text-green border border-green/15 py-3 rounded-full text-sm font-semibold hover:bg-green hover:text-white hover:border-green transition-all"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Save to Wishlist
            </button>
          )}

          <button
            onClick={onRemove}
            className="w-full py-3 rounded-full text-sm font-semibold text-red-500 border border-red-100 hover:bg-red-50 transition-all"
          >
            Remove from Basket
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-full text-sm text-verdant-muted hover:text-verdant-dark transition-colors"
          >
            Keep it
          </button>
        </div>
      </div>
    </>
  );
}
