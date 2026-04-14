"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./utils/firebase";

export default function HomePage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchServices() {
      setLoading(true);
      setError("");

      try {
        const listingsRef = collection(db, "listings");
        const listingsQuery = query(
          listingsRef,
          where("status", "==", "published")
        );

        const snapshot = await getDocs(listingsQuery);
        const listingsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setListings(listingsData);
      } catch (err) {
        console.error("HomePage fetch services error:", err);
        setError("Unable to load published services at the moment.");
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, []);

  return (
    <main className="bg-[#f9f9fb] text-[#2d3338] min-h-screen">
      <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl">
        <nav className="max-w-screen-2xl mx-auto px-10 flex justify-between items-center h-20">
          <div className="flex items-center gap-12">
            <a href="#" className="text-2xl font-bold tracking-tighter text-slate-900">
              Siraque
            </a>

            <div className="hidden md:flex items-center gap-8 tracking-tight">
              <a href="/products" className="text-slate-600 hover:text-orange-600 transition-all duration-300">
                Products
              </a>
              <a href="/services" className="text-slate-600 hover:text-orange-600 transition-all duration-300">
                Services
              </a>
              <a href="#" className="text-slate-600 hover:text-orange-600 transition-all duration-300">
                Rentals
              </a>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              <span className="mr-2 text-slate-500"></span>
              <input
                type="text"
                placeholder="Find anything..."
                className="bg-transparent border-none outline-none text-sm w-48"
              />
            </div>

            <div className="flex items-center gap-4">
              <button className="text-slate-600 hover:text-orange-600 transition-colors duration-300">
                Notifications
              </button>
              <button className="text-slate-600 hover:text-orange-600 transition-colors duration-300">
                Checkout
              </button>
              <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-700 font-semibold">
                U
              </div>
            </div>
          </div>
        </nav>
      </header>

      <section className="relative min-h-screen flex items-center overflow-hidden pt-20 bg-[#f9f9fb]">
        <div className="max-w-screen-2xl mx-auto px-10 w-full grid grid-cols-12 gap-10 z-10">
          <div className="col-span-12 lg:col-span-7 flex flex-col justify-center">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-orange-600 mb-6">
              Discover the Extraordinary
            </span>

            <h1 className="text-[3.5rem] font-bold leading-tight tracking-[-0.04em] text-slate-900 mb-8">
              The Hub for Everything <br />
              You <span className="text-orange-600 italic">Need.</span>
            </h1>

            <p className="text-lg text-slate-600 max-w-lg mb-12 leading-relaxed">
              Curating the world&apos;s finest products, elite professional services,
              and premium rentals into one seamless destination.
            </p>

            <div className="bg-white p-2 rounded-[1.5rem] shadow-[0_12px_40px_rgba(230,81,0,0.05)] border border-slate-200 flex items-center max-w-2xl">
              <div className="flex-1 flex items-center px-6">
                <span className="text-orange-600 mr-3"></span>
                <input
                  type="text"
                  placeholder="Search products, services, or rentals..."
                  className="w-full border-none outline-none text-slate-900 text-lg py-3 bg-transparent"
                />
              </div>

              <button className="bg-orange-600 text-white px-8 py-4 rounded-[1rem] font-semibold hover:bg-orange-700 transition-all duration-300">
                Discover
              </button>
            </div>

            
          </div>

          <div className="hidden lg:block col-span-5 relative">
            <div className="absolute inset-0 bg-orange-600/5 rounded-[2rem] -rotate-3 scale-105"></div>

            <div className="relative h-full w-full rounded-[2rem] overflow-hidden shadow-2xl">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-oqnnUPs6IWdLHthrEqUbjUGd2409L0AlWZgYF-6mtOYr7CrgInNmTTqseSB02gCIs8-nGXr9IND5IF3_2cxHBJsxPfx2qTXdqNFDHz0zXA4oPnuAa-VmRYeOk3fBhoJ5cBbZHjVAIzNgUYsmvJKQIiUFydl4POm8N8NSD_zuDVHF2bqNDdFD3azSbJnwq6vW55ndmkmQ9xqjObU9FKXrmNqh5noLzvWz9TAgCZNrmphK9MNCOs2EwW8dJSssBaZeVO4BycPp7HcV"
                alt="Featured product"
                className="h-full w-full object-cover"
              />

              <div className="absolute bottom-8 left-8 right-8 bg-white/80 backdrop-blur-md p-6 rounded-xl border border-white/20">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-orange-600 mb-1">
                      Featured Product
                    </p>
                    <p className="text-lg font-semibold text-slate-900">
                      Chronos Elite Series
                    </p>
                  </div>
                  <span className="text-orange-600 text-xl">→</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#f9f9fb]">
        <div className="max-w-screen-2xl mx-auto px-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-4">
            <div>
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-orange-600 mb-4 block">
                Live Services
              </span>
              <h2 className="text-[2.5rem] font-bold tracking-tight text-slate-900">
                Published listings from our marketplace
              </h2>
            </div>

            <a href="/services" className="text-orange-600 font-semibold flex items-center gap-2 hover:gap-4 transition-all duration-300">
              View all services <span>→</span>
            </a>
          </div>

          {loading && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">
              Loading services...
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && listings.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">
              No published services available right now.
            </div>
          )}

          {!loading && !error && listings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {listings.map((listing) => {
                const listingType =
                  listing.type === "product"
                    ? "Product"
                    : listing.subtype === "package"
                    ? "Package"
                    : "Service";

                const durationLabel =
                  listing.type === "product"
                    ? `${listing.stock || 0} in stock`
                    : listing.duration
                    ? `${listing.duration}m session`
                    : listing.totalDuration
                    ? `${listing.totalDuration}m session`
                    : "Duration not set";

                return (
                  <div
                    key={listing.id}
                    className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 hover:shadow-xl transition-all duration-300"
                  >
                    <span className="text-xs uppercase tracking-[0.25em] font-semibold text-orange-600">
                      {listingType}
                    </span>
                    <h3 className="mt-4 text-2xl font-bold text-slate-900">
                      {listing.title || "Untitled listing"}
                    </h3>
                    <p className="mt-4 text-sm text-slate-500 line-clamp-3">
                      {listing.description || "No description available."}
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-500">
                      <span className="rounded-full bg-slate-100 px-3 py-2">
                        {durationLabel}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-2">
                        {listing.price ? `$${listing.price}` : "$0.00"}
                      </span>
                    </div>

                    <div className="mt-6 flex items-center justify-between gap-4 text-sm text-slate-600">
                      <div>
                        <p className="font-semibold text-slate-900">{listing.vendorName || "Vendor"}</p>
                        <p>{listing.category || "Service"}</p>
                      </div>
                      <span className="rounded-full bg-orange-100 text-orange-600 px-3 py-1 text-[0.65rem] font-bold uppercase">
                        Published
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-screen-2xl mx-auto px-10">
          <div className="bg-orange-100 rounded-[3rem] p-16 md:p-24 overflow-hidden relative">
            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <h2 className="text-[3rem] font-bold tracking-tight text-[#5D1A06] mb-6 leading-tight">
                Elevate Your Everyday.
              </h2>
              <p className="text-[#5D1A06]/80 text-lg mb-12">
                Join our exclusive community to receive early access to new product
                drops, elite professional connections, and luxury rental listings.
              </p>

              <form className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 bg-white border-none px-6 py-4 rounded-2xl outline-none text-slate-900"
                />
                <button className="bg-orange-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-orange-700 transition-all">
                  Join Siraque
                </button>
              </form>

              <p className="mt-6 text-sm text-[#5D1A06]/60">
                No spam. Only the finest curation once a week.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="w-full pt-20 pb-10 bg-slate-50">
        <div className="max-w-screen-2xl mx-auto px-10 grid grid-cols-4 gap-10">
          <div className="col-span-4 lg:col-span-1">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Siraque</h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              A premium unified discovery hub curating the best in physical goods,
              professional talent, and high-end rentals.
            </p>
            <div className="flex gap-4 text-slate-400">
              <span className="hover:text-orange-600 cursor-pointer">🌐</span>
              <span className="hover:text-orange-600 cursor-pointer">🔗</span>
              <span className="hover:text-orange-600 cursor-pointer">✉️</span>
            </div>
          </div>

          <div className="col-span-2 lg:col-span-1">
            <h4 className="font-bold text-slate-900 mb-6">Company</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-sm text-slate-500 hover:text-orange-600">About Us</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-orange-600">Careers</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-orange-600">Trust & Safety</a></li>
            </ul>
          </div>

          <div className="col-span-2 lg:col-span-1">
            <h4 className="font-bold text-slate-900 mb-6">Support</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-sm text-slate-500 hover:text-orange-600">Help Center</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-orange-600">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-orange-600">Terms of Service</a></li>
            </ul>
          </div>

          <div className="col-span-4 lg:col-span-1">
            <h4 className="font-bold text-slate-900 mb-6">Language</h4>
            <div className="bg-white border border-slate-200 px-4 py-2 rounded-lg flex justify-between items-center cursor-pointer hover:border-orange-600 transition-colors">
              <span className="text-sm text-slate-600">English (US)</span>
              <span className="text-slate-400 text-sm">⌄</span>
            </div>
          </div>
        </div>

        <div className="max-w-screen-2xl mx-auto px-10 mt-20 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">© 2024 Siraque. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="text-xs text-slate-400 hover:text-orange-600">Instagram</a>
            <a href="#" className="text-xs text-slate-400 hover:text-orange-600">LinkedIn</a>
            <a href="#" className="text-xs text-slate-400 hover:text-orange-600">Twitter</a>
          </div>
        </div>
      </footer>
    </main>
  );
}