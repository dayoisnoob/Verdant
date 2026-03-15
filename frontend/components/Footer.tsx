import { Instagram } from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  "Leafy Greens",
  "Brassicas",
  "Root Vegetables",
  "Berries",
  "Stone Fruits",
  "Fruiting Vegetables",
  "Alliums",
  "Legumes",
  "Squash & Gourds",
  "Herbs",
  "Mushrooms",
];

const COMPANY_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Our Farms", href: "/farms" },
  { label: "Blog", href: "/blog" },
  { label: "Careers", href: "/careers" },
];

const SUPPORT_LINKS = [
  { label: "Delivery Info", href: "/delivery" },
  { label: "Returns", href: "/returns" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

const SOCIALS = [
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: <Instagram />,
  },
  {
    label: "X / Twitter",
    href: "https://x.com",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://tiktok.com",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#111710] text-white/50">
      {/* ── thin accent line at top ── */}
      <div className="h-[1.5px] bg-green/25 w-full" />

      {/* ── Main content ── */}
      <div className="px-6 md:px-12 lg:px-20 pt-14 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-10 lg:gap-12 mb-14">
          {/* ── Brand column ── */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="font-playfair text-2xl font-black text-white mb-4 tracking-tight">
              Ver<em className="not-italic text-green-light">dant</em>
            </div>
            <p className="text-[0.85rem] leading-relaxed max-w-[220px] mb-6">
              Connecting communities to the farms that feed them — since 2020.
            </p>

            {/* Trust badges */}
            <div className="flex flex-col gap-2.5 mb-8">
              {[
                { icon: "🌱", text: "100% traceable produce" },
                { icon: "🚜", text: "Same-day harvest guarantee" },
                { icon: "♻️", text: "Plastic-free packaging" },
              ].map((b) => (
                <div
                  key={b.text}
                  className="flex items-center gap-2.5 text-xs text-white/40"
                >
                  <span className="text-sm">{b.icon}</span>
                  {b.text}
                </div>
              ))}
            </div>

            {/* Socials */}
            <div className="flex items-center gap-2">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-white/40 hover:text-green-light hover:border-green/30 hover:bg-green/8 transition-all duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* ── Shop column ── */}
          <div>
            <h4 className="text-white text-[0.68rem] font-bold uppercase tracking-[0.15em] mb-5">
              Shop
            </h4>
            <ul className="flex flex-col gap-2.5 list-none">
              {CATEGORIES.slice(0, 7).map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/shop?category=${encodeURIComponent(cat)}`}
                    className="text-[0.83rem] text-white/40 hover:text-green-light transition-colors duration-150"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Company column ── */}
          <div>
            <h4 className="text-white text-[0.68rem] font-bold uppercase tracking-[0.15em] mb-5">
              Company
            </h4>
            <ul className="flex flex-col gap-2.5 list-none">
              {COMPANY_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[0.83rem] text-white/40 hover:text-green-light transition-colors duration-150"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Support column ── */}
          <div>
            <h4 className="text-white text-[0.68rem] font-bold uppercase tracking-[0.15em] mb-5">
              Support
            </h4>
            <ul className="flex flex-col gap-2.5 list-none">
              {SUPPORT_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[0.83rem] text-white/40 hover:text-green-light transition-colors duration-150"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* App badges */}
            <div className="mt-8 flex flex-col gap-2">
              {[
                { label: "App Store", sub: "Download on the" },
                { label: "Google Play", sub: "Get it on" },
              ].map((a) => (
                <a
                  key={a.label}
                  href="#"
                  className="flex items-center gap-2.5 border border-white/10 rounded-xl px-3.5 py-2.5 hover:border-green/25 hover:bg-white/3 transition-all duration-200 group w-fit"
                >
                  <div className="w-5 h-5 text-white/30 group-hover:text-green-light transition-colors">
                    {a.label === "App Store" ? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11" />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path d="M3.18 23.76c.28.15.6.2.93.14l11.4-6.57-2.45-2.45-9.88 8.88zm-1.5-20.1c-.1.26-.16.54-.16.85v18.98c0 .31.06.6.16.86l.08.07 10.64-10.63v-.25L1.76 3.59l-.08.07zm17.07 11.6l-2.8-1.62-2.68 2.67 2.68 2.67 2.82-1.62c.8-.46.8-1.22 0-1.7h-.02zm-17.5 8.95l.08.06 11.4-6.57-2.45-2.45-9.03 8.96z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className="text-[0.55rem] text-white/25 leading-none">
                      {a.sub}
                    </div>
                    <div className="text-[0.75rem] text-white/60 font-semibold leading-tight mt-0.5">
                      {a.label}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-white/8 pt-7 flex flex-col sm:flex-row items-center justify-between gap-4 text-[0.72rem]">
          <div className="flex items-center gap-2 text-white/30">
            <span className="w-1.5 h-1.5 rounded-full bg-green-light/60 inline-block" />
            <span>
              © {new Date().getFullYear()} Verdant Ltd. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-5 text-white/30">
            {[
              { label: "Privacy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
              { label: "Cookies", href: "/cookies" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="hover:text-green-light transition-colors duration-150"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
