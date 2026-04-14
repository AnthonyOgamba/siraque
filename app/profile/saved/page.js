"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function SavedItemsPage() {
  const [savedItems, setSavedItems] = useState([]);

  useEffect(() => {
    const savedClicks = window.localStorage.getItem("siraque_saved_items");
    setSavedItems(savedClicks ? JSON.parse(savedClicks) : []);
  }, []);

  return (
    <main className="min-h-screen bg-[#f9f9fb] text-slate-900">
      <div className="max-w-screen-2xl mx-auto px-10 py-16">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] font-semibold text-orange-600">Saved Items</p>
            <h1 className="mt-3 text-4xl font-bold text-slate-900">Clicked Items</h1>
            <p className="mt-3 text-slate-500 max-w-2xl">
              These are the listings you clicked on while browsing the marketplace.
            </p>
          </div>
          <Link
            href="/profile"
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:border-orange-300 hover:text-orange-600 transition-all"
          >
            Back to Profile
          </Link>
        </div>

        {savedItems.length === 0 ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-12 text-center text-slate-600">
            No saved items yet. Click product, service, or rental cards to build your list.
          </div>
        ) : (
          <div className="space-y-6">
            {savedItems.map((item) => (
              <div key={item.id} className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.subtitle || item.type || "Listing"}</p>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <p className="text-lg font-semibold text-slate-900">${(Number(item.price) || 0).toFixed(2)}</p>
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-600">Clicked</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
