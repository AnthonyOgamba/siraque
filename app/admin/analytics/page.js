"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../utils/firebase";

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    totalVendors: 0,
    totalCustomers: 0,
    totalListings: 0,
    totalBookings: 0,
    totalNotifications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      setError("");

      try {
        const [usersSnap, listingsSnap, bookingsSnap, notificationsSnap] = await Promise.all([
          getDocs(collection(db, "users")),
          getDocs(collection(db, "listings")),
          getDocs(collection(db, "bookings")),
          getDocs(collection(db, "notifications")),
        ]);

        const users = usersSnap.docs.map((doc) => doc.data());
        const totalVendors = users.filter((user) => user.role === "vendor").length;
        const totalCustomers = users.filter((user) => user.role === "customer").length;
        const totalActive = users.filter((user) => user.status !== "suspended").length;
        const totalSuspended = users.filter((user) => user.status === "suspended").length;

        setStats({
          totalUsers: users.length,
          activeUsers: totalActive,
          suspendedUsers: totalSuspended,
          totalVendors,
          totalCustomers,
          totalListings: listingsSnap.size,
          totalBookings: bookingsSnap.size,
          totalNotifications: notificationsSnap.size,
        });
      } catch (err) {
        console.error("Admin analytics load error:", err);
        setError("Unable to load analytics metrics.");
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  return (
    <div className="space-y-10">
      <section className="rounded-[2rem] bg-white p-10 shadow-sm border border-slate-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] font-semibold text-orange-600">
              Analytics summary
            </p>
            <h2 className="mt-3 text-4xl font-bold text-slate-900">Platform activity at a glance</h2>
            <p className="mt-4 text-slate-600 max-w-2xl">
              Review account growth, listing volume, booking activity, and notification delivery from the platform.
            </p>
          </div>

          <div className="rounded-3xl bg-orange-50 px-6 py-4 text-sm font-semibold text-orange-700">
            <p>Report generated in real time</p>
          </div>
        </div>

        {error && <p className="mt-6 text-sm text-red-600">{error}</p>}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8">
          <p className="text-sm uppercase tracking-[0.25em] font-semibold text-slate-500">Total users</p>
          <p className="mt-4 text-5xl font-bold text-slate-900">{loading ? "..." : stats.totalUsers}</p>
          <p className="mt-3 text-sm text-slate-600">Accounts registered across customers, vendors, and admins.</p>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8">
          <p className="text-sm uppercase tracking-[0.25em] font-semibold text-slate-500">Active accounts</p>
          <p className="mt-4 text-5xl font-bold text-slate-900">{loading ? "..." : stats.activeUsers}</p>
          <p className="mt-3 text-sm text-slate-600">Users with active platform access.</p>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8">
          <p className="text-sm uppercase tracking-[0.25em] font-semibold text-slate-500">Suspended accounts</p>
          <p className="mt-4 text-5xl font-bold text-slate-900">{loading ? "..." : stats.suspendedUsers}</p>
          <p className="mt-3 text-sm text-slate-600">Accounts currently blocked from the platform.</p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8">
          <p className="text-sm uppercase tracking-[0.25em] font-semibold text-slate-500">Vendors</p>
          <p className="mt-4 text-5xl font-bold text-slate-900">{loading ? "..." : stats.totalVendors}</p>
          <p className="mt-3 text-sm text-slate-600">Vendor accounts that can create listings and receive bookings.</p>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8">
          <p className="text-sm uppercase tracking-[0.25em] font-semibold text-slate-500">Customers</p>
          <p className="mt-4 text-5xl font-bold text-slate-900">{loading ? "..." : stats.totalCustomers}</p>
          <p className="mt-3 text-sm text-slate-600">Customer accounts browsing the marketplace.</p>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8">
          <p className="text-sm uppercase tracking-[0.25em] font-semibold text-slate-500">Notifications sent</p>
          <p className="mt-4 text-5xl font-bold text-slate-900">{loading ? "..." : stats.totalNotifications}</p>
          <p className="mt-3 text-sm text-slate-600">Platform notifications generated by admin activity.</p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8">
          <p className="text-sm uppercase tracking-[0.25em] font-semibold text-slate-500">Total listings</p>
          <p className="mt-4 text-5xl font-bold text-slate-900">{loading ? "..." : stats.totalListings}</p>
          <p className="mt-3 text-sm text-slate-600">Listings published by vendors across the marketplace.</p>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8">
          <p className="text-sm uppercase tracking-[0.25em] font-semibold text-slate-500">Total bookings</p>
          <p className="mt-4 text-5xl font-bold text-slate-900">{loading ? "..." : stats.totalBookings}</p>
          <p className="mt-3 text-sm text-slate-600">Confirmed bookings and marketplace activity captured in the system.</p>
        </div>
      </section>
    </div>
  );
}
