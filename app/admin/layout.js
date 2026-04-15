"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "../utils/firebase";
import RoleGuard from "../components/RoleGuard";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [logoutError, setLogoutError] = useState("");

  async function handleLogout() {
    try {
      await auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Admin logout failed:", error);
      setLogoutError("Unable to logout. Please try again.");
    }
  }

  return (
    <RoleGuard allowedRoles={["superadmin"]} redirectTo="/" loginRedirect="/login">
      <div className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white shadow-sm">
          <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between gap-4 px-6 py-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-orange-600 font-semibold">
                Superadmin
              </p>
              <h1 className="text-2xl font-semibold text-slate-900">Platform Administration</h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <nav className="flex flex-wrap gap-3">
                <Link
                  href="/admin"
                  className="rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-orange-50"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/users"
                  className="rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-orange-50"
                >
                  Users
                </Link>
                <Link
                  href="/admin/analytics"
                  className="rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-orange-50"
                >
                  Analytics
                </Link>
              </nav>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-screen-2xl mx-auto px-6 py-8">{children}</main>

        {logoutError && (
          <div className="fixed bottom-4 right-4 rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm">
            {logoutError}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
