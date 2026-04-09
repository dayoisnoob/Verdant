import { FARM_ICONS } from "@/lib/constants";
import Link from "next/link";

interface FarmInfo {
  name: string;
  origin: string;
  productCount: number;
  isOrganic: boolean;
}

interface FarmsGridProps {
  farms: FarmInfo[];
}

export default function FarmsGrid({ farms }: FarmsGridProps) {
  return (
    <section className="bg-[#F0F7F2] px-20 py-22">
      <div className="flex justify-between items-end mb-10">
        <div>
          <p className="text-xs tracking-[0.15em] uppercase text-green mb-2">
            Our Network
          </p>
          <h2 className="font-playfair font-black text-verdant-dark text-4xl leading-[1.15]">
            Meet the Farms
          </h2>
        </div>
        <Link
          href="/farms"
          className="text-green text-sm font-medium border-b border-green pb-px hover:opacity-65 transition-opacity whitespace-nowrap"
        >
          All partner farms →
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {farms.map((farm) => (
          <Link
            key={farm.name}
            href={`/farms#${farm.name.toLowerCase().replace(/\s+/g, "-")}`}
            className="bg-white rounded-2xl p-6 border border-green/10 hover:border-green-light hover:shadow-[0_4px_20px_rgba(45,106,79,0.1)] hover:-translate-y-0.5 transition-all duration-200 block"
          >
            <div className="w-11 h-11 bg-green-pale rounded-xl flex items-center justify-center text-2xl mb-4">
              {FARM_ICONS[farm.name] ?? "🌿"}
            </div>
            <div className="font-playfair font-bold text-verdant-dark text-base">
              {farm.name}
            </div>
            <div className="text-green text-xs mt-1">📍 {farm.origin}</div>
            <div className="text-[#aaa] text-xs mt-2">
              {farm.productCount} product{farm.productCount !== 1 ? "s" : ""} ·{" "}
              {farm.isOrganic ? "🌱 Organic certified" : "Conventional"}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
