"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../utils/firebase";

export default function VendorDashboardPage() {
  const [userId, setUserId] = useState(null);
  const [vendorName, setVendorName] = useState("Vendor");
  const [greeting, setGreeting] = useState("Good morning");
  const [vendorListings, setVendorListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);

  function resolveGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 18) return "Good afternoon";
    return "Good evening";
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUserId(user?.uid || null);
      setGreeting(resolveGreeting());

      if (!user) {
        setVendorName("Vendor");
        return;
      }

      const safeName = user.displayName || user.email?.split("@")[0] || "Vendor";
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setVendorName(data.fullName || safeName);
        } else {
          setVendorName(safeName);
        }
      } catch (err) {
        console.error("Failed to load vendor name:", err);
        setVendorName(safeName);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    async function loadDashboard() {
      if (!userId) {
        setVendorListings([]);
        setTotalBookings(0);
        setTotalRevenue(0);
        setTotalClicks(0);
        setError("");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const listingsRef = collection(db, "listings");
        const listingsQuery = query(listingsRef, where("vendorId", "==", userId));
        const listingsSnapshot = await getDocs(listingsQuery);
        const listingsData = listingsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setVendorListings(listingsData);
        setTotalClicks(
          listingsData.reduce((sum, item) => sum + (Number(item.clicks) || 0), 0)
        );

        const bookingsRef = collection(db, "bookings");
        const bookingsQuery = query(bookingsRef, where("vendorId", "==", userId));
        const bookingsSnapshot = await getDocs(bookingsQuery);
        const bookingData = bookingsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTotalBookings(bookingData.length);
        setTotalRevenue(
          bookingData.reduce(
            (sum, booking) => sum + (Number(booking.totalPrice) || 0),
            0
          )
        );
      } catch (err) {
        console.error("Vendor dashboard load error:", err);
        setError("Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [userId]);

  return (
      <section className="pb-24">
        <header className="mb-4">
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-orange-600 block mb-2">
            Vendor Console
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-slate-900 max-w-2xl">
            {greeting}, {vendorName}. Here is your overview.
          </h2>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <div className="group relative overflow-hidden rounded-[2rem] bg-white p-8 border border-slate-200 hover:shadow-xl transition-all duration-500 h-full">
            <div className="relative z-10 flex h-full flex-col">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                  <path d="M20.25 8.63 12.5 4.27a1.5 1.5 0 0 0-1 .01l-7.5 3.85A1.5 1.5 0 0 0 3 9.87v4.26c0 .5.27.95.71 1.19l7.5 3.85a1.5 1.5 0 0 0 1 .02l7.5-3.85c.44-.23.72-.69.72-1.19V9.87a1.5 1.5 0 0 0-.73-1.24ZM12 5.74l6.25 3.2-6.25 3.22L5.75 8.96 12 5.74Zm-7 4.9 5.68 2.93v5.42L5 15.95V10.64Zm6.68 8.35v-5.42L17 10.64v5.31l-5.32 2.04Z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Product</h3>
              <p className="text-sm text-slate-500 mb-6 leading-6">
                Publish a new product listing so customers can discover and purchase it.
              </p>
              <Link
                href="/vendor-dashboard/create-product"
                className="mt-auto inline-flex items-center justify-center rounded-2xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-700 transition-all"
              >
                Create product <span className="ml-2">→</span>
              </Link>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity text-[120px]"></div>
          </div>

          <div className="group relative overflow-hidden rounded-[2rem] bg-white p-8 border border-slate-200 hover:shadow-xl transition-all duration-500 h-full">
            <div className="relative z-10 flex h-full flex-col">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                  <path d="M21.7 12.3a1 1 0 0 0-1.28-.22l-2.22 1.45-2.45-2.45 1.47-2.25a1 1 0 0 0-.2-1.29l-2.49-2.09a1 1 0 0 0-1.34.08L8.3 8.3a1 1 0 0 0-.2 1.29l1.45 2.22-2.45 2.45-2.25-1.47a1 1 0 0 0-1.29.2L1.78 15.7a1 1 0 0 0 .22 1.28l2.1 2.1a1 1 0 0 0 1.29.2l2.25-1.47 2.45 2.45-1.45 2.22a1 1 0 0 0 .22 1.28l2.09 2.49a1 1 0 0 0 1.34.08l7.13-5.58a1 1 0 0 0 .2-1.29l-1.47-2.25 2.45-2.45 2.22 1.45a1 1 0 0 0 1.28-.22l2.1-2.1a1 1 0 0 0-.22-1.28l-2.1-2.1Z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Service</h3>
              <p className="text-sm text-slate-500 mb-6 leading-6">
                Launch a service listing and let customers book your expertise online.
              </p>
              <Link
                href="/vendor-dashboard/create-service"
                className="mt-auto inline-flex items-center justify-center rounded-2xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-700 transition-all"
              >
                Create service <span className="ml-2">→</span>
              </Link>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity text-[120px]"></div>
          </div>

          <div className="group relative overflow-hidden rounded-[2rem] bg-white p-8 border border-slate-200 hover:shadow-xl transition-all duration-500 h-full">
            <div className="relative z-10 flex h-full flex-col">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                  <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5H16a1 1 0 0 1 .94.66l1.6 4.8h2.96a1.5 1.5 0 0 1 1.43 1.06l1 3.5A1.5 1.5 0 0 1 23 16.5V18a1 1 0 0 1-1 1h-1a2.5 2.5 0 1 1-4.92 0H8.92A2.5 2.5 0 1 1 4 19H3a1 1 0 0 1-1-1v-11Zm2.5-1a.5.5 0 0 0-.5.5V14h14.17l-1.2-3.5H5.5V5.5Zm2 14a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm10 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Rental</h3>
              <p className="text-sm text-slate-500 mb-6 leading-6">
                Add a rental listing for equipment, housing, or vehicles and start taking bookings.
              </p>
              <Link
                href="/vendor-dashboard/create-rental-equipment"
                className="mt-auto inline-flex items-center justify-center rounded-2xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-700 transition-all"
              >
                Create rental <span className="ml-2">→</span>
              </Link>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity text-[120px]"></div>
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
              <p className="text-sm font-medium text-slate-500 mb-2">Total Bookings</p>
              <h4 className="text-4xl font-extrabold text-slate-900">{totalBookings}</h4>
              <div className="mt-4 flex items-center gap-2">
                <span className="bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-full">
                  Live
                </span>
                <span className="text-xs text-slate-400">Bookings by customers</span>
              </div>
              <div className="absolute right-0 bottom-0 w-24 h-24 bg-orange-50/50 rounded-tl-full -mr-4 -mb-4"></div>
            </div>

            <div className="bg-white rounded-[2rem] p-10 border border-slate-200 shadow-sm relative overflow-hidden">
              <p className="text-sm font-medium text-slate-500 mb-2">Total Revenue</p>
              <h4 className="text-4xl font-extrabold text-slate-900">
                ${totalRevenue.toFixed(2)}
              </h4>
              <div className="mt-4 flex items-center gap-2">
                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-full">
                  Calculated
                </span>
                <span className="text-xs text-slate-400">From completed bookings</span>
              </div>
              <div className="absolute right-0 bottom-0 w-24 h-24 bg-slate-50 rounded-tl-full -mr-4 -mb-4"></div>
            </div>

            <div className="bg-white rounded-[2rem] p-10 border border-slate-200 shadow-sm relative overflow-hidden">
              <p className="text-sm font-medium text-slate-500 mb-2">Listing Clicks</p>
              <h4 className="text-4xl font-extrabold text-slate-900">{totalClicks}</h4>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs text-slate-400">Customer interest on your listings</span>
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
              <h3 className="text-3xl font-bold tracking-tight">
                Manage your published services
              </h3>
            </div>
            <Link
              href="/vendor-dashboard/listings"
              className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
            >
              View Listed Services
            </Link>
          </div>

          {loading && (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-500">
              Loading your listings...
            </div>
          )}

          {error && (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && vendorListings.length === 0 && (
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

          {!loading && vendorListings.length > 0 && (
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
                          href={isRental ? "/rentals" : isProduct ? "/products" : "/services"}
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
                      href={
                        vendorListings[0].subtype === "package"
                          ? "/vendor-dashboard/create-service-package"
                          : "/vendor-dashboard/create-service"
                      }
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

            <div className="absolute top-0 right-0 p-8 opacity-20 text-[180px]"></div>
          </div>
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
          <Link
            href="/faq"
            className="bg-orange-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all"
            aria-label="FAQ"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-6 w-6"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.5 17h-1V16h1v3zm1.07-7.75c-.2.25-.35.4-.5.55-.14.14-.28.27-.35.42-.09.18-.13.42-.13.7h-1.5c0-.33.06-.6.13-.82.08-.22.23-.4.42-.57.17-.14.42-.33.56-.47.14-.14.24-.29.24-.54 0-.19-.05-.35-.15-.49-.1-.15-.25-.26-.44-.33-.19-.08-.41-.12-.66-.12-.33 0-.63.08-.9.24-.27.16-.49.39-.66.67l-1.2-.78c.25-.4.57-.74.95-1.02.4-.28.83-.49 1.32-.62.49-.13 1.01-.2 1.56-.2.56 0 1.03.13 1.4.4.37.27.56.62.56 1.05 0 .35-.08.65-.23.92z" />
            </svg>
          </Link>
        </div>
      </section>
  );
}