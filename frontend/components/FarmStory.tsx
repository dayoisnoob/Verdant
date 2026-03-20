import Image from "next/image";
import Link from "next/link";

const VALUES = [
  {
    icon: "🌱",
    label: "Regenerative",
    desc: "Farms that give back to the earth",
  },
  { icon: "🚜", label: "Local First", desc: "Always within 60 miles" },
  { icon: "📦", label: "Zero Waste", desc: "Compostable packaging only" },
  { icon: "⭐", label: "Fair Pay", desc: "Farmers earn a living wage" },
];

export default function FarmStory() {
  return (
    <section className="grid grid-cols-2 min-h-[500px]">
      <div className="relative overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=900&h=700&fit=crop"
          alt="Farmer in field at dawn"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-green/40 to-green-dark/50" />
        <div className="absolute bottom-8 left-8 right-8">
          <blockquote className="font-playfair text-xl italic text-white leading-relaxed">
            &ldquo;We don&apos;t grow for the shelf. We grow for the
            table.&rdquo;
          </blockquote>
          <p className="text-white/70 text-sm mt-2">
            — James Holt, Green Meadow Farm, Kent
          </p>
        </div>
      </div>

      <div className="bg-cream px-20 py-20 flex flex-col justify-center">
        <p className="text-xs tracking-[0.15em] uppercase text-green mb-3">
          Our Promise
        </p>
        <h2 className="font-playfair font-black text-verdant-dark text-4xl leading-[1.15]">
          Rooted in
          <br />
          the Land
        </h2>
        <p className="text-verdant-muted text-[0.95rem] leading-[1.85] mt-5">
          We partner with over 120 family farms within 60 miles of your door.
          Every product carries the story of the soil it came from — and the
          hands that tended it.
        </p>

        <div className="grid grid-cols-2 gap-5 mt-10">
          {VALUES.map((v) => (
            <div key={v.label} className="flex gap-3 items-start">
              <div className="w-10 h-10 rounded-xl bg-green-pale flex items-center justify-center text-xl flex-shrink-0">
                {v.icon}
              </div>
              <div>
                <div className="font-semibold text-[0.88rem] text-verdant-dark">
                  {v.label}
                </div>
                <div className="text-[0.78rem] text-[#aaa] mt-0.5 leading-[1.4]">
                  {v.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Link
          href="/about"
          className="mt-10 text-green text-sm font-medium border-b border-green pb-px w-fit hover:opacity-65 transition-opacity"
        >
          Learn our story →
        </Link>
      </div>
    </section>
  );
}
