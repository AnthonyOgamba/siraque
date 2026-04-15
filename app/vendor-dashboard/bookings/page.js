"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../../utils/firebase";

export default function VendorBookingsPage() {
  const [userId, setUserId] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUserId(user ? user.uid : null);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    async function loadBookings() {
      if (!userId) {
        setBookings([]);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const bookingsRef = collection(db, "bookings");
        const bookingsQuery = query(bookingsRef, where("vendorId", "==", userId));
        const snapshot = await getDocs(bookingsQuery);

        setBookings(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
      } catch (err) {
        console.error("Vendor bookings load error:", err);
        setError("Unable to load bookings at the moment.");
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
  }, [userId]);

  return (
    <section className="max-w-7xl mx-auto px-8 py-16">
        <div className="mb-10">
          <span className="text-[0.75rem] uppercase tracking-[0.2em] font-bold text-orange-600">
            Your Bookings
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">
            Booking activity for your listings
          </h1>
          <p className="mt-3 text-slate-500 max-w-2xl">
            Review recent customer bookings, revenue, and order details for your vendor listings.
          </p>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-500 text-center">
            Loading bookings...
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-red-700 text-center">
            {error}
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-500 text-center">
            No bookings were found for this vendor account.
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">
                      Booking ID
                    </p>
                    <p className="mt-2 text-sm text-slate-700">{booking.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">
                      Status
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {booking.status || "Confirmed"}
                    </p>
                  </div>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">
                      Listing
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {booking.title || booking.listingId}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">{booking.type || "Listing"}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">
                      Quantity
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {booking.quantity || 1}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">items booked</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">
                      Total
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      ${Number(booking.totalPrice || 0).toFixed(2)}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">Paid by customer</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
  );
}
