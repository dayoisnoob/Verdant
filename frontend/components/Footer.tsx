import Link from "next/link";

const CATEGORIES = [
  "Leafy Greens", "Brassicas", "Root Vegetables", "Berries",
  "Stone Fruits", "Fruiting Vegetables", "Alliums", "Legumes",
  "Squash & Gourds", "Herbs", "Mushrooms",
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

export default function Footer() {
  return (
    <footer className="bg-verdant-dark text-white/60 px-20 pt-16 pb-8">
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-12">
        {/* Brand */}
        <div>
          <div className="font-playfair text-3xl font-black text-white mb-3">
            Ver<em className="not-italic text-green-light">dant</em>
          </div>
          <p className="text-sm leading-[1.75] max-w-[230px]">
            Connecting communities to the farms that feed them — since 2020.
          </p>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-white text-xs font-semibold uppercase tracking-widest mb-4">
            Shop
          </h4>
          <ul className="space-y-2.5">
            {CATEGORIES.slice(0, 6).map((cat) => (
              <li key={cat}>
                <Link
                  href={`/shop?category=${encodeURIComponent(cat)}`}
                  className="text-[0.88rem] text-white/45 hover:text-green-light transition-colors"
                >
                  {cat}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-white text-xs font-semibold uppercase tracking-widest mb-4">
            Company
          </h4>
          <ul className="space-y-2.5">
            {COMPANY_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-[0.88rem] text-white/45 hover:text-green-light transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-white text-xs font-semibold uppercase tracking-widest mb-4">
            Support
          </h4>
          <ul className="space-y-2.5">
            {SUPPORT_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-[0.88rem] text-white/45 hover:text-green-light transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 pt-6 flex justify-between text-xs">
        <span>© 2025 Verdant Ltd. All rights reserved.</span>
        <div className="flex gap-6">
          <Link href="/privacy" className="hover:text-green-light transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-green-light transition-colors">Terms</Link>
          <Link href="/cookies" className="hover:text-green-light transition-colors">Cookies</Link>
        </div>
      </div>
    </footer>
  );
}
