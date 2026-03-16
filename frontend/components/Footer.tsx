import {
  Apple,
  Instagram,
  Play,
  Recycle,
  Sprout,
  Tractor,
  Twitter,
  Video,
} from "lucide-react";
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
    icon: <Instagram className="w-4 h-4" />,
  },
  {
    label: "X / Twitter",
    href: "https://x.com",
    icon: <Twitter className="w-4 h-4" />,
  },
  {
    label: "TikTok",
    href: "https://tiktok.com",
    icon: <Video className="w-4 h-4" />,
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#0B100E] text-gray-400">
      <div className="h-1 w-full bg-green" />

      <div className="px-6 md:px-12 lg:px-20 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          <div className="lg:col-span-5 flex flex-col items-start">
            <Link
              href="/"
              className="font-playfair text-3xl font-black text-white mb-4 tracking-tight hover:text-green-light transition-colors"
            >
              Ver<em className="not-italic text-green">dant</em>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs mb-8 text-gray-400 font-medium">
              Connecting communities to the farms that feed them — since 2020.
            </p>

            <div className="flex flex-col gap-3 mb-10">
              {[
                { icon: Sprout, text: "100% traceable produce" },
                { icon: Tractor, text: "Same-day harvest guarantee" },
                { icon: Recycle, text: "Plastic-free packaging" },
              ].map((b) => (
                <div
                  key={b.text}
                  className="flex items-center gap-3 text-sm text-gray-400 font-medium"
                >
                  <b.icon className="w-4 h-4 text-green" />
                  {b.text}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-green transition-all duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-6">
              Shop
            </h4>
            <ul className="flex flex-col gap-4">
              {CATEGORIES.slice(0, 7).map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/shop?category=${encodeURIComponent(cat)}`}
                    className="text-sm font-medium hover:text-green transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-6">
              Company
            </h4>
            <ul className="flex flex-col gap-4">
              {COMPANY_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm font-medium hover:text-green transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-6">
              Support
            </h4>
            <ul className="flex flex-col gap-4 mb-8">
              {SUPPORT_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm font-medium hover:text-green transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
              {[
                { label: "App Store", sub: "Download on the", icon: Apple },
                { label: "Google Play", sub: "Get it on", icon: Play },
              ].map((a) => (
                <a
                  key={a.label}
                  href="#"
                  className="flex items-center gap-3 border border-white/10 rounded-xl px-4 py-3 hover:border-green hover:bg-white/5 transition-all duration-200 w-full sm:w-auto lg:w-full"
                >
                  <div className="text-white">
                    <a.icon
                      className="w-6 h-6"
                      fill="currentColor"
                      strokeWidth={1}
                    />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-0.5">
                      {a.sub}
                    </div>
                    <div className="text-sm text-white font-bold leading-none">
                      {a.label}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-green" />
            <span>
              © {new Date().getFullYear()} Verdant Ltd. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-8 text-sm font-medium">
            {[
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Terms of Service", href: "/terms" },
              { label: "Cookie Settings", href: "/cookies" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="hover:text-white transition-colors"
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
