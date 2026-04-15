"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../utils/firebase";

export default function AdminPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalCustomers: 0,
    totalAdmins: 0,
    totalListings: 0,
    totalBookings: 0,
    totalUnknownRoles: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      setError("");

      try {
        const [usersSnap, listingsSnap, bookingsSnap] = await Promise.all([
          getDocs(collection(db, "users")),
          getDocs(collection(db, "listings")),
          getDocs(collection(db, "bookings")),
        ]);

        const users = usersSnap.docs.map((doc) => doc.data());
        const totalVendors = users.filter((user) => user.role === "vendor").length;
        const totalCustomers = users.filter((user) => user.role === "customer").length;
        const totalAdmins = users.filter((user) => user.role === "superadmin").length;
        const totalUnknownRoles = users.filter(
          (user) => !["vendor", "customer", "superadmin"].includes(user.role)
        ).length;

        setStats({
          totalUsers: users.length,
          totalVendors,
          totalCustomers,
          totalAdmins,
          totalListings: listingsSnap.size,
          totalBookings: bookingsSnap.size,
          totalUnknownRoles,
        });
      } catch (err) {
        console.error("Admin stats load error:", err);
        setError("Unable to load admin statistics right now.");
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <div className="space-y-10">
      <section className="rounded-[2rem] bg-white p-10 shadow-sm border border-slate-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] font-semibold text-orange-600">
              Admin dashboard
            </p>
            <h2 className="mt-3 text-4xl font-bold text-slate-900">Super admin overview</h2>
            <p className="mt-4 text-slate-600 max-w-2xl">
              Manage users, send platform notifications, and review overall activity from a single place.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/admin/users" className="rounded-2xl bg-orange-600 px-6 py-4 text-center font-semibold text-white hover:bg-orange-700 transition">
              Manage users
            </Link>
            <Link href="/admin/analytics" className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-center font-semibold text-slate-900 hover:border-orange-300 transition">
              View analytics
            </Link>
          </div>
        </div>

        {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm uppercase tracking-[0.25em] font-semibold text-slate-500">Total accounts</p>
            <p className="mt-4 text-4xl font-bold text-slate-900">{loading ? "..." : stats.totalUsers}</p>
          </div>
          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm uppercase tracking-[0.25em] font-semibold text-slate-500">Active vendors</p>
            <p className="mt-4 text-4xl font-bold text-slate-900">{loading ? "..." : stats.totalVendors}</p>
          </div>
          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm uppercase tracking-[0.25em] font-semibold text-slate-500">Customers</p>
            <p className="mt-4 text-4xl font-bold text-slate-900">{loading ? "..." : stats.totalCustomers}</p>
          </div>
          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm uppercase tracking-[0.25em] font-semibold text-slate-500">Admins</p>
            <p className="mt-4 text-4xl font-bold text-slate-900">{loading ? "..." : stats.totalAdmins}</p>
          </div>
          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm uppercase tracking-[0.25em] font-semibold text-slate-500">Listings</p>
            <p className="mt-4 text-4xl font-bold text-slate-900">{loading ? "..." : stats.totalListings}</p>
          </div>
          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm uppercase tracking-[0.25em] font-semibold text-slate-500">Bookings</p>
            <p className="mt-4 text-4xl font-bold text-slate-900">{loading ? "..." : stats.totalBookings}</p>
          </div>
          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm uppercase tracking-[0.25em] font-semibold text-slate-500">Unknown roles</p>
            <p className="mt-4 text-4xl font-bold text-slate-900">{loading ? "..." : stats.totalUnknownRoles}</p>
          </div>
        </div>
      </section>
    </div>
  );
}