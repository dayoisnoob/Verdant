"use client";

import { useCart, useLogout } from "@/hooks";
import { NAV_LINKS } from "@/lib/constants";
import { useAuthStore } from "@/store/store";
import {
  ChevronDown,
  Heart,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingBag,
  Sprout,
  User,
  UserCircle,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import SearchModal from "./SearchModal";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const logout = useLogout();
  const user = useAuthStore((s) => s.user);
  const { itemsQuantity } = useCart();

  const firstName = user?.firstName?.split(" ")[0] ?? "";

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

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

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleLogout = async () => {
    await logout();
    setAccountOpen(false);
    setMobileOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-200 ${
          scrolled ? "bg-white border-b border-gray-200" : "bg-cream"
        }`}
      >
        <div className="h-1 bg-green w-full" />

        <div className="flex items-center justify-between px-6 md:px-10 lg:px-16 py-4">
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-green flex items-center justify-center text-white">
              <Sprout size={20} strokeWidth={2.5} />
            </div>
            <span className="font-playfair text-2xl font-black text-verdant-dark tracking-tight">
              Ver<em className="not-italic text-green">dant</em>
            </span>
          </Link>

          <ul className="hidden md:flex items-center gap-8 list-none">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-xs font-bold tracking-widest uppercase text-gray-500 hover:text-green transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setSearchOpen(true)}
              className="text-gray-500 hover:text-green transition-colors p-2"
              aria-label="Open search"
            >
              <Search size={20} strokeWidth={2.5} />
            </button>

            <div className="hidden md:block relative" ref={dropdownRef}>
              <button
                onClick={() => setAccountOpen(!accountOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors border ${
                  accountOpen
                    ? "bg-gray-50 border-gray-200 text-verdant-dark"
                    : "bg-transparent border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-200 hover:text-verdant-dark"
                }`}
              >
                {user ? (
                  <div className="w-6 h-6 rounded-full bg-verdant-dark flex items-center justify-center text-white text-[10px] flex-shrink-0">
                    {firstName.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <User size={16} strokeWidth={2.5} />
                )}
                <span className="hidden lg:inline">
                  {user ? firstName : "Account"}
                </span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${accountOpen ? "rotate-180" : ""}`}
                />
              </button>

              {accountOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden z-50">
                  {user ? (
                    <>
                      <div className="px-5 py-5 bg-gray-50/50 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-verdant-dark flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {firstName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-verdant-dark truncate">
                              {firstName}
                            </p>
                            <p className="text-xs text-gray-500 font-medium truncate mt-0.5">
                              {user?.email}
                            </p>
                          </div>
                        </div>
                      </div>

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
                            className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-green transition-colors"
                          >
                            <Icon size={16} strokeWidth={2.5} />
                            {label}
                          </Link>
                        ))}
                      </div>

                      <div className="border-t border-gray-100 py-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-5 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={16} strokeWidth={2.5} />
                          Sign out
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-6 flex flex-col gap-3">
                      <p className="text-xs text-gray-500 font-medium text-center leading-relaxed mb-2">
                        Sign in to track orders and save your favourites.
                      </p>
                      <Link
                        href="/login"
                        onClick={() => setAccountOpen(false)}
                        className="block w-full text-center bg-green text-white py-3 rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-green-mid transition-colors"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setAccountOpen(false)}
                        className="block w-full text-center bg-white border-2 border-gray-200 text-verdant-dark py-3 rounded-xl text-xs font-bold tracking-widest uppercase hover:border-gray-300 transition-colors"
                      >
                        Create Account
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Link
              href="/basket"
              className="flex items-center gap-2 bg-green text-white pl-4 pr-3 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-green-mid transition-colors"
            >
              <ShoppingBag size={16} strokeWidth={2.5} />
              <span className="hidden sm:inline">Basket</span>
              {itemsQuantity > 0 && (
                <span className="w-5 h-5 rounded-md bg-white text-green text-[10px] font-black flex items-center justify-center flex-shrink-0 ml-1">
                  {itemsQuantity > 9 ? "9+" : itemsQuantity}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-verdant-dark hover:bg-gray-200 transition-colors ml-1"
              aria-label="Open menu"
            >
              <Menu size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </nav>

      <div
        onClick={() => setMobileOpen(false)}
        className={`fixed inset-0 z-50 bg-verdant-dark/20 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        className={`fixed top-0 right-0 bottom-0 z-[60] w-full max-w-sm bg-white border-l border-gray-100 flex flex-col md:hidden transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="font-playfair text-2xl font-black text-verdant-dark tracking-tight"
          >
            Ver<em className="not-italic text-green">dant</em>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-verdant-dark transition-colors"
            aria-label="Close menu"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div className="px-6 pt-6">
          {user ? (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-verdant-dark flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {firstName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-base font-bold text-verdant-dark truncate">
                  {firstName}
                </p>
                <p className="text-sm text-gray-500 font-medium truncate mt-0.5">
                  {user?.email}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center bg-green text-white py-3.5 rounded-xl text-sm font-bold tracking-widest uppercase hover:bg-green-mid transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center bg-white border-2 border-gray-200 text-verdant-dark py-3.5 rounded-xl text-sm font-bold tracking-widest uppercase hover:border-gray-300 transition-colors"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-6 mt-8 custom-scrollbar">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">
            Browse
          </p>
          <ul className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between px-4 py-4 rounded-xl text-sm font-bold text-verdant-dark hover:bg-gray-50 transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {user && (
            <>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 mt-8">
                Account
              </p>
              <ul className="flex flex-col gap-2">
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
                      className="flex items-center gap-3 px-4 py-4 rounded-xl text-sm font-bold text-verdant-dark hover:bg-gray-50 transition-colors"
                    >
                      <Icon
                        size={18}
                        strokeWidth={2.5}
                        className="text-gray-400"
                      />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </nav>

        <div className="px-6 pb-8 pt-6 border-t border-gray-100 bg-white flex flex-col gap-4">
          <Link
            href="/basket"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-2 w-full bg-green text-white py-4 rounded-xl text-sm font-bold tracking-widest uppercase hover:bg-green-mid transition-colors"
          >
            <ShoppingBag size={18} strokeWidth={2.5} />
            View Basket
            {itemsQuantity > 0 && (
              <span className="w-5 h-5 rounded-md bg-white text-green text-[10px] font-black flex items-center justify-center ml-1">
                {itemsQuantity > 9 ? "9+" : itemsQuantity}
              </span>
            )}
          </Link>

          {user && (
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full bg-white border-2 border-red-100 text-red-500 py-3.5 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} strokeWidth={2.5} />
              Sign out
            </button>
          )}
        </div>
      </aside>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
