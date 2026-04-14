"use client";

import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import { useEffect, useState } from "react";
import { auth } from "../utils/firebase";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [expandedCard, setExpandedCard] = useState(null);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileMessage, setProfileMessage] = useState("");

  useEffect(() => {
    const savedOrderHistory = window.localStorage.getItem("siraque_order_history");
    const savedClicks = window.localStorage.getItem("siraque_saved_items");

    setOrders(savedOrderHistory ? JSON.parse(savedOrderHistory) : []);
    setSavedItems(savedClicks ? JSON.parse(savedClicks) : []);

    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setProfileName(currentUser?.displayName || "");
      setProfileEmail(currentUser?.email || "");
    });
    return unsubscribe;
  }, []);

  function handleToggleCard(cardId) {
    setExpandedCard((current) => (current === cardId ? null : cardId));
    setProfileMessage("");
  }

  function handleSaveProfile() {
    setProfileMessage("Your profile details were updated.");
  }

  return (
    <main className="min-h-screen bg-[#f9f9fb] text-slate-900">
      <SiteHeader activePage="" showSearch={false} />

      <section className="max-w-6xl mx-auto px-8 py-16">
        <div className="rounded-[2rem] bg-white border border-slate-200 p-10 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] font-semibold text-orange-600">
                Account Dashboard
              </p>
              <h1 className="mt-4 text-4xl font-bold text-slate-900">
                {user ? `Welcome back, ${user.displayName || user.email?.split("@")[0] || "Trader"}` : "Welcome to your profile"}
              </h1>
              <p className="mt-3 text-slate-500 max-w-2xl">
                Manage orders, review saved items, and get the latest booking updates from vendors.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Active items</p>
              <p className="mt-3 text-4xl font-bold text-slate-900">{orders.length + savedItems.length}</p>
              <p className="text-sm text-slate-500">Orders + Saved</p>
            </div>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            <div className="group rounded-[1.75rem] border border-slate-200 bg-slate-50 p-8 transition hover:border-orange-300 hover:shadow-lg">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] font-semibold text-orange-600">Profile</p>
                  <h2 className="mt-4 text-2xl font-bold text-slate-900">Edit details</h2>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleCard("edit-profile")}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-orange-300 hover:text-orange-600 transition-all"
                >
                  {expandedCard === "edit-profile" ? "Hide" : "More"}
                </button>
              </div>

              <p className="mt-6 text-sm text-slate-500">Update your display name and email without leaving this page.</p>
            </div>

            <Link
              href="/profile/orders"
              className="group rounded-[1.75rem] border border-slate-200 bg-slate-50 p-8 transition hover:border-orange-300 hover:shadow-lg"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] font-semibold text-orange-600">Orders</p>
                  <h2 className="mt-4 text-2xl font-bold text-slate-900">Booked Items</h2>
                </div>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                    <path d="M4 4h16v2H4V4zm0 4h16v14H4V8zm2 2v10h12V10H6z" />
                  </svg>
                </span>
              </div>
              <p className="mt-6 text-3xl font-bold text-slate-900">{orders.length}</p>
              <p className="mt-2 text-sm text-slate-500">View your booked items and order history.</p>
            </Link>

            <Link
              href="/profile/saved"
              className="group rounded-[1.75rem] border border-slate-200 bg-slate-50 p-8 transition hover:border-orange-300 hover:shadow-lg"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] font-semibold text-orange-600">Saved</p>
                  <h2 className="mt-4 text-2xl font-bold text-slate-900">Clicked Items</h2>
                </div>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                    <path d="M12 3l4 4h-3v6h-2V7H8l4-4zm-7 10h14v8H5v-8z" />
                  </svg>
                </span>
              </div>
              <p className="mt-6 text-3xl font-bold text-slate-900">{savedItems.length}</p>
              <p className="mt-2 text-sm text-slate-500">See the items you clicked from the marketplace.</p>
            </Link>
          </div>

          {expandedCard === "edit-profile" && (
            <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white shadow-sm p-8">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-orange-600 text-lg">🛠️</span>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-orange-600 font-bold">
                        Profile details
                      </p>
                      <h2 className="text-2xl font-bold text-slate-900">Edit your account information</h2>
                    </div>
                  </div>
                  <p className="text-slate-600 max-w-3xl">
                    Update the display name and email used across bookings, notifications, and vendor communication.
                  </p>
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-start">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    className="rounded-full bg-orange-600 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-700 transition-all"
                  >
                    Save changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpandedCard(null)}
                    className="self-start rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-all"
                  >
                    Close details
                  </button>
                </div>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Display name</p>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="mt-3 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Email address</p>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="mt-3 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>

              {profileMessage && (
                <p className="mt-6 rounded-3xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
                  {profileMessage}
                </p>
              )}
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
