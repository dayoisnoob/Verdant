import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import { PRODUCTS } from "@/data/products";

const TIMELINE = [
  { year: "2020", title: "Founded in a Kitchen", text: "Verdant started when our founders couldn't find truly fresh produce in the city." },
  { year: "2021", title: "First 10 Farms", text: "We partnered with 10 local farms in Kent and Sussex to pilot same-day delivery." },
  { year: "2022", title: "100,000 Customers", text: "We reached 100,000 happy customers and expanded to Yorkshire and the South West." },
  { year: "2024", title: "120+ Partner Farms", text: "Today we work with over 120 family farms across England and Scotland." },
];

const TEAM = [
  { name: "Sarah Mitchell", role: "Co-Founder & CEO", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop" },
  { name: "Tom Harcourt", role: "Head of Farms", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop" },
  { name: "Priya Sharma", role: "Head of Logistics", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop" },
  { name: "James Okafor", role: "Head of Tech", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop" },
];

const farmCount = new Set(PRODUCTS.map((p) => p.farm)).size;
const organicCount = PRODUCTS.filter((p) => p.isOrganic).length;

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 bg-cream">
        {/* Hero */}
        <div className="relative h-96 overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=1600&h=600&fit=crop"
            alt="Farm at dawn"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-green-dark/60 to-green/40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-20">
            <p className="text-xs tracking-[0.2em] uppercase text-green-pale mb-4">Our Story</p>
            <h1 className="font-playfair font-black text-white text-6xl leading-tight max-w-2xl">
              Rooted in the Land
            </h1>
            <p className="text-white/80 mt-4 max-w-lg text-base leading-relaxed">
              We started Verdant because we believed food should taste like it was just picked.
              Because it should be.
            </p>
          </div>
        </div>

        {/* Mission */}
        <div className="px-20 py-20 grid grid-cols-2 gap-20 items-center">
          <div>
            <p className="text-xs tracking-[0.15em] uppercase text-green mb-3">Our Mission</p>
            <h2 className="font-playfair font-black text-verdant-dark text-4xl leading-tight mb-6">
              Connecting communities to the farms that feed them.
            </h2>
            <p className="text-verdant-muted leading-[1.85] text-base">
              Every week, millions of people eat produce that was picked weeks ago, shipped
              thousands of miles, and stored in refrigerated warehouses. We think that&apos;s
              broken. Verdant exists to fix it — one farm partnership at a time.
            </p>
            <p className="text-verdant-muted leading-[1.85] text-base mt-4">
              We work exclusively with farms within 60 miles of the communities we serve.
              We pay farmers fairly. We deliver within 24 hours of harvest. And we never
              compromise on quality.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { num: `${farmCount}+`, label: "Partner Farms", icon: "🚜" },
              { num: `${organicCount}`, label: "Organic Products", icon: "🌱" },
              { num: "60mi", label: "Max Distance", icon: "📍" },
              { num: "24h", label: "Harvest to Door", icon: "⚡" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl p-6 border border-green/10">
                <div className="text-3xl mb-3">{s.icon}</div>
                <div className="font-playfair text-3xl font-bold text-green">{s.num}</div>
                <div className="text-sm text-verdant-muted mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-[#F0F7F2] px-20 py-20">
          <h2 className="font-playfair font-black text-verdant-dark text-4xl text-center mb-14">
            Our Journey
          </h2>
          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-green/20 -translate-x-1/2" />
            <div className="flex flex-col gap-12">
              {TIMELINE.map((t, i) => (
                <div key={t.year} className={`flex items-start gap-10 ${i % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}>
                  <div className="flex-1 flex justify-end">
                    <div className={`bg-white rounded-2xl p-6 max-w-sm border border-green/10 shadow-sm ${i % 2 !== 0 ? "opacity-0 pointer-events-none" : ""}`}>
                      {i % 2 === 0 && (
                        <>
                          <div className="font-playfair text-green font-bold text-xl mb-1">{t.title}</div>
                          <p className="text-verdant-muted text-sm leading-relaxed">{t.text}</p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 w-16 h-16 bg-green rounded-full flex items-center justify-center z-10 shadow-md">
                    <span className="text-white font-playfair font-bold text-sm">{t.year}</span>
                  </div>
                  <div className="flex-1">
                    <div className={`bg-white rounded-2xl p-6 max-w-sm border border-green/10 shadow-sm ${i % 2 === 0 ? "opacity-0 pointer-events-none" : ""}`}>
                      {i % 2 !== 0 && (
                        <>
                          <div className="font-playfair text-green font-bold text-xl mb-1">{t.title}</div>
                          <p className="text-verdant-muted text-sm leading-relaxed">{t.text}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="px-20 py-20">
          <h2 className="font-playfair font-black text-verdant-dark text-4xl text-center mb-12">
            The Team
          </h2>
          <div className="grid grid-cols-4 gap-8">
            {TEAM.map((m) => (
              <div key={m.name} className="text-center group">
                <div className="relative w-36 h-36 rounded-full overflow-hidden mx-auto mb-4 border-4 border-green-pale group-hover:border-green-light transition-colors duration-300">
                  <Image src={m.img} alt={m.name} fill className="object-cover" />
                </div>
                <div className="font-playfair font-bold text-verdant-dark text-lg">{m.name}</div>
                <div className="text-green text-sm mt-0.5">{m.role}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="px-20 pb-20">
          <div className="bg-verdant-dark rounded-3xl p-16 text-center relative overflow-hidden">
            <span className="absolute top-4 left-12 text-8xl opacity-5">🌾</span>
            <h2 className="font-playfair font-black text-white text-4xl mb-4">
              Taste the difference.
            </h2>
            <p className="text-white/60 max-w-md mx-auto mb-8">
              Order before 10am and your produce is harvested, packed, and on its way the same day.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-green text-white px-10 py-4 rounded-full font-medium hover:bg-green-mid transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              Shop Now ↗
            </Link>
          </div>
        </div>

        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
