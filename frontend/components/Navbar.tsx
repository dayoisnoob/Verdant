"use client";

import { useCart, useLogout } from "@/hooks";
import { useAuthStore } from "@/store/store";
import {
  ChevronDown,
  Heart,
  LogOut,
  Menu,
  Package,
  ShoppingBasket,
  Sprout,
  User,
  UserCircle,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const NAV_LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "Farms", href: "/farms" },
  { label: "Seasonal", href: "/seasonal" },
  { label: "About", href: "/about" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { totalQuantity } = useCart();
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const logout = useLogout();
  const firstName = user?.firstName?.split(" ")[0] ?? "";

  /* scroll detection */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* close dropdown on outside click */
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      )
        setAccountOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  /* lock body scroll when mobile drawer is open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    setAccountOpen(false);
    setMobileOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-cream/95 backdrop-blur-xl shadow-[0_1px_0_rgba(45,106,79,0.08),0_8px_32px_rgba(45,106,79,0.06)]"
            : "bg-transparent"
        }`}
      >
        <div className="h-[2px] bg-gradient-to-r from-green-dark via-green-light to-orange w-full" />

        <div className="flex items-center justify-between px-6 md:px-10 lg:px-16 py-4">
          {/* ── Logo ── */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group flex-shrink-0"
          >
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-green to-green-light flex items-center justify-center shadow-sm group-hover:shadow-[0_4px_14px_rgba(45,106,79,0.35)] transition-shadow duration-300">
              <Sprout color="white" size={18} />
            </span>
            <span className="font-playfair text-xl font-black text-green tracking-tight">
              Ver<em className="not-italic text-green-light">dant</em>
            </span>
          </Link>

          {/* ── Centre links — hidden on mobile ── */}
          <ul className="hidden md:flex items-center gap-0.5 list-none">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="relative px-4 py-2 text-[0.75rem] font-semibold tracking-[0.12em] uppercase text-verdant-text hover:text-green transition-colors duration-200 group"
                >
                  {link.label}
                  <span className="absolute bottom-0.5 left-4 right-4 h-[1.5px] bg-green-light rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>
              </li>
            ))}
          </ul>

          {/* ── Right cluster ── */}
          <div className="flex items-center gap-2">
            {/* ── Account dropdown — desktop only ── */}
            <div className="hidden md:block relative" ref={dropdownRef}>
              <button
                onClick={() => setAccountOpen(!accountOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-[0.75rem] font-semibold tracking-[0.08em] uppercase transition-all duration-200 border ${
                  accountOpen
                    ? "bg-green text-white border-green shadow-[0_4px_16px_rgba(45,106,79,0.3)]"
                    : "text-verdant-text border-transparent hover:border-green/20 hover:bg-green-pale"
                }`}
              >
                {isLoggedIn ? (
                  <span className="w-5 h-5 rounded-full bg-gradient-to-br from-green to-orange flex items-center justify-center text-white text-[0.6rem] font-black flex-shrink-0">
                    {firstName.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <User size={13} />
                )}
                <span className="hidden lg:inline">
                  {isLoggedIn ? `Hi, ${firstName}` : "Account"}
                </span>
                <ChevronDown
                  size={11}
                  className={`transition-transform duration-300 ${accountOpen ? "rotate-180" : ""}`}
                />
              </button>

              {accountOpen && (
                <div className="absolute right-0 top-full mt-3 w-60 bg-white border border-green/8 rounded-2xl shadow-[0_20px_60px_rgba(45,106,79,0.14),0_4px_16px_rgba(0,0,0,0.05)] overflow-hidden z-50 animate-fade-up">
                  {isLoggedIn ? (
                    <>
                      <div className="px-4 py-4 bg-gradient-to-br from-green-pale to-cream border-b border-[#f0f0f0]">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-orange-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
                            {firstName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-verdant-dark truncate">
                              {firstName}
                            </p>
                            <p className="text-[0.65rem] text-verdant-muted truncate">
                              {user?.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* links */}
                      <div className="py-2">
                        {[
                          {
                            href: "/account/orders",
                            icon: Package,
                            label: "My Orders",
                          },
                          {
                            href: "/account/profile",
                            icon: UserCircle,
                            label: "My Profile",
                          },
                          {
                            href: "/account/wishlist",
                            icon: Heart,
                            label: "Wishlist",
                          },
                        ].map(({ href, icon: Icon, label }) => (
                          <Link
                            key={href}
                            href={href}
                            onClick={() => setAccountOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-verdant-text hover:bg-green-pale hover:text-green transition-colors group"
                          >
                            <span className="w-7 h-7 rounded-lg bg-[#f5f5f5] group-hover:bg-green/10 flex items-center justify-center transition-colors flex-shrink-0">
                              <Icon
                                size={13}
                                className="text-[#aaa] group-hover:text-green transition-colors"
                              />
                            </span>
                            {label}
                          </Link>
                        ))}
                      </div>

                      <div className="border-t border-[#f5f5f5] py-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors group"
                        >
                          <span className="w-7 h-7 rounded-lg bg-[#f5f5f5] group-hover:bg-red-50 flex items-center justify-center transition-colors flex-shrink-0">
                            <LogOut
                              size={13}
                              className="text-[#ccc] group-hover:text-red-400 transition-colors"
                            />
                          </span>
                          Sign out
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 flex flex-col gap-2.5">
                      <p className="text-[0.7rem] text-verdant-muted text-center leading-relaxed mb-0.5">
                        Sign in to track orders &amp; save favourites
                      </p>
                      <Link
                        href="/login"
                        onClick={() => setAccountOpen(false)}
                        className="block w-full text-center bg-green text-white py-2.5 rounded-full text-xs font-bold tracking-[0.1em] uppercase hover:bg-green-mid transition-all hover:shadow-[0_4px_12px_rgba(45,106,79,0.28)]"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setAccountOpen(false)}
                        className="block w-full text-center border border-[#e0e0e0] text-verdant-text py-2.5 rounded-full text-xs font-bold tracking-[0.1em] uppercase hover:border-green hover:text-green transition-colors"
                      >
                        Create Account
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Basket pill ── */}
            <Link
              href="/basket"
              className="flex items-center gap-1.5 bg-green text-white pl-4 pr-3 py-2 rounded-full text-[0.75rem] font-bold tracking-[0.08em] uppercase hover:bg-green-mid transition-all duration-200 hover:shadow-[0_6px_20px_rgba(45,106,79,0.32)] hover:-translate-y-0.5 group"
            >
              <ShoppingBasket
                size={14}
                className="group-hover:scale-110 transition-transform duration-200"
              />
              <span className="hidden sm:inline">Basket</span>
              {totalQuantity > 0 && (
                <span className="w-5 h-5 rounded-full bg-orange text-white text-[0.58rem] font-black flex items-center justify-center shadow-inner flex-shrink-0">
                  {totalQuantity > 9 ? "9+" : totalQuantity}
                </span>
              )}
            </Link>

            {/* ── Hamburger — mobile only ── */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden w-9 h-9 rounded-full bg-green-pale flex items-center justify-center text-green hover:bg-green hover:text-white transition-all duration-200"
              aria-label="Open menu"
            >
              <Menu size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* ─────────────────────────────────────────
          Mobile Drawer
      ───────────────────────────────────────── */}

      {/* Backdrop */}
      <div
        onClick={() => setMobileOpen(false)}
        className={`fixed inset-0 z-50 bg-verdant-dark/40 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Slide-in panel */}
      <aside
        className={`fixed top-0 right-0 bottom-0 z-[60] w-[82vw] max-w-sm bg-cream flex flex-col md:hidden shadow-[-20px_0_60px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-out ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-green/10">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="font-playfair text-xl font-black text-green"
          >
            Ver<em className="not-italic text-green-light">dant</em>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="w-9 h-9 rounded-full bg-green-pale flex items-center justify-center text-green hover:bg-green hover:text-white transition-all"
            aria-label="Close menu"
          >
            <X size={15} />
          </button>
        </div>

        {/* User card (mobile) */}
        <div className="px-5 pt-5">
          {isLoggedIn ? (
            <div className="bg-gradient-to-br from-green-pale to-cream border border-green/10 rounded-2xl px-4 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green to-orange flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm">
                {firstName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-verdant-dark truncate">
                  {firstName}
                </p>
                <p className="text-xs text-verdant-muted truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center bg-green text-white py-3 rounded-full text-sm font-bold tracking-wider uppercase hover:bg-green-mid transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center border border-[#ddd] text-verdant-text py-3 rounded-full text-sm font-bold tracking-wider uppercase hover:border-green hover:text-green transition-colors"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>

        {/* Scrollable nav area */}
        <nav className="flex-1 overflow-y-auto px-5 mt-6">
          <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-verdant-muted px-1 mb-2">
            Browse
          </p>
          <ul className="flex flex-col gap-0.5 list-none">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold text-verdant-text hover:bg-green-pale hover:text-green transition-all group"
                >
                  {link.label}
                  <span className="text-[#ccc] group-hover:text-green-light transition-colors text-xl leading-none">
                    ›
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {isLoggedIn && (
            <>
              <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-verdant-muted px-1 mb-2 mt-6">
                Account
              </p>
              <ul className="flex flex-col gap-0.5 list-none">
                {[
                  {
                    href: "/account/orders",
                    icon: Package,
                    label: "My Orders",
                  },
                  {
                    href: "/account/profile",
                    icon: UserCircle,
                    label: "My Profile",
                  },
                  { href: "/account/wishlist", icon: Heart, label: "Wishlist" },
                ].map(({ href, icon: Icon, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold text-verdant-text hover:bg-green-pale hover:text-green transition-all group"
                    >
                      <Icon
                        size={15}
                        className="text-[#bbb] group-hover:text-green transition-colors"
                      />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </nav>

        {/* Drawer footer */}
        <div className="px-5 pb-8 pt-4 border-t border-green/10 flex flex-col gap-3">
          <Link
            href="/basket"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-2 w-full bg-green text-white py-3.5 rounded-full text-sm font-bold tracking-wider uppercase hover:bg-green-mid transition-all hover:shadow-[0_6px_20px_rgba(45,106,79,0.28)]"
          >
            <ShoppingBasket size={15} />
            View Basket
            {totalQuantity > 0 && (
              <span className="w-5 h-5 rounded-full bg-orange text-white text-[0.6rem] font-black flex items-center justify-center">
                {totalQuantity > 9 ? "9+" : totalQuantity}
              </span>
            )}
          </Link>

          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full border border-red-100 text-red-400 py-3 rounded-full text-sm font-semibold hover:bg-red-50 transition-colors"
            >
              <LogOut size={14} />
              Sign out
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
