"use client";

import { useCart, useLogout } from "@/hooks";
import { useAuthStore } from "@/store/store";
import {
  ChevronDown,
  Heart,
  LogOut,
  Package,
  User,
  UserCircle,
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { totalQuantity } = useCart();
  const user = useAuthStore((state) => state.user);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const logout = useLogout();

  const firstName = user?.firstName?.split(" ")[0] ?? "";

  // Scroll listener
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setAccountOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-16 py-5 transition-all duration-300 ${
        scrolled
          ? "bg-cream/90 backdrop-blur-md border-b border-green/10 shadow-sm"
          : "bg-cream/80 backdrop-blur-sm"
      }`}
    >
      <Link href="/" className="font-playfair text-2xl font-black text-green">
        Ver<em className="not-italic text-green-light">dant</em>
      </Link>

      <ul className="flex items-center gap-9 list-none">
        {NAV_LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm font-medium tracking-widest uppercase text-verdant-text hover:text-green transition-colors duration-200"
            >
              {link.label}
            </Link>
          </li>
        ))}

        {/* Account dropdown */}
        <li>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setAccountOpen(!accountOpen)}
              className="flex items-center gap-1.5 text-verdant-text hover:text-green transition-colors duration-200"
            >
              <User size={18} />
              <span className="text-sm font-medium tracking-widest uppercase">
                {isLoggedIn ? `Hi, ${firstName}` : "Account"}
              </span>
              <ChevronDown
                size={13}
                className={`transition-transform duration-200 ${accountOpen ? "rotate-180" : ""}`}
              />
            </button>

            {accountOpen && (
              <div className="absolute right-0 top-full mt-3 w-56 bg-white border border-green/10 rounded-2xl shadow-[0_8px_30px_rgba(45,106,79,0.12)] overflow-hidden z-50">
                {isLoggedIn ? (
                  <>
                    <div className="px-4 py-3.5 border-b border-[#f0f0f0] bg-green-pale">
                      <p className="text-xs font-semibold text-verdant-dark truncate">
                        {firstName}
                      </p>
                      <p className="text-xs text-verdant-muted truncate mt-0.5">
                        {user?.email}
                      </p>
                    </div>

                    <div className="py-1.5">
                      <Link
                        href="/account/orders"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-verdant-text hover:bg-green-pale hover:text-green transition-colors"
                      >
                        <Package size={15} className="text-[#aaa]" />
                        My Orders
                      </Link>
                      <Link
                        href="/account/profile"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-verdant-text hover:bg-green-pale hover:text-green transition-colors"
                      >
                        <UserCircle size={15} className="text-[#aaa]" />
                        My Profile
                      </Link>
                      <Link
                        href="/account/wishlist"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-verdant-text hover:bg-green-pale hover:text-green transition-colors"
                      >
                        <Heart size={15} className="text-[#aaa]" />
                        Wishlist
                      </Link>
                    </div>

                    <div className="border-t border-[#f0f0f0] py-1.5">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                      >
                        <LogOut size={15} />
                        Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-3 flex flex-col gap-2">
                    <Link
                      href="/login"
                      onClick={() => setAccountOpen(false)}
                      className="block w-full text-center bg-green text-white py-2.5 rounded-full text-xs font-semibold tracking-widest uppercase hover:bg-green-mid transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setAccountOpen(false)}
                      className="block w-full text-center border border-[#ddd] text-verdant-text py-2.5 rounded-full text-xs font-semibold tracking-widest uppercase hover:border-green hover:text-green transition-colors"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </li>

        {/* Basket */}
        <li>
          <Link
            href="/basket"
            className="text-sm font-medium tracking-widest uppercase bg-green text-white px-5 py-2.5 rounded-full hover:bg-green-light transition-colors duration-200 flex items-center gap-2"
          >
            Basket
            {totalQuantity > 0 && (
              <span className="bg-earth text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalQuantity}
              </span>
            )}
          </Link>
        </li>
      </ul>
    </nav>
  );
}
