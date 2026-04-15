"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "../../utils/firebase";

export default function VendorProfilePage() {
  const [user, setUser] = useState(null);
  const [profileMessage, setProfileMessage] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [vendorEmail, setVendorEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setVendorName(currentUser?.displayName || "Vendor Name");
      setVendorEmail(currentUser?.email || "vendor@example.com");
    });
    return unsubscribe;
  }, []);

  function handleSave() {
    setProfileMessage("Your vendor profile details have been updated.");
  }

  function handleLogout() {
    auth
      .signOut()
      .then(() => {
        router.push("/login");
      })
      .catch((error) => {
        console.error("Logout failed:", error);
        setProfileMessage("Failed to logout. Please try again.");
      });
  }

  return (
    <div className="max-w-6xl mx-auto px-6 pb-16 pt-12">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="text-[0.75rem] uppercase tracking-[0.2em] font-bold text-orange-600">
            Vendor Profile
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">
            Manage your vendor identity
          </h1>
          <p className="mt-3 max-w-2xl text-slate-500">
            Review your vendor account details, activity snapshot, and profile information in one place.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
         <Link
            href="/vendor-dashboard"
            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
          >
            Back to Dashboard
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
          >
            Logout
          </button>
        </div>
      </div>

      {profileMessage && (
        <div className="mb-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-700">
          {profileMessage}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400 font-bold">
                  Vendor identity
                </p>
                <h2 className="mt-3 text-2xl font-bold text-slate-900">
                  {vendorName}
                </h2>
                <p className="mt-2 text-sm text-slate-500">{vendorEmail}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Active vendor account
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400 font-bold">
              Activity summary
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">New orders</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">12</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Messages</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">8</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Pending updates</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">3</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-orange-600 font-bold">
                      Profile details
                    </p>
                    <h2 className="text-2xl font-bold text-slate-900">
                      Edit your account information
                    </h2>
                  </div>
                </div>
                <p className="text-slate-600 max-w-3xl">
                  Update the display name and email used across bookings, analytics, and vendor communication.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSave}
                className="rounded-full bg-orange-600 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-700 transition-all"
              >
                Save changes
              </button>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Display name</p>
                <input
                  type="text"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Email address</p>
                <input
                  type="email"
                  value={vendorEmail}
                  onChange={(e) => setVendorEmail(e.target.value)}
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400 font-bold">
              Your vendor activities
            </p>
            <div className="mt-6 space-y-4 text-sm text-slate-600">
              <p>
                Keep an eye on bookings, listing updates, and incoming customer interest from your published cards.
              </p>
              <p>
                Use the vendor dashboard navigation to view real-time metrics, manage listings, and review customer bookings.
              </p>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400 font-bold">
              Vendor details
            </p>
            <div className="mt-6 space-y-3 text-sm text-slate-600">
              <p>
                <span className="font-semibold text-slate-900">Account type:</span> Premium Vendor
              </p>
              <p>
                <span className="font-semibold text-slate-900">Listings:</span> Publish services, packages, products, and rentals.
              </p>
              <p>
                <span className="font-semibold text-slate-900">Support:</span> Use the FAQ or contact support for vendor help.
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
            <p className="font-semibold text-slate-900">Need help?</p>
            <p className="mt-3">
              Visit the FAQ page or reach out to support if you need help managing your vendor account.
            </p>
            <Link
              href="/faq"
              className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition-all"
            >
              Go to FAQ
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}