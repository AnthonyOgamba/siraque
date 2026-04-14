"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../utils/firebase";

export default function VendorDashboardPage() {
  const [userId, setUserId] = useState(null);
  const [vendorListings, setVendorListings] = useState([]);
  const [loadingVendorListings, setLoadingVendorListings] = useState(false);
  const [vendorError, setVendorError] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUserId(user ? user.uid : null);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    async function fetchVendorListings() {
      if (!userId) {
        return;
      }

      setLoadingVendorListings(true);
      setVendorError("");

      try {
        const listingsRef = collection(db, "listings");
        const listingsQuery = query(listingsRef, where("vendorId", "==", userId));
        const snapshot = await getDocs(listingsQuery);

        setVendorListings(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
      } catch (err) {
        console.error("Vendor listings load error:", err);
        setVendorError("Unable to load your listings at the moment.");
      } finally {
        setLoadingVendorListings(false);
      }
    }

    fetchVendorListings();
  }, [userId]);

  return (
    <main className="bg-[#f9f9fb] text-[#2d3338] min-h-screen">
      <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl flex justify-between items-center px-6 h-16">
        <div className="flex items-center gap-4">
          <span className="text-slate-900 text-xl"></span>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Siraque Vendor
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center border border-orange-200">
            <span className="text-orange-600 text-sm">👤</span>
          </div>
        </div>
      </header>

      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-64 border-r border-slate-200 bg-slate-50 z-40 pt-20">
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white font-bold">
            S
          </div>
          <div>
            <p className="text-sm font-black text-orange-600">Siraque Store</p>
            <p className="text-[10px] uppercase tracking-widest text-slate-400">
              Premium Vendor
            </p>
          </div>
        </div>

        <nav className="flex-1">
          <div className="px-3 space-y-1">
            <a
              href="#"
              className="flex items-center gap-3 px-4 py-3 bg-orange-50 text-orange-600 font-medium rounded-r-full transition-transform duration-300 hover:translate-x-1"
            >
              <span></span>
              <span className="text-sm">Dashboard</span>
            </a>

            <Link
              href="/vendor-dashboard/listings"
              className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 transition-transform duration-300 hover:translate-x-1"
            >
              <span></span>
              <span className="text-sm">Listings</span>
            </Link>

            <a
              href="#"
              className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 transition-transform duration-300 hover:translate-x-1"
            >
              <span></span>
              <span className="text-sm">Orders</span>
            </a>

            <a
              href="#"
              className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 transition-transform duration-300 hover:translate-x-1"
            >
              <span></span>
              <span className="text-sm">Analytics</span>
            </a>

            <a
              href="#"
              className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 transition-transform duration-300 hover:translate-x-1"
            >
              <span></span>
              <span className="text-sm">Settings</span>
            </a>
          </div>
        </nav>
      </aside>

      <section className="pt-24 pb-32 md:pl-72 px-6 max-w-7xl mx-auto">
        <header className="mb-12">
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-orange-600 block mb-2">
            Vendor Console
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-slate-900 max-w-2xl">
            Good morning, Siraque Store. Here is your overview.
          </h2>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <div className="group relative overflow-hidden rounded-[2rem] bg-white p-8 border border-slate-200 hover:shadow-xl transition-all duration-500 h-full">
            <div className="relative z-10 flex h-full flex-col">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-orange-600 text-3xl"></span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Product</h3>
              <p className="text-xs text-slate-600 mb-6 leading-5">
                More
              </p>
              <button className="mt-auto flex items-center gap-2 text-sm font-bold text-orange-600">
                GET STARTED <span>→</span>
              </button>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity text-[120px]">
              
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-[2rem] bg-white p-8 border border-slate-200 hover:shadow-xl transition-all duration-500 h-full">
            <div className="relative z-10 flex h-full flex-col">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-orange-600 text-3xl"></span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Service</h3>
              <p className="text-xs text-slate-600 mb-6 leading-5">
                More
              </p>
              <Link
                href="/vendor-dashboard/create-service"
                className="mt-auto flex items-center gap-2 text-sm font-bold text-orange-600"
              >
                GET STARTED <span>→</span>
              </Link>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity text-[120px]">
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-[2rem] bg-white p-8 border border-slate-200 hover:shadow-xl transition-all duration-500 h-full">
            <div className="relative z-10 flex h-full flex-col">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-orange-600 text-3xl"></span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Rental</h3>
              <p className="text-xs text-slate-600 mb-6 leading-5">
                More
              </p>
              <button className="mt-auto flex items-center gap-2 text-sm font-bold text-orange-600">
                GET STARTED <span>→</span>
              </button>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity text-[120px]">
            </div>
          </div>
        </section>

        <section className="mb-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 block mb-2">
                Analytics
              </span>
              <h3 className="text-3xl font-bold tracking-tight">
                Performance Overview
              </h3>
            </div>

            <button className="text-sm font-medium text-slate-500 hover:text-orange-600 transition-colors flex items-center gap-1">
              View Full Report <span>↗</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-[2rem] p-10 border border-slate-200 shadow-sm relative overflow-hidden">
              <p className="text-sm font-medium text-slate-500 mb-2">Total Sales</p>
              <h4 className="text-4xl font-extrabold text-slate-900">$24,850</h4>
              <div className="mt-4 flex items-center gap-2">
                <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-full">
                  +12.4%
                </span>
                <span className="text-xs text-slate-400">vs last month</span>
              </div>
              <div className="absolute right-0 bottom-0 w-24 h-24 bg-orange-50/50 rounded-tl-full -mr-4 -mb-4"></div>
            </div>

            <div className="bg-white rounded-[2rem] p-10 border border-slate-200 shadow-sm relative overflow-hidden">
              <p className="text-sm font-medium text-slate-500 mb-2">Active Listings</p>
              <h4 className="text-4xl font-extrabold text-slate-900">42</h4>
              <div className="mt-4 flex items-center gap-2">
                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-full">
                  Optimal
                </span>
                <span className="text-xs text-slate-400">Inventory level</span>
              </div>
              <div className="absolute right-0 bottom-0 w-24 h-24 bg-slate-50 rounded-tl-full -mr-4 -mb-4"></div>
            </div>

            <div className="bg-white rounded-[2rem] p-10 border border-slate-200 shadow-sm relative overflow-hidden">
              <p className="text-sm font-medium text-slate-500 mb-2">Customer Rating</p>
              <div className="flex items-center gap-2">
                <h4 className="text-4xl font-extrabold text-slate-900">4.9</h4>
                <span className="text-orange-500 text-xl">★</span>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs text-slate-400">From 182 reviews</span>
              </div>
              <div className="absolute right-0 bottom-0 w-24 h-24 bg-orange-50/30 rounded-tl-full -mr-4 -mb-4"></div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 block mb-2">
                Your Listings
              </span>
              <h3 className="text-3xl font-bold tracking-tight">Manage your published services</h3>
            </div>
            <Link
              href="/vendor-dashboard/listings"
              className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
            >
              View Listed Services
            </Link>
          </div>

          {loadingVendorListings && (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-500">
              Loading your listings...
            </div>
          )}

          {vendorError && (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-red-700">
              {vendorError}
            </div>
          )}

          {!loadingVendorListings && !vendorError && vendorListings.length === 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-500">
              {userId ? (
                <>
                  No vendor listings were found for this account.
                  <div className="mt-3 text-sm text-slate-400">
                    If you have published items, make sure you are logged in with the correct vendor account.
                  </div>
                </>
              ) : (
                <>
                  No listings are visible because you are not logged in.
                  <div className="mt-3 text-sm text-slate-400">
                    Please log in to your vendor account to see and edit your stored cards.
                  </div>
                </>
              )}
            </div>
          )}

          {!loadingVendorListings && vendorListings.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {vendorListings.map((listing) => {
                const isPackage = listing.subtype === "package";
                const isProduct = listing.type === "product";
                const isRental = listing.type === "rental";

                return (
                    <div
                    key={listing.id}
                    className="bg-white rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300"
                    >
                    <div className="p-6 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                        <div>
                            <h4 className="text-xl font-bold text-slate-900 tracking-tight">
                            {listing.title || "Untitled Listing"}
                            </h4>
                            <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                            {listing.description || "No description provided."}
                            </p>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600 mt-2">
                            More
                            </p>
                        </div>

                        <div className="rounded-full bg-orange-50 text-orange-600 px-3 py-1 text-xs uppercase font-semibold">
                            {isRental ? "Rental" : isProduct ? "Product" : isPackage ? "Package" : "Service"}
                        </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm text-slate-500">
                        <div>
                            <p className="font-semibold text-slate-900">Price</p>
                            <p>${(Number(listing.price) || 0).toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="font-semibold text-slate-900">
                            {isRental ? "Rental Type" : "Delivery"}
                            </p>
                            <p>
                            {isRental
                                ? listing.subtype === "equipment"
                                ? "Equipment"
                                : listing.subtype === "housing"
                                ? "Housing"
                                : "Vehicle"
                                : listing.deliveryMode || "Remote"}
                            </p>
                        </div>
                        </div>

                        <div className="flex gap-3">
                        <Link
                            href={
                            isRental
                                ? listing.subtype === "equipment"
                                ? "/vendor-dashboard/create-rental-equipment"
                                : listing.subtype === "housing"
                                ? "/vendor-dashboard/create-rental-housing"
                                : "/vendor-dashboard/create-rental-vehicle"
                                : isProduct
                                ? "/vendor-dashboard/create-product"
                                : isPackage
                                ? "/vendor-dashboard/create-service-package"
                                : "/vendor-dashboard/create-service"
                            }
                            className="flex-1 rounded-2xl bg-orange-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-orange-700 transition-all"
                        >
                            Edit
                        </Link>

                        <Link
                            href={
                            isRental
                                ? "/rentals"
                                : isProduct
                                ? "/products"
                                : "/services"
                            }
                            className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-all"
                        >
                            View
                        </Link>
                        </div>
                    </div>
                    </div>
                );
                })}
            </div>
          )}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-8">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 block mb-2">
                Inventory Spotlight
              </span>
              <h3 className="text-2xl font-bold mb-3">Top Performing Listing</h3>
              {vendorListings.length > 0 ? (
                <>
                  <p className="text-sm text-slate-500 max-w-2xl mb-6 line-clamp-2">
                    {vendorListings[0].description || "No description provided."}
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-sm text-slate-500 mb-6">
                    <div>
                      <p className="font-semibold text-slate-900">Price</p>
                      <p>${(Number(vendorListings[0].price) || 0).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Delivery</p>
                      <p>{vendorListings[0].deliveryMode || "Remote"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-slate-500 mb-6">
                    <div>
                      <p className="font-semibold text-slate-900">Type</p>
                      <p>{vendorListings[0].subtype === "package" ? "Package" : "Service"}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Status</p>
                      <p className="capitalize">{vendorListings[0].status || "draft"}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      href={vendorListings[0].subtype === "package" ? "/vendor-dashboard/create-service-package" : "/vendor-dashboard/create-service"}
                      className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-medium text-sm text-center hover:bg-orange-700 transition-all"
                    >
                      Edit Listing
                    </Link>
                    <Link
                      href="/services"
                      className="flex-1 py-3 bg-slate-100 rounded-xl text-sm font-semibold text-slate-700 text-center hover:bg-slate-200 transition-all"
                    >
                      View
                    </Link>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-slate-500">No spotlight listing is available yet.</p>
                  <div className="rounded-2xl bg-slate-50 p-6 text-sm text-slate-500">
                    Publish a service or package to see it highlighted here.
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden h-full min-h-[400px] flex flex-col justify-between">
            <div>
              <h3 className="text-3xl font-bold tracking-tight mb-4">
                Grow your reach with Siraque Plus
              </h3>
              <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
                Join our premium partner program to unlock featured placement and
                lower transaction fees.
              </p>
            </div>

            <div>
              <button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-2xl font-bold transition-all">
                Upgrade Store Now
              </button>
              <p className="mt-4 text-[10px] uppercase tracking-[0.1em] text-slate-500">
                Free 30-day trial for active vendors
              </p>
            </div>

            <div className="absolute top-0 right-0 p-8 opacity-20 text-[180px]">
              
            </div>
          </div>
        </section>
      </section>

      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center pt-3 pb-6 bg-white/80 backdrop-blur-2xl rounded-t-2xl shadow-[0_-12px_40px_rgba(0,0,0,0.05)] border-t border-slate-200">
        <a href="#" className="flex flex-col items-center gap-1 text-orange-600">
          <span></span>
          <span className="text-[10px] uppercase tracking-wider font-semibold">
            Home
          </span>
        </a>

        <a href="#" className="flex flex-col items-center gap-1 text-slate-400">
          <span>💳</span>
          <span className="text-[10px] uppercase tracking-wider font-semibold">
            Sales
          </span>
        </a>

        <a href="#" className="flex flex-col items-center gap-1 text-slate-400">
          <span> layers </span>
          <span className="text-[10px] uppercase tracking-wider font-semibold">
            Inventory
          </span>
        </a>

        <a href="#" className="flex flex-col items-center gap-1 text-slate-400">
          <span>⋯</span>
          <span className="text-[10px] uppercase tracking-wider font-semibold">
            More
          </span>
        </a>
      </nav>

      <div className="fixed bottom-10 right-10 z-40 hidden md:block">
        <button className="bg-orange-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all group">
          <span className="text-2xl"></span>
          <span className="absolute right-16 bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Help Center
          </span>
        </button>
      </div>
    </main>
  );
}