interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col items-center gap-3 mt-14">
      <p className="text-xs text-verdant-muted">
        Showing{" "}
        <span className="font-medium text-verdant-dark">
          {from}–{to}
        </span>{" "}
        of <span className="font-medium text-verdant-dark">{totalItems}</span>{" "}
        products
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-5 py-2 rounded-full border text-sm font-medium transition-all
            disabled:opacity-30 disabled:cursor-not-allowed
            enabled:border-[#e5e5e5] enabled:text-verdant-muted
            enabled:hover:border-green enabled:hover:text-green enabled:hover:bg-green-pale/40"
        >
          ← Prev
        </button>

        <span className="text-sm text-verdant-dark font-medium">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-5 py-2 rounded-full border text-sm font-medium transition-all
            disabled:opacity-30 disabled:cursor-not-allowed
            enabled:border-[#e5e5e5] enabled:text-verdant-muted
            enabled:hover:border-green enabled:hover:text-green enabled:hover:bg-green-pale/40"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
