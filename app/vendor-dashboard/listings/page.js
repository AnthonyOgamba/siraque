"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../../utils/firebase";

export default function VendorListingsPage() {
  const [userId, setUserId] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUserId(user ? user.uid : null);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    async function loadListings() {
      if (!userId) {
        setListings([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const listingsRef = collection(db, "listings");
        const listingsQuery = query(listingsRef, where("vendorId", "==", userId));
        const snapshot = await getDocs(listingsQuery);

        setListings(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
      } catch (err) {
        console.error("Vendor listings load error:", err);
        setError("Unable to load your listings right now.");
      } finally {
        setLoading(false);
      }
    }

    loadListings();
  }, [userId]);

  const services = listings.filter((item) => item.type === "service");
  const products = listings.filter((item) => item.type === "product");
  const rentals = listings.filter((item) => item.type === "rental");

  function getEditLink(item) {
    if (item.type === "product") return "/vendor-dashboard/create-product";
    if (item.type === "service") {
      return item.subtype === "package"
        ? "/vendor-dashboard/create-service-package"
        : "/vendor-dashboard/create-service";
    }
    if (item.type === "rental") {
      if (item.subtype === "equipment") return "/vendor-dashboard/create-rental-equipment";
      if (item.subtype === "housing") return "/vendor-dashboard/create-rental-housing";
      if (item.subtype === "vehicle") return "/vendor-dashboard/create-rental-vehicle";
    }
    return "/vendor-dashboard";
  }

  function getViewLink(item) {
    if (item.type === "product") return "/products";
    if (item.type === "service") return "/services";
    if (item.type === "rental") return "/rentals";
    return "/";
  }

  function getAddLink(type) {
    if (type === "product") return "/vendor-dashboard/create-product";
    if (type === "rental") return "/vendor-dashboard/create-rental-equipment";
    return "/vendor-dashboard/create-service";
  }

  function handleDeleteConfirm(item) {
    setDeleteError("");
    setConfirmDeleteItem(item);
  }

  async function handleDeleteListing(item) {
    setDeleteError("");

    try {
      await deleteDoc(doc(db, "listings", item.id));
      setListings((current) => current.filter((listing) => listing.id !== item.id));
      setConfirmDeleteItem(null);
    } catch (err) {
      console.error("Delete listing error:", err);
      setDeleteError("Unable to delete the listing right now. Please try again.");
    }
  }

  function renderListingCard(item) {
    const subtitle = item.subtype === "package" ? "Package" : item.type === "service" ? "Service" : item.type;

    return (
      <div key={item.id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">
              {subtitle}
            </p>
            <h3 className="text-xl font-semibold text-slate-900">{item.title || "Untitled listing"}</h3>
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            {item.status || "draft"}
          </span>
        </div>

        <p className="text-sm text-slate-500 line-clamp-2 mb-4">
          {item.description || "No description provided."}
        </p>

        <div className="grid grid-cols-2 gap-3 text-sm text-slate-600 mb-6">
          <div>
            <p className="font-semibold text-slate-900">Price</p>
            <p>${(Number(item.price) || 0).toFixed(2)}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-900">Delivery</p>
            <p>{item.deliveryMode || "Remote"}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`${getEditLink(item)}?id=${item.id}`}
            className="rounded-2xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 transition-all"
          >
            Edit
          </Link>
          <Link
            href={getViewLink(item)}
            className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-all"
          >
            View
          </Link>
          <button
            type="button"
            onClick={() => handleDeleteConfirm(item)}
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition-all"
          >
            Delete
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f9f9fb] text-slate-900">
      <section className="sticky top-0 z-40 bg-white/95 border-b border-slate-200 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] font-bold text-orange-600">Vendor Listings</p>
            <h1 className="text-3xl font-bold text-slate-900 mt-2">Manage your listings</h1>
            <p className="mt-2 text-sm text-slate-500">
              {userId ? (
                <>Logged in as vendor <span className="font-semibold text-slate-900">{userId.slice(0, 6)}…</span></>
              ) : (
                <>Sign in to view your saved listings.</>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/vendor-dashboard"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
            >
              Back to Dashboard
            </Link>
            <Link
              href="/vendor-dashboard/create-service"
              className="rounded-2xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-700 transition-all"
            >
              Add New Service
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {loading ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-slate-500 text-center">
            Loading your listings...
          </div>
        ) : error ? (
          <div className="rounded-[2rem] border border-red-200 bg-red-50 p-10 text-red-700 text-center">
            {error}
          </div>
        ) : (
          <>
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400 font-bold">Services</p>
                  <h2 className="text-2xl font-bold text-slate-900 mt-2">{services.length} service{services.length === 1 ? "" : "s"}</h2>
                </div>
                <Link
                  href="/vendor-dashboard/create-service"
                  className="rounded-2xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-700 transition-all"
                >
                  Add service
                </Link>
              </div>

              {services.length === 0 ? (
                <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-slate-500">
                  No services created yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {services.map((item) => renderListingCard(item))}
                </div>
              )}
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400 font-bold">Products</p>
                  <h2 className="text-2xl font-bold text-slate-900 mt-2">{products.length} product{products.length === 1 ? "" : "s"}</h2>
                </div>
                <Link
                  href="/vendor-dashboard/create-product"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-all"
                >
                  Add product
                </Link>
              </div>

              {products.length === 0 ? (
                <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-slate-500">
                  No products created yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {products.map((item) => renderListingCard(item))}
                </div>
              )}
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400 font-bold">Rentals</p>
                  <h2 className="text-2xl font-bold text-slate-900 mt-2">{rentals.length} rental{rentals.length === 1 ? "" : "s"}</h2>
                </div>
                <Link
                  href="/vendor-dashboard/create-rental-equipment"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-all"
                >
                  Add rental
                </Link>
              </div>

              {rentals.length === 0 ? (
                <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-slate-500">
                  No rentals created yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {rentals.map((item) => renderListingCard(item))}
                </div>
              )}
            </div>
          </>
        )}
      </section>

      {confirmDeleteItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6">
          <div className="w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl">
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-orange-600 font-bold">Confirm deletion</p>
                <h2 className="text-2xl font-bold text-slate-900 mt-3">Delete this listing?</h2>
              </div>
              <p className="text-slate-600">
                Are you sure you want to permanently delete <span className="font-semibold text-slate-900">{confirmDeleteItem.title || "this item"}</span>? This action cannot be undone.
              </p>

              {deleteError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {deleteError}
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={() => setConfirmDeleteItem(null)}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
              >
                No, keep it
              </button>
              <button
                type="button"
                onClick={() => handleDeleteListing(confirmDeleteItem)}
                className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 transition-all"
              >
                Yes, delete permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
