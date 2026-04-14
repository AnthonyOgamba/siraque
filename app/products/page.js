"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../utils/firebase";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  function handleSelectProduct(product) {
    setSelectedProduct(product);
  }

  async function fetchProducts() {
    try {
      setLoading(true);
      setError("");

      const listingsRef = collection(db, "listings");
      const productsQuery = query(
        listingsRef,
        where("type", "==", "product"),
        where("status", "==", "published")
      );

      const snapshot = await getDocs(productsQuery);

      const productsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setProducts(productsData);
    } catch (err) {
      console.error("Fetch products error:", err.code, err.message, err);
      setError(`Failed to load products: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <main className="min-h-screen bg-[#f9f9fb] text-slate-900">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-screen-2xl mx-auto px-10 h-20 flex justify-between items-center">
          <div className="flex items-center gap-12">
            <Link href="/" className="text-2xl font-bold tracking-tighter text-slate-900">
              Siraque
            </Link>

            <div className="hidden md:flex items-center gap-8 tracking-tight">
              <Link
                href="/products"
                className="text-orange-600 font-semibold transition-all duration-300"
              >
                Products
              </Link>
              <Link
                href="/services"
                className="text-slate-600 hover:text-orange-600 transition-all duration-300"
              >
                Services
              </Link>
              <Link
                href="/rentals"
                className="text-slate-600 hover:text-orange-600 transition-all duration-300"
              >
                Rentals
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
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
              <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 hover:border-orange-600 transition-all cursor-pointer">
                <div className="w-full h-full flex items-center justify-center text-slate-700 font-semibold">
                  U
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-8 pt-12 pb-10">
        <div className="space-y-3">
          <span className="text-[0.75rem] uppercase tracking-[0.2em] font-bold text-orange-600">
            Explore Products
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
            Find products listed by trusted vendors
          </h1>
          <p className="text-slate-500 max-w-2xl text-lg">
            Discover items available for pickup or delivery on Siraque.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-8 pb-16">
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">
            Loading products...
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">
            No products have been published yet.
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {products.map((product) => {
              return (
                <div
                  key={product.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelectProduct(product)}
                  className={`bg-white rounded-[2rem] border shadow-sm hover:shadow-xl transition-all duration-300 ${
                    selectedProduct?.id === product.id
                      ? "border-orange-500 ring-1 ring-orange-200"
                      : "border-slate-200"
                  } cursor-pointer h-full`}
                >
                  <div className="p-8 flex h-full flex-col gap-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.25em] font-semibold text-orange-600">
                          Product
                        </p>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                          {product.title || "Untitled Product"}
                        </h2>
                      </div>
                      <span className="rounded-full bg-orange-100 text-orange-600 px-3 py-1 text-[0.65rem] font-bold uppercase">
                        SALE
                      </span>
                    </div>

                    <p className="text-sm text-slate-500 line-clamp-2">
                      {product.description || "No description available."}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">Stock</span>
                        <span>{product.stock || 0} available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">Delivery</span>
                        <span>
                          {product.deliveryMode === "delivery"
                            ? "Local Delivery"
                            : product.deliveryMode === "pickup"
                            ? `Pickup${product.pickupAddress ? ` • ${product.pickupAddress}` : ""}`
                            : "Pickup"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-semibold text-slate-900">Category</span>
                        <span>{product.category || "General"}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 mt-2">
                        <span className="font-semibold text-slate-900">Condition</span>
                        <span>{product.condition || "New"}</span>
                      </div>
                    </div>

                    <div className="mt-auto text-3xl font-black text-slate-900">
                      ${(Number(product.price) || 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selectedProduct && (
          <section className="mt-12 rounded-[2rem] border border-slate-200 bg-white shadow-sm p-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-orange-600 text-lg">🛍️</span>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-orange-600 font-bold">
                      Product Details
                    </p>
                    <h2 className="text-2xl font-bold text-slate-900">
                      {selectedProduct.title || "Selected Product"}
                    </h2>
                  </div>
                </div>
                <p className="text-slate-600 max-w-3xl">
                  {selectedProduct.description || "This product includes the selected item details."}
                </p>
              </div>

              <button
                onClick={() => setSelectedProduct(null)}
                className="self-start rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-all"
              >
                Close details
              </button>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
                <p className="text-sm text-slate-500">Category</p>
                <p className="font-semibold text-slate-900 mt-1">
                  {selectedProduct.category || "General"}
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
                <p className="text-sm text-slate-500">Condition</p>
                <p className="font-semibold text-slate-900 mt-1">
                  {selectedProduct.condition || "New"}
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
                <p className="text-sm text-slate-500">Stock</p>
                <p className="font-semibold text-slate-900 mt-1">
                  {selectedProduct.stock || 0} available
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
                <p className="text-sm text-slate-500">Fulfillment</p>
                <p className="font-semibold text-slate-900 mt-1">
                  {selectedProduct.deliveryMode === "delivery"
                    ? "Local Delivery"
                    : selectedProduct.deliveryMode === "pickup"
                    ? "Pickup"
                    : "Pickup"}
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50 md:col-span-2">
                <p className="text-sm text-slate-500">Pickup Address</p>
                <p className="font-semibold text-slate-900 mt-1">
                  {selectedProduct.pickupAddress || "No pickup address provided."}
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50 md:col-span-2">
                <p className="text-sm text-slate-500">Price</p>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  ${(Number(selectedProduct.price) || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}