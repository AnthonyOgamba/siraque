"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import { collection, doc, getDocs, increment, query, updateDoc, where } from "firebase/firestore";
import { auth, db } from "../utils/firebase";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedCart = window.localStorage.getItem("siraque_checkout_cart");
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setCart(parsedCart);
      setCartCount(parsedCart.reduce((count, item) => count + (item.quantity || 1), 0));
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  function saveCart(nextCart) {
    window.localStorage.setItem("siraque_checkout_cart", JSON.stringify(nextCart));
    setCart(nextCart);
    setCartCount(nextCart.reduce((count, item) => count + (item.quantity || 1), 0));
  }

  function saveClickedItem(product) {
    const savedClicks = window.localStorage.getItem("siraque_saved_items");
    const currentSaved = savedClicks ? JSON.parse(savedClicks) : [];
    const nextSaved = [
      {
        id: product.id,
        title: product.title || "Untitled item",
        subtitle: product.subtype || product.type || "Product",
        price: Number(product.price) || 0,
        type: product.type || "product",
        image: product.image || product.photoURL || "",
        clickedAt: new Date().toISOString(),
      },
      ...currentSaved.filter((item) => item.id !== product.id),
    ].slice(0, 20);

    window.localStorage.setItem("siraque_saved_items", JSON.stringify(nextSaved));
  }

  function getUserInitial() {
    if (!user) return "U";
    if (user.photoURL) return "";
    const email = user.email || "";
    return email[0]?.toUpperCase() || "U";
  }

  const filteredProducts = products.filter((product) => {
    if (!searchQuery.trim()) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return [
      product.title,
      product.description,
      product.type,
      product.subtype,
      product.category,
      product.condition,
      product.deliveryMode,
      product.pickupAddress,
    ]
      .filter(Boolean)
      .some((value) => value.toString().toLowerCase().includes(lowerQuery));
  });

  async function handleSelectProduct(product) {
    setSelectedProduct(product);
    saveClickedItem(product);

    if (!user || product.vendorId !== user.uid) {
      return;
    }

    try {
      await updateDoc(doc(db, "listings", product.id), {
        clicks: increment(1),
      });
    } catch {
      // Click tracking is optional and may be restricted by Firestore rules.
    }
  }

  function handleAddToCart(event, product) {
    event.stopPropagation();

    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.id === product.id);
      const nextCart = existingItem
        ? currentCart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: (item.quantity || 1) + 1 }
              : item
          )
        : [
            ...currentCart,
            {
              id: product.id,
              title: product.title || "Untitled item",
              price: Number(product.price) || 0,
              vendorId: product.vendorId || "",
              type: product.type,
              subtype: product.subtype,
              quantity: 1,
            },
          ];

      saveCart(nextCart);
      return nextCart;
    });
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
      <SiteHeader
        activePage="products"
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        showSearch
        searchPlaceholder="Find anything..."
      />

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

        {!loading && !error && filteredProducts.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">
            No products match your search. Try another keyword.
          </div>
        )}

        {!loading && !error && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredProducts.flatMap((product) => {
              const inCart = cart.some((item) => item.id === product.id);
              const card = (
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

                    <button
                      type="button"
                      onClick={(event) => handleAddToCart(event, product)}
                      className="rounded-3xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-700 transition-all"
                    >
                      {inCart ? "Add another" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              );

              if (selectedProduct?.id !== product.id) {
                return [card];
              }

              return [
                card,
                <div key={`${product.id}-details`} className="col-span-full">
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

                      <div className="flex flex-col gap-3 md:flex-row md:items-start">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleAddToCart(event, selectedProduct);
                          }}
                          className="rounded-full bg-orange-600 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-700 transition-all"
                        >
                          Add to Cart
                        </button>
                        <button
                          onClick={() => setSelectedProduct(null)}
                          className="self-start rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-all"
                        >
                          Close details
                        </button>
                      </div>
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
                </div>,
              ];
            })}
          </div>
        )}
      </section>
    </main>
  );
}