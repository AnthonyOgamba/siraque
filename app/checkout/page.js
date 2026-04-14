"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import { addDoc, collection, doc, increment, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, db } from "../utils/firebase";

export default function CheckoutPage() {
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const savedCart = window.localStorage.getItem("siraque_checkout_cart");
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setCart(parsedCart);
      setCartCount(parsedCart.reduce((count, item) => count + (item.quantity || 1), 0));
    }

    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUserId(user ? user.uid : null);
      setUserEmail(user ? user.email || "" : "");
      setUser(user);
    });

    return unsubscribe;
  }, []);

  function saveCart(nextCart) {
    window.localStorage.setItem("siraque_checkout_cart", JSON.stringify(nextCart));
    setCart(nextCart);
    setCartCount(nextCart.reduce((count, item) => count + (item.quantity || 1), 0));
  }

  function saveOrderHistory(order) {
    const savedOrderHistory = window.localStorage.getItem("siraque_order_history");
    const orderHistory = savedOrderHistory ? JSON.parse(savedOrderHistory) : [];
    const nextHistory = [order, ...orderHistory].slice(0, 20);
    window.localStorage.setItem("siraque_order_history", JSON.stringify(nextHistory));
  }

  function getUserInitial() {
    if (!user) return "U";
    if (user.photoURL) return "";
    const email = user.email || "";
    return email[0]?.toUpperCase() || "U";
  }

  function getCartTotal() {
    return cart.reduce((sum, item) => {
      if (item.packageItems?.length > 0) {
        return sum + (item.packageTotal ?? item.packageItems.reduce((subSum, pkg) => subSum + (Number(pkg.price) || 0), 0));
      }
      return sum + (Number(item.price) || 0) * (item.quantity || 1);
    }, 0);
  }

  async function handleRemoveItem(itemId) {
    const nextCart = cart.filter((item) => item.id !== itemId);
    saveCart(nextCart);
  }

  async function handleCheckout() {
    setError("");
    setMessage("");

    if (cart.length === 0) {
      setError("Your cart is empty. Add items before checking out.");
      return;
    }

    if (!userId) {
      setError("Please sign in before checking out.");
      return;
    }

    setLoading(true);

    try {
      const buyerId = userId;
      const buyerEmail = userEmail || "guest@example.com";

      for (const item of cart) {
        const itemTotal = item.packageItems?.length > 0
          ? item.packageTotal ?? item.packageItems.reduce((sum, pkg) => sum + (Number(pkg.price) || 0), 0)
          : (Number(item.price) || 0) * (item.quantity || 1);
        const unitPrice = item.packageItems?.length > 0
          ? itemTotal / (item.quantity || 1)
          : Number(item.price) || 0;

        await addDoc(collection(db, "bookings"), {
          listingId: item.id,
          vendorId: item.vendorId || "",
          buyerId,
          buyerEmail,
          title: item.title,
          type: item.type,
          subtype: item.subtype,
          quantity: item.quantity || 1,
          unitPrice,
          totalPrice: itemTotal,
          packageItems: item.packageItems || [],
          status: "confirmed",
          createdAt: serverTimestamp(),
        });

        try {
          await updateDoc(doc(db, "listings", item.id), {
            bookings: increment(item.quantity || 1),
          });
        } catch (updateError) {
          console.warn("Unable to update listing booking count:", updateError);
        }
      }

      const newOrder = {
        orderId: `SRQ-${Date.now()}`,
        items: cart,
        totalPrice: getCartTotal(),
        createdAt: new Date().toISOString(),
        orderLabel: `Booking ${new Date().toLocaleDateString()}`,
      };

      saveOrderHistory(newOrder);
      saveCart([]);
      setMessage("Your booking has been confirmed. Thank you for shopping with Siraque.");
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err?.message || "There was a problem processing your checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f9f9fb] text-slate-900">
      <SiteHeader
        activePage=""
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        showSearch
        searchPlaceholder="Find anything..."
      />

      <section className="max-w-7xl mx-auto px-8 py-16">
        <div className="mb-10">
          <span className="text-[0.75rem] uppercase tracking-[0.2em] font-bold text-orange-600">
            Checkout
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">
            Complete your booking and place your order
          </h1>
          <p className="mt-3 text-slate-500 max-w-2xl">
            Review the items in your cart, remove unwanted listings, and finalize your checkout.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-8 xl:grid-cols-[1.8fr_1fr]">
          <div className="space-y-6">
            {cart.length === 0 ? (
              <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-slate-500 text-center">
                Your cart is currently empty. Browse the marketplace to add services, products, or rentals.
                <div className="mt-4">
                  <Link href="/services" className="text-orange-600 font-semibold hover:text-orange-700">
                    Explore services →
                  </Link>
                </div>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-slate-900">{item.title}</h2>
                      <p className="mt-2 text-sm text-slate-500">{item.type || "Listing"} • {item.subtype || "Item"}</p>
                      {item.packageItems?.length > 0 && (
                        <div className="mt-3 text-sm text-slate-500">
                          <p className="font-semibold text-slate-900">Selected services:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {item.packageItems.map((pkg, index) => (
                              <li key={`${item.id}-pkg-${index}`}>{pkg.name || pkg.title || pkg.description || `Service ${index + 1}`}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 text-center">
                      <p className="text-lg font-semibold text-slate-900">
                        ${
                          item.packageItems?.length > 0
                            ? (item.packageTotal ?? item.packageItems.reduce((sum, pkg) => sum + (Number(pkg.price) || 0), 0)).toFixed(2)
                            : ((Number(item.price) || 0) * (item.quantity || 1)).toFixed(2)
                        }
                        {item.packageItems?.length > 0 ? ` • ${item.quantity || 1} services` : ` x ${item.quantity || 1}`}
                      </p>
                    </div>

                    <div className="flex items-center justify-end sm:flex-1">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-all"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400 font-semibold">Order summary</p>
              <div className="mt-6 space-y-4">
                {cart.map((item) => {
                  const itemTotal = item.packageItems?.length > 0
                    ? item.packageTotal ?? item.packageItems.reduce((sum, pkg) => sum + (Number(pkg.price) || 0), 0)
                    : (Number(item.price) || 0) * (item.quantity || 1);
                  return (
                    <div key={item.id} className="flex items-center justify-between gap-4 text-sm text-slate-500">
                      <span>{item.title}</span>
                      <span>${itemTotal.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 border-t border-slate-200 pt-6 text-slate-900">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>Total</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <button
                type="button"
                onClick={handleCheckout}
                disabled={loading || cart.length === 0}
                className="w-full rounded-3xl bg-orange-600 px-6 py-4 text-sm font-semibold text-white hover:bg-orange-700 transition-all disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Processing…" : "Place booking"}
              </button>
              <p className="mt-4 text-sm text-slate-500">
                Bookings are stored immediately and vendors are notified through the platform.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
