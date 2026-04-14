"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { auth } from "../utils/firebase";

const navLinks = [
  { href: "/products", label: "Products", key: "products" },
  { href: "/services", label: "Services", key: "services" },
  { href: "/rentals", label: "Rentals", key: "rentals" },
];

export default function SiteHeader({
  activePage = "",
  searchQuery = "",
  onSearch,
  showSearch = false,
  searchPlaceholder = "Find anything...",
}) {
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedCart = window.localStorage.getItem("siraque_checkout_cart");
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setCartCount(parsedCart.reduce((count, item) => count + (item.quantity || 1), 0));
    }

    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    return unsubscribe;
  }, []);

  function getUserInitial() {
    if (!user) return "U";
    if (user.photoURL) return "";
    return user.email?.[0]?.toUpperCase() || "U";
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200">
      <div className="max-w-screen-2xl mx-auto px-10 h-20 flex justify-between items-center">
        <div className="flex items-center gap-12">
          <Link href="/" className="text-2xl font-bold tracking-tighter text-slate-900">
            Siraque
          </Link>

          <div className="hidden md:flex items-center gap-8 tracking-tight">
            {navLinks.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className={
                  activePage === link.key
                    ? "text-orange-600 font-semibold transition-all duration-300"
                    : "text-slate-600 hover:text-orange-600 transition-all duration-300"
                }
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          {showSearch && (
            <div className="hidden lg:flex items-center bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearch?.(e.target.value)}
                placeholder={searchPlaceholder}
                className="bg-transparent border-none outline-none text-sm w-48"
              />
            </div>
          )}

          <div className="flex items-center gap-4">
            <Link
              href="/notifications"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:text-white hover:bg-orange-600 transition-colors duration-300"
              aria-label="Notifications"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M12 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 005 14h14a1 1 0 00.707-1.707L18 11.586V8a6 6 0 00-6-6zm0 20a3 3 0 003-3H9a3 3 0 003 3z" />
              </svg>
            </Link>
            <Link
              href="/checkout"
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:text-white hover:bg-orange-600 transition-colors duration-300"
              aria-label="Cart"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M7 4H5a1 1 0 100 2h1.22l1.94 7.76A2 2 0 009 16h8a2 2 0 001.94-1.38L20.8 8H7.42l-.94-4H7zm0 14a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-orange-600 px-1.5 text-[0.65rem] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
            {user ? (
              <Link
                href="/profile"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 hover:border-orange-600 transition-all cursor-pointer"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-100 text-slate-700 text-sm font-semibold leading-none">
                    {getUserInitial()}
                  </div>
                )}
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
