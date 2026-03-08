interface MarqueeStripProps {
  farms: string[];
}

export default function MarqueeStrip({ farms }: MarqueeStripProps) {
  const doubled = [...farms, ...farms];

  return (
    <div className="bg-green overflow-hidden py-3.5 whitespace-nowrap">
      <div className="inline-block animate-marquee">
        {doubled.map((farm, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 text-[0.78rem] tracking-[0.1em] uppercase text-white mx-8"
          >
            🚜 {farm}
            <span className="text-green-light">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
