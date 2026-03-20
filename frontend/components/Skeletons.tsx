export const Shimmer = ({ className }: { className?: string }) => {
  return (
    <div
      className={`relative overflow-hidden bg-[#e8e8e8] rounded-lg ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
};

export const HeroSkeleton = () => {
  return (
    <section className="min-h-screen flex flex-col lg:flex-row overflow-hidden bg-cream pt-20">
      <div className="flex flex-col justify-center w-full lg:w-1/2 px-6 py-14 sm:px-12 lg:px-20 lg:py-0 gap-5">
        <Shimmer className="h-6 w-44 rounded-full" />
        <div className="flex flex-col gap-3">
          <Shimmer className="h-14 w-4/5 rounded-xl" />
          <Shimmer className="h-14 w-3/5 rounded-xl" />
          <Shimmer className="h-14 w-2/3 rounded-xl" />
        </div>
        <div className="flex flex-col gap-2 mt-2">
          <Shimmer className="h-4 w-full rounded-md" />
          <Shimmer className="h-4 w-5/6 rounded-md" />
          <Shimmer className="h-4 w-3/4 rounded-md" />
        </div>
        <div className="flex gap-3 mt-2">
          <Shimmer className="h-12 w-32 rounded-full" />
          <Shimmer className="h-12 w-28 rounded-full" />
        </div>
        <div className="flex gap-8 mt-6 pt-8 border-t border-black/8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <Shimmer className="h-8 w-16 rounded-md" />
              <Shimmer className="h-3 w-14 rounded-sm" />
            </div>
          ))}
        </div>
      </div>
      <div className="w-full lg:w-1/2 h-64 sm:h-96 lg:h-auto">
        <Shimmer className="w-full h-full rounded-none" />
      </div>
    </section>
  );
};

export const ProductCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      <Shimmer className="h-48 w-full rounded-none" />
      <div className="p-5 flex flex-col gap-3">
        <Shimmer className="h-3 w-24 rounded-sm" />
        <Shimmer className="h-5 w-4/5 rounded-md" />
        <Shimmer className="h-3 w-1/3 rounded-sm" />
        <div className="flex gap-1 mt-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <Shimmer key={s} className="h-3 w-3 rounded-sm" />
          ))}
        </div>
        <div className="flex gap-1.5 mt-1">
          <Shimmer className="h-4 w-14 rounded-full" />
          <Shimmer className="h-4 w-16 rounded-full" />
        </div>
        <div className="flex justify-between items-center pt-4 mt-1 border-t border-[#f0f0f0]">
          <div className="flex flex-col gap-1.5">
            <Shimmer className="h-5 w-12 rounded-md" />
            <Shimmer className="h-3 w-16 rounded-sm" />
          </div>
          <Shimmer className="h-9 w-9 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export const FeaturedSkeleton = () => {
  return (
    <section className="bg-white px-6 py-16 sm:px-10 sm:py-20 lg:px-20 lg:py-24">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-10">
        <div className="flex flex-col gap-3">
          <Shimmer className="h-3 w-20 rounded-sm" />
          <Shimmer className="h-9 w-52 rounded-lg" />
        </div>
        <Shimmer className="h-4 w-36 rounded-sm" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
};
