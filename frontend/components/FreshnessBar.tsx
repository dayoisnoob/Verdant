interface FreshnessBarProps {
  sameDayCount: number;
  organicCount: number;
  categoryCount: number;
}

export default function FreshnessBar({
  sameDayCount,
  organicCount,
  categoryCount,
}: FreshnessBarProps) {
  const stats = [
    { num: sameDayCount, label: "Same-Day Picks" },
    { num: organicCount, label: "Organic Lines" },
    { num: categoryCount, label: "Categories" },
    { num: "120+", label: "Partner Farms" },
  ];

  return (
    <div className="bg-verdant-dark py-14 px-20 flex items-center justify-between gap-12">
      <h2 className="font-playfair font-black text-white text-4xl leading-[1.2] flex-shrink-0">
        From soil to
        <br />
        your table in
        <br />
        <em className="not-italic text-green-light">under 24 hours.</em>
      </h2>

      <div className="flex items-stretch gap-0">
        {stats.map((s, i) => (
          <div key={s.label} className="flex items-center">
            <div className="text-center px-12">
              <div className="font-playfair text-4xl font-bold text-green-light">
                {s.num}
              </div>
              <div className="text-xs text-white/50 uppercase tracking-[0.08em] mt-1">
                {s.label}
              </div>
            </div>
            {i < stats.length - 1 && (
              <div className="w-px bg-white/10 self-stretch" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
