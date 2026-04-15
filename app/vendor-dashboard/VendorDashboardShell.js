"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "../utils/firebase";

const navItems = [
  { href: "/vendor-dashboard", label: "Overview" },
  { href: "/vendor-dashboard/listings", label: "Listings" },
  { href: "/vendor-dashboard/bookings", label: "Bookings" },
  { href: "/vendor-dashboard/analytics", label: "Analytics" },
];

export default function VendorDashboardShell({ children }) {
  const [userInitial, setUserInitial] = useState("V");
  const [vendorName, setVendorName] = useState("Vendor");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      const initial =
        user?.displayName?.[0]?.toUpperCase() ||
        user?.email?.[0]?.toUpperCase() ||
        "V";
      setUserInitial(initial);
      setVendorName(user?.displayName || user?.email?.split("@")[0] || "Vendor");
    });
    return unsubscribe;
  }, []);

  return (
    <>
      <header className="fixed top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-screen-2xl items-center justify-between px-6 lg:px-10">
          <div className="flex items-center gap-8">
            <Link
              href="/vendor-dashboard"
              className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-600 text-sm font-black text-white">
                {userInitial}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{vendorName}</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                  Vendor account
                </p>
              </div>
            </Link>

            <nav className="hidden items-center gap-2 md:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/vendor-dashboard/notifications"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 hover:text-orange-600"
              aria-label="Vendor Notifications"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path d="M12 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 005 14h14a1 1 0 00.707-1.707L18 11.586V8a6 6 0 00-6-6zm0 20a3 3 0 003-3H9a3 3 0 003 3z" />
              </svg>
            </Link>

            <Link
              href="/vendor-dashboard/settings"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 hover:text-orange-600"
              aria-label="Settings"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path d="M12 8.5a3.5 3.5 0 110 7 3.5 3.5 0 010-7zm8.94 3.5a7.992 7.992 0 00-.35-2.2l2.02-1.58a.5.5 0 00.12-.64l-1.91-3.3a.5.5 0 00-.6-.22l-2.38.96a7.92 7.92 0 00-1.9-1.1l-.36-2.48a.5.5 0 00-.5-.42h-3.82a.5.5 0 00-.5.42l-.36 2.48a7.92 7.92 0 00-1.9 1.1l-2.38-.96a.5.5 0 00-.6.22l-1.91 3.3a.5.5 0 00.12.64l2.02 1.58c-.08.7-.08 1.41 0 2.1l-2.02 1.58a.5.5 0 00-.12.64l1.91 3.30c.12.2.35.28.6.22l2.38-.96c.57.47 1.2.84 1.9 1.1l.36 2.48a.5.5 0 00.5.42h3.82a.5.5 0 00.5-.42l.36-2.48c.7-.26 1.33-.63 1.9-1.10l2.38.96c.25.1.48 0 .6-.22l1.91-3.30a.5.5 0 00-.12-.64l-2.02-1.58c.23-.7.31-1.44.22-2.18z" />
              </svg>
            </Link>

            <Link
              href="/vendor-dashboard/profile"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-orange-50 text-sm font-semibold text-orange-600 transition-all hover:bg-orange-100"
              aria-label="Vendor Profile"
            >
              {userInitial}
            </Link>
          </div>
        </div>
      </header>

      <main className="min-h-screen bg-white pt-25 text-slate-900">
        <div className="mx-auto max-w-screen-2xl px-6 lg:px-10">{children}</div>
      </main>
    </>
  );
}