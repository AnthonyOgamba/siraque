"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "../../utils/firebase";

export default function VendorSettingsPage() {
  const [user, setUser] = useState(null);
  const [profileMessage, setProfileMessage] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [vendorEmail, setVendorEmail] = useState("");
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [bookingAlerts, setBookingAlerts] = useState(true);
  const [listingAlerts, setListingAlerts] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
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
    setProfileMessage("Your vendor settings have been updated.");
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
            Vendor Settings
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">
            Control your vendor account preferences
          </h1>
          <p className="mt-3 max-w-2xl text-slate-500">
            Manage notifications, security preferences, and communication settings for your vendor account.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/vendor-dashboard"
            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
          >
            Back to Dashboard
          </Link>
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
                  Account settings
                </p>
                <h2 className="mt-3 text-2xl font-bold text-slate-900">
                  {vendorName}
                </h2>
                <p className="mt-2 text-sm text-slate-500">{vendorEmail}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                {user ? "Signed in" : "Not signed in"}
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400 font-bold">
              Notification preferences
            </p>

            <div className="mt-6 space-y-4">
              <label className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div>
                  <p className="font-semibold text-slate-900">Email updates</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Receive updates for major activity on your vendor account.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={emailUpdates}
                  onChange={() => setEmailUpdates((current) => !current)}
                  className="h-5 w-5 accent-orange-600"
                />
              </label>

              <label className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div>
                  <p className="font-semibold text-slate-900">Booking alerts</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Get notified when customers place new bookings or orders.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={bookingAlerts}
                  onChange={() => setBookingAlerts((current) => !current)}
                  className="h-5 w-5 accent-orange-600"
                />
              </label>

              <label className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div>
                  <p className="font-semibold text-slate-900">Listing alerts</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Receive updates about listing changes, clicks, and engagement.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={listingAlerts}
                  onChange={() => setListingAlerts((current) => !current)}
                  className="h-5 w-5 accent-orange-600"
                />
              </label>

              <label className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div>
                  <p className="font-semibold text-slate-900">Marketing emails</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Receive tips, launch updates, and platform feature announcements.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={marketingEmails}
                  onChange={() => setMarketingEmails((current) => !current)}
                  className="h-5 w-5 accent-orange-600"
                />
              </label>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400 font-bold">
              Security
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Login status</p>
                <p className="mt-3 text-sm text-slate-700">
                  Your vendor account is currently protected by Firebase authentication.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Account access</p>
                <p className="mt-3 text-sm text-slate-700">
                  Use logout if you are on a shared device or want to switch vendor accounts.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleSave}
                className="rounded-3xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-700 transition-all"
              >
                Save preferences
              </button>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400 font-bold">
              Settings overview
            </p>
            <div className="mt-6 space-y-3 text-sm text-slate-600">
              <p>
                <span className="font-semibold text-slate-900">Email:</span>{" "}
                {emailUpdates ? "Enabled" : "Disabled"}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Booking alerts:</span>{" "}
                {bookingAlerts ? "Enabled" : "Disabled"}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Listing alerts:</span>{" "}
                {listingAlerts ? "Enabled" : "Disabled"}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Marketing:</span>{" "}
                {marketingEmails ? "Enabled" : "Disabled"}
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
            <p className="font-semibold text-slate-900">Need help?</p>
            <p className="mt-3">
              Visit the FAQ page or contact support if you need help with your vendor account settings.
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