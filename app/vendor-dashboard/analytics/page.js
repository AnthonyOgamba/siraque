"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../../utils/firebase";

export default function VendorDashboardAnalyticsPage() {
  const [userId, setUserId] = useState(null);
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUserId(user ? user.uid : null);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    async function loadData() {
      if (!userId) {
        setListings([]);
        setBookings([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const listingsRef = collection(db, "listings");
        const listingsQuery = query(listingsRef, where("vendorId", "==", userId));
        const listingsSnapshot = await getDocs(listingsQuery);
        const listingData = listingsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setListings(listingData);

        const bookingsRef = collection(db, "bookings");
        const bookingsQuery = query(bookingsRef, where("vendorId", "==", userId));
        const bookingsSnapshot = await getDocs(bookingsQuery);
        const bookingData = bookingsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBookings(bookingData);
      } catch (err) {
        console.error("Analytics load error:", err);
        setError("Unable to load analytics right now.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [userId]);

  const totalRevenue = useMemo(
    () => bookings.reduce((sum, booking) => sum + (Number(booking.totalPrice) || 0), 0),
    [bookings]
  );

  const totalBookings = bookings.length;
  const totalPublished = listings.length;

  const totalClicks = useMemo(
    () => listings.reduce((sum, listing) => sum + (Number(listing.clicks) || 0), 0),
    [listings]
  );

  const avgRevenuePerBooking = totalBookings > 0 ? totalRevenue / totalBookings : 0;
  const clickToBookingRate =
    totalClicks > 0 ? Math.min((totalBookings / totalClicks) * 100, 100) : 0;

  const listingTypeBreakdown = useMemo(() => {
    return listings.reduce(
      (acc, listing) => {
        if (listing.type === "product") acc.products += 1;
        else if (listing.type === "rental") acc.rentals += 1;
        else if (listing.subtype === "package") acc.packages += 1;
        else acc.services += 1;
        return acc;
      },
      { products: 0, rentals: 0, packages: 0, services: 0 }
    );
  }, [listings]);

  const totalBreakdown =
    listingTypeBreakdown.products +
    listingTypeBreakdown.rentals +
    listingTypeBreakdown.packages +
    listingTypeBreakdown.services;

  function getListingLabel(listing) {
    if (listing.type === "product") return "Product";
    if (listing.type === "rental") return "Rental";
    if (listing.subtype === "package") return "Package";
    return "Service";
  }

  function getListingSecondaryText(listing) {
    if (listing.type === "product") return listing.category || "Product";
    if (listing.type === "rental") return listing.subtype || "Rental";
    return listing.subtype === "package" ? "Package" : "Service";
  }

  function getPercent(value) {
    if (!totalBreakdown) return 0;
    return Math.round((value / totalBreakdown) * 100);
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-[0.75rem] uppercase tracking-[0.2em] font-bold text-orange-600">
              Vendor analytics
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">
              Real-time vendor performance metrics
            </h1>
            <p className="mt-3 max-w-2xl text-slate-500">
              Track bookings, revenue, published listings, and customer engagement
              in one clean dashboard.
            </p>
          </div>

          <Link
            href="/vendor-dashboard"
            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
          >
            Back to Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-slate-500 text-center shadow-sm">
            Loading analytics...
          </div>
        ) : error ? (
          <div className="rounded-[2rem] border border-red-200 bg-red-50 p-10 text-red-700 text-center">
            {error}
          </div>
        ) : (
          <>
            <div className="grid gap-6 xl:grid-cols-4">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-400 font-bold">
                      Listings live
                    </p>
                    <p className="mt-4 text-4xl font-extrabold text-slate-900">
                      {totalPublished}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-500">
                  Total published items across your marketplace.
                </p>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-400 font-bold">
                      Bookings
                    </p>
                    <p className="mt-4 text-4xl font-extrabold text-slate-900">
                      {totalBookings}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-500">
                  Confirmed customer orders and reservations.
                </p>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-400 font-bold">
                      Revenue
                    </p>
                    <p className="mt-4 text-4xl font-extrabold text-slate-900">
                      ${totalRevenue.toFixed(2)}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-500">
                  Total value generated from booking activity.
                </p>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-400 font-bold">
                      Listing clicks
                    </p>
                    <p className="mt-4 text-4xl font-extrabold text-slate-900">
                      {totalClicks}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-500">
                  Customer engagement across all your live listings.
                </p>
              </div>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm lg:col-span-2">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      Performance overview
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                      A quick snapshot of how your marketplace is performing.
                    </p>
                  </div>
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-orange-600">
                    Live
                  </span>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm text-slate-500">Average order value</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      ${avgRevenuePerBooking.toFixed(2)}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm text-slate-500">Click to booking rate</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {clickToBookingRate.toFixed(1)}%
                    </p>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm text-slate-500">Most recent activity</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {bookings.length > 0 ? "Booking" : listings.length > 0 ? "Listing" : "None"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900">
                  Listing mix
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Breakdown of the types of listings you currently have live.
                </p>

                <div className="mt-8 space-y-5">
                  {[
                    { label: "Products", value: listingTypeBreakdown.products },
                    { label: "Rentals", value: listingTypeBreakdown.rentals },
                    { label: "Packages", value: listingTypeBreakdown.packages },
                    { label: "Services", value: listingTypeBreakdown.services },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-semibold text-slate-700">
                          {item.label}
                        </span>
                        <span className="text-slate-500">
                          {item.value} · {getPercent(item.value)}%
                        </span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-orange-600"
                          style={{ width: `${getPercent(item.value)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      Latest published listings
                    </h2>
                    <p className="mt-3 text-sm text-slate-500">
                      Your most recent vendor items that are live and visible to customers.
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">
                    {listings.length} total
                  </span>
                </div>

                <div className="mt-6 space-y-4">
                  {listings.slice(0, 5).map((listing) => (
                    <div
                      key={listing.id}
                      className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {listing.title || "Untitled listing"}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {getListingSecondaryText(listing)}
                          </p>
                        </div>
                        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-600">
                          {getListingLabel(listing)}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
                        <span>
                          Clicks: <span className="font-semibold text-slate-900">{listing.clicks || 0}</span>
                        </span>
                        <span>
                          Price:{" "}
                          <span className="font-semibold text-slate-900">
                            ${Number(listing.price || 0).toFixed(2)}
                          </span>
                        </span>
                      </div>
                    </div>
                  ))}

                  {listings.length === 0 && (
                    <p className="text-sm text-slate-500">
                      No published listings yet.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      Booking summary
                    </h2>
                    <p className="mt-3 text-sm text-slate-500">
                      Recent customer activity and order totals for your vendor listings.
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">
                    {bookings.length} total
                  </span>
                </div>

                <div className="mt-6 space-y-4">
                  {bookings.slice(0, 5).map((booking) => (
                    <div
                      key={booking.id}
                      className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                    >
                      <p className="font-semibold text-slate-900">
                        {booking.title || booking.listingId || "Booking"}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        ${Number(booking.totalPrice || 0).toFixed(2)} ·{" "}
                        {booking.quantity || 1} booked
                      </p>
                    </div>
                  ))}

                  {bookings.length === 0 && (
                    <p className="text-sm text-slate-500">
                      No booking activity yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}