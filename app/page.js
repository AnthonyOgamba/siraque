"use client";

import Link from "next/link";
import SiteHeader from "./components/SiteHeader";
import { useEffect, useState } from "react";
import { collection, doc, getDocs, increment, query, updateDoc, where } from "firebase/firestore";
import { auth, db } from "./utils/firebase";

export default function HomePage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedListing, setSelectedListing] = useState(null);
  const [selectedPackageItems, setSelectedPackageItems] = useState([]);
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

  function saveClickedItem(listing) {
    const savedClicks = window.localStorage.getItem("siraque_saved_items");
    const currentSaved = savedClicks ? JSON.parse(savedClicks) : [];
    const nextSaved = [
      {
        id: listing.id,
        title: listing.title || "Untitled item",
        subtitle: listing.subtype || listing.type || "Listing",
        price: Number(listing.price) || 0,
        type: listing.type || "item",
        image: listing.image || listing.photoURL || "",
        clickedAt: new Date().toISOString(),
      },
      ...currentSaved.filter((item) => item.id !== listing.id),
    ].slice(0, 20);

    window.localStorage.setItem("siraque_saved_items", JSON.stringify(nextSaved));
  }

  function getListingItemKey(item, index, listingId) {
    return item.id || item.name || item.title || `${listingId || "package"}-service-${index}`;
  }

  function initializePackageSelection(listing) {
    if (listing?.subtype !== "package" || !Array.isArray(listing.services)) {
      setSelectedPackageItems([]);
      return;
    }

    const selectedKeys = listing.services
      .slice(0, Math.min(2, listing.services.length))
      .map((item, index) => getListingItemKey(item, index, listing.id));

    setSelectedPackageItems(selectedKeys);
  }

  function togglePackageItem(itemKey) {
    setSelectedPackageItems((current) =>
      current.includes(itemKey)
        ? current.filter((key) => key !== itemKey)
        : [...current, itemKey]
    );
  }

  function getPackageListingItems(listing) {
    return Array.isArray(listing?.services)
      ? listing.services.map((item, index) => ({
          ...item,
          key: getListingItemKey(item, index, listing.id),
        }))
      : [];
  }

  function getPackageSelectedTotal(listing) {
    return getPackageListingItems(listing)
      .filter((item) => selectedPackageItems.includes(item.key))
      .reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  }

  async function handleSelectListing(listing) {
    setSelectedListing(listing);
    saveClickedItem(listing);
    initializePackageSelection(listing);

    if (!user) {
      return;
    }

    try {
      await updateDoc(doc(db, "listings", listing.id), {
        clicks: increment(1),
      });
    } catch (err) {
      console.error("Listing click tracking failed:", err);
    }
  }

  function handleAddToCart(event, listing) {
    event.stopPropagation();

    setCart((currentCart) => {
      if (listing.subtype === "package" && Array.isArray(listing.services)) {
        const packageItems = getPackageListingItems(listing);
        const selectedItems = packageItems.filter((item) => selectedPackageItems.includes(item.key));
        const selectedCount = selectedItems.length;

        if (selectedCount < 2) {
          return currentCart;
        }

        const totalPrice = selectedItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

        const nextCart = [
          ...currentCart.filter((item) => item.id !== listing.id),
          {
            id: listing.id,
            title: `${listing.title || "Package"} (${selectedCount} services)`,
            price: totalPrice,
            vendorId: listing.vendorId || "",
            type: listing.type,
            subtype: listing.subtype,
            quantity: selectedCount,
            packageItems: selectedItems.map(({ key, ...item }) => item),
            packageTotal: totalPrice,
          },
        ];

        saveCart(nextCart);
        return nextCart;
      }

      const existingItem = currentCart.find((item) => item.id === listing.id);
      const nextCart = existingItem
        ? currentCart.map((item) =>
            item.id === listing.id
              ? { ...item, quantity: (item.quantity || 1) + 1 }
              : item
          )
        : [
            ...currentCart,
            {
              id: listing.id,
              title: listing.title || "Untitled item",
              price: Number(listing.price) || 0,
              vendorId: listing.vendorId || "",
              type: listing.type,
              subtype: listing.subtype,
              quantity: 1,
            },
          ];

      saveCart(nextCart);
      return nextCart;
    });
  }

  function getUserInitial() {
    if (!user) return "U";
    if (user.photoURL) return "";
    const email = user.email || "";
    return email[0]?.toUpperCase() || "U";
  }

  const filteredListings = listings.filter((listing) => {
    if (!searchQuery.trim()) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return [
      listing.title,
      listing.description,
      listing.type,
      listing.subtype,
      listing.category,
      listing.condition,
      listing.deliveryMode,
    ]
      .filter(Boolean)
      .some((value) => value.toString().toLowerCase().includes(lowerQuery));
  });

  function getListingTag(listing) {
    if (listing.type === "product") return "Product";
    if (listing.type === "rental") return "Rental";
    if (listing.subtype === "package") return "Package";
    return "Service";
  }

  function getDetailLabel(listing) {
    if (listing.type === "product") return `${listing.stock || 0} in stock`;
    if (listing.type === "rental") return listing.deliveryMode || "Pickup";
    if (listing.subtype === "package") return `${listing.totalDuration || 0}m total`;
    return `${listing.duration || 0}m session`;
  }

  function getSecondaryLabel(listing) {
    if (listing.type === "product") return listing.deliveryMode || "Remote";
    if (listing.type === "rental") return listing.subtype || "Rental";
    return listing.subtype === "package" ? "Package" : "Service";
  }

  function getDeliveryText(listing) {
    if (listing.type === "product") return listing.deliveryMode || "Remote";
    if (listing.type === "rental") return listing.location || listing.pickupLocation || "Pickup location";
    return listing.deliveryMode || "Remote";
  }

  useEffect(() => {
    async function fetchServices() {
      setLoading(true);
      setError("");

      try {
        const listingsRef = collection(db, "listings");
        const listingsQuery = query(
          listingsRef,
          where("status", "==", "published")
        );

        const snapshot = await getDocs(listingsQuery);
        const listingsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setListings(listingsData);
      } catch (err) {
        console.error("HomePage fetch services error:", err);
        setError("Unable to load published services at the moment.");
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, []);

  return (
    <main className="bg-[#f9f9fb] text-[#2d3338] min-h-screen">
      <SiteHeader
        activePage=""
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        showSearch
        searchPlaceholder="Search products, services, rentals..."
      />

      <section className="relative min-h-screen flex items-center overflow-hidden pt-20 bg-[#f9f9fb]">
        <div className="max-w-screen-2xl mx-auto px-10 w-full grid grid-cols-12 gap-10 z-10">
          <div className="col-span-12 lg:col-span-7 flex flex-col justify-center">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-orange-600 mb-6">
              Discover the Extraordinary
            </span>

            <h1 className="text-[3.5rem] font-bold leading-tight tracking-[-0.04em] text-slate-900 mb-8">
              The Hub for Everything <br />
              You <span className="text-orange-600 italic">Need.</span>
            </h1>

            <p className="text-lg text-slate-600 max-w-lg mb-12 leading-relaxed">
              Curating the world&apos;s finest products, elite professional services,
              and premium rentals into one seamless destination.
            </p>

            <div className="bg-white p-2 rounded-[1.5rem] shadow-[0_12px_40px_rgba(230,81,0,0.05)] border border-slate-200 flex items-center max-w-2xl">
              <div className="flex-1 flex items-center px-6">
                <span className="text-orange-600 mr-3"></span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, services, or rentals..."
                  className="w-full border-none outline-none text-slate-900 text-lg py-3 bg-transparent"
                />
              </div>

              <button
                type="button"
                onClick={() => {}}
                className="bg-orange-600 text-white px-8 py-4 rounded-[1rem] font-semibold hover:bg-orange-700 transition-all duration-300"
              >
                Explore marketplace
              </button>
            </div>
          </div>

          <div className="hidden lg:block col-span-5 relative">
            <div className="absolute inset-0 bg-orange-600/5 rounded-[2rem] -rotate-3 scale-105"></div>

            <div className="relative h-full w-full rounded-[2rem] overflow-hidden shadow-2xl">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-oqnnUPs6IWdLHthrEqUbjUGd2409L0AlWZgYF-6mtOYr7CrgInNmTTqseSB02gCIs8-nGXr9IND5IF3_2cxHBJsxPfx2qTXdqNFDHz0zXA4oPnuAa-VmRYeOk3fBhoJ5cBbZHjVAIzNgUYsmvJKQIiUFydl4POm8N8NSD_zuDVHF2bqNDdFD3azSbJnwq6vW55ndmkmQ9xqjObU9FKXrmNqh5noLzvWz9TAgCZNrmphK9MNCOs2EwW8dJSssBaZeVO4BycPp7HcV"
                alt="Featured product"
                className="h-full w-full object-cover"
              />

              <div className="absolute bottom-8 left-8 right-8 bg-white/80 backdrop-blur-md p-6 rounded-xl border border-white/20">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-orange-600 mb-1">
                      Featured Product
                    </p>
                    <p className="text-lg font-semibold text-slate-900">
                      Chronos Elite Series
                    </p>
                  </div>
                  <span className="text-orange-600 text-xl">→</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

       <section className="py-20 bg-[#f9f9fb]">
        <div className="max-w-screen-2xl mx-auto px-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-4">
            <div>
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-orange-600 mb-4 block">
                Live Listings
              </span>
              <h2 className="text-[2.5rem] font-bold tracking-tight text-slate-900">
                Published products, services, and rentals
              </h2>
            </div>

            <a
              href="/services"
              className="text-orange-600 font-semibold flex items-center gap-2 hover:gap-4 transition-all duration-300"
            >
              View marketplace <span>→</span>
            </a>
          </div>

          {loading && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">
              Loading listings...
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && filteredListings.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">
              No listings match your search. Try another keyword or category.
            </div>
          )}

          {!loading && !error && filteredListings.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredListings.flatMap((listing) => {
                  const inCart = cart.some((item) => item.id === listing.id);

                  const card = (
                    <div
                      key={listing.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelectListing(listing)}
                      className={`bg-white rounded-[2rem] border shadow-sm hover:shadow-xl transition-all duration-300 ${
                        selectedListing?.id === listing.id
                          ? "border-orange-500 ring-1 ring-orange-200"
                          : "border-slate-200"
                      } cursor-pointer h-full`}
                    >
                      <div className="p-8 flex h-full flex-col gap-5">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-xs uppercase tracking-[0.25em] font-semibold text-orange-600">
                              {getListingTag(listing)}
                            </p>
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                              {listing.title || "Untitled Listing"}
                            </h2>
                          </div>
                          <span className="rounded-full bg-orange-100 text-orange-600 px-3 py-1 text-[0.65rem] font-bold uppercase">
                            LIVE
                          </span>
                        </div>

                        <p className="text-sm text-slate-500 line-clamp-2">
                          {listing.description || "No description available."}
                        </p>

                        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-500">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900">Details</span>
                            <span>{getDetailLabel(listing)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900">Type</span>
                            <span>{getSecondaryLabel(listing)}</span>
                          </div>
                        </div>

                        <div className="mt-auto text-3xl font-black text-slate-900">
                          ${(Number(listing.price) || 0).toFixed(2)}
                        </div>

                        <button
                          type="button"
                          onClick={(event) => handleAddToCart(event, listing)}
                          className="rounded-3xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-700 transition-all"
                        >
                          {inCart ? "Add another" : "Add to Cart"}
                        </button>
                      </div>
                    </div>
                  );

                  if (selectedListing?.id !== listing.id) {
                    return [card];
                  }

                  return [
                    card,
                    <div key={`${listing.id}-details`} className="col-span-full">
                      <section className="mt-12 rounded-[2rem] border border-slate-200 bg-white shadow-sm p-8">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <span className="text-orange-600 text-lg">📦</span>
                              <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-orange-600 font-bold">
                                  {getListingTag(selectedListing)} Details
                                </p>
                                <h2 className="text-2xl font-bold text-slate-900">
                                  {selectedListing.title || "Selected Listing"}
                                </h2>
                              </div>
                            </div>

                            <p className="text-slate-600 max-w-3xl">
                              {selectedListing.description || "This listing includes the selected details."}
                            </p>
                          </div>

                          <div className="flex flex-col gap-3 md:flex-row md:items-start">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleAddToCart(event, selectedListing);
                              }}
                              disabled={
                                selectedListing.subtype === "package" && selectedPackageItems.length < 2
                              }
                              className="rounded-full bg-orange-600 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-700 transition-all disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {selectedListing.subtype === "package"
                                ? selectedPackageItems.length >= 2
                                  ? `Add ${selectedPackageItems.length} services to Cart`
                                  : "Select at least 2 services"
                                : "Add to Cart"}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedListing(null);
                                setSelectedPackageItems([]);
                              }}
                              className="self-start rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-all"
                            >
                              Close details
                            </button>
                          </div>
                        </div>

                        {selectedListing.type === "service" &&
                        selectedListing.subtype === "package" ? (
                          <div className="mt-8 space-y-6">
                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                              <p className="text-sm text-slate-500">
                                Select at least 2 services from this package. Only selected services will be added to cart.
                              </p>
                              <p className="mt-3 text-sm text-slate-700">
                                Selected: <span className="font-semibold text-slate-900">{selectedPackageItems.length}</span> /{' '}
                                <span className="font-semibold text-slate-900">{Array.isArray(selectedListing.services) ? selectedListing.services.length : 0}</span>
                              </p>
                              <p className="mt-2 text-sm font-semibold text-orange-600">
                                Total selected price: <span>${getPackageSelectedTotal(selectedListing).toFixed(2)}</span>
                              </p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              {Array.isArray(selectedListing.services) && selectedListing.services.length > 0 ? (
                                getPackageListingItems(selectedListing).map((item, index) => {
                                  const selected = selectedPackageItems.includes(item.key);
                                  return (
                                    <button
                                      key={item.key}
                                      type="button"
                                      onClick={() => togglePackageItem(item.key)}
                                      className={`rounded-3xl border p-5 text-left transition-all ${
                                        selected
                                          ? 'border-orange-500 bg-orange-50'
                                          : 'border-slate-200 bg-slate-50'
                                      }`}
                                    >
                                      <div className="flex items-start justify-between gap-4">
                                        <div>
                                          <p className="font-semibold text-slate-900">{item.name || item.title || `Service ${index + 1}`}</p>
                                          <p className="text-sm text-slate-500 mt-1">{item.description || 'No description'}</p>
                                        </div>
                                        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold ${
                                          selected
                                            ? 'border-orange-600 bg-orange-600 text-white'
                                            : 'border-slate-300 text-slate-400'
                                        }`}>
                                          {selected ? '✓' : index + 1}
                                        </span>
                                      </div>

                                      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                                        <span>{item.duration || 0}m</span>
                                        <span>${(Number(item.price) || 0).toFixed(2)}</span>
                                      </div>
                                    </button>
                                  );
                                })
                              ) : (
                                <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50 text-sm text-slate-500">
                                  No package items are available for this selection.
                                </div>
                              )}
                            </div>
                          </div>
                        ) : selectedListing.type === "product" ? (
                          <div className="mt-8 grid gap-4 md:grid-cols-2">
                            <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
                              <p className="text-sm text-slate-500">Category</p>
                              <p className="font-semibold text-slate-900 mt-1">
                                {selectedListing.category || "General"}
                              </p>
                            </div>

                            <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
                              <p className="text-sm text-slate-500">Condition</p>
                              <p className="font-semibold text-slate-900 mt-1">
                                {selectedListing.condition || "New"}
                              </p>
                            </div>

                            <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
                              <p className="text-sm text-slate-500">Stock</p>
                              <p className="font-semibold text-slate-900 mt-1">
                                {selectedListing.stock || 0} available
                              </p>
                            </div>

                            <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
                              <p className="text-sm text-slate-500">Delivery</p>
                              <p className="font-semibold text-slate-900 mt-1">
                                {getDeliveryText(selectedListing)}
                              </p>
                            </div>
                          </div>
                        ) : selectedListing.type === "rental" ? (
                          <div className="mt-8 grid gap-4 md:grid-cols-2">
                            <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
                              <p className="text-sm text-slate-500">Rental Category</p>
                              <p className="font-semibold text-slate-900 mt-1">
                                {selectedListing.subtype === "equipment"
                                  ? "Equipment"
                                  : selectedListing.subtype === "housing"
                                  ? "Housing"
                                  : selectedListing.subtype === "vehicle"
                                  ? "Vehicle"
                                  : "Rental"}
                              </p>
                            </div>

                            <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
                              <p className="text-sm text-slate-500">Pickup / Location</p>
                              <p className="font-semibold text-slate-900 mt-1">
                                {getDeliveryText(selectedListing)}
                              </p>
                            </div>

                            {selectedListing.subtype === "equipment" && (
                              <>
                                <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
                                  <p className="text-sm text-slate-500">Condition</p>
                                  <p className="font-semibold text-slate-900 mt-1">
                                    {selectedListing.condition || "Good"}
                                  </p>
                                </div>
                                <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
                                  <p className="text-sm text-slate-500">Quantity</p>
                                  <p className="font-semibold text-slate-900 mt-1">
                                    {selectedListing.quantity || 0} units
                                  </p>
                                </div>
                              </>
                            )}

                            {selectedListing.subtype === "housing" && (
                              <>
                                <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
                                  <p className="text-sm text-slate-500">Property Type</p>
                                  <p className="font-semibold text-slate-900 mt-1">
                                    {selectedListing.propertyType || "Housing"}
                                  </p>
                                </div>
                                <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
                                  <p className="text-sm text-slate-500">Guest Capacity</p>
                                  <p className="font-semibold text-slate-900 mt-1">
                                    {selectedListing.guests || 0} guests
                                  </p>
                                </div>
                              </>
                            )}

                            {selectedListing.subtype === "vehicle" && (
                              <>
                                <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
                                  <p className="text-sm text-slate-500">Vehicle</p>
                                  <p className="font-semibold text-slate-900 mt-1">
                                    {`${selectedListing.make || ""} ${selectedListing.model || ""}`.trim() || "Vehicle"}
                                  </p>
                                </div>
                                <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
                                  <p className="text-sm text-slate-500">Seats</p>
                                  <p className="font-semibold text-slate-900 mt-1">
                                    {selectedListing.seats || 0} seats
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="mt-8 rounded-3xl border border-slate-200 p-5 bg-slate-50 text-sm text-slate-500">
                            This is a single service. Use the details above to learn more about the offering.
                          </div>
                        )}
                      </section>
                    </div>
                  ];
                })}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-screen-2xl mx-auto px-10">
          <div className="bg-orange-100 rounded-[3rem] p-16 md:p-24 overflow-hidden relative">
            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <h2 className="text-[3rem] font-bold tracking-tight text-[#5D1A06] mb-6 leading-tight">
                Elevate Your Everyday.
              </h2>
              <p className="text-[#5D1A06]/80 text-lg mb-12">
                Join our exclusive community to receive early access to new product
                drops, elite professional connections, and luxury rental listings.
              </p>

              <form className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 bg-white border-none px-6 py-4 rounded-2xl outline-none text-slate-900"
                />
                <button className="bg-orange-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-orange-700 transition-all">
                  Join Siraque
                </button>
              </form>

              <p className="mt-6 text-sm text-[#5D1A06]/60">
                No spam. Only the finest curation once a week.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="w-full pt-20 pb-10 bg-slate-50">
        <div className="max-w-screen-2xl mx-auto px-10 grid grid-cols-4 gap-10">
          <div className="col-span-4 lg:col-span-1">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Siraque</h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              A premium unified discovery hub curating the best in physical goods,
              professional talent, and high-end rentals.
            </p>
            <div className="flex gap-4 text-slate-400">
              <span className="hover:text-orange-600 cursor-pointer">🌐</span>
              <span className="hover:text-orange-600 cursor-pointer">🔗</span>
              <span className="hover:text-orange-600 cursor-pointer">✉️</span>
            </div>
          </div>

          <div className="col-span-2 lg:col-span-1">
            <h4 className="font-bold text-slate-900 mb-6">Company</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-sm text-slate-500 hover:text-orange-600">About Us</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-orange-600">Careers</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-orange-600">Trust & Safety</a></li>
            </ul>
          </div>

          <div className="col-span-2 lg:col-span-1">
            <h4 className="font-bold text-slate-900 mb-6">Support</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-sm text-slate-500 hover:text-orange-600">Help Center</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-orange-600">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-orange-600">Terms of Service</a></li>
            </ul>
          </div>

          <div className="col-span-4 lg:col-span-1">
            <h4 className="font-bold text-slate-900 mb-6">Language</h4>
            <div className="bg-white border border-slate-200 px-4 py-2 rounded-lg flex justify-between items-center cursor-pointer hover:border-orange-600 transition-colors">
              <span className="text-sm text-slate-600">English (US)</span>
              <span className="text-slate-400 text-sm">⌄</span>
            </div>
          </div>
        </div>

        <div className="max-w-screen-2xl mx-auto px-10 mt-20 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">© 2024 Siraque. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="text-xs text-slate-400 hover:text-orange-600">Instagram</a>
            <a href="#" className="text-xs text-slate-400 hover:text-orange-600">LinkedIn</a>
            <a href="#" className="text-xs text-slate-400 hover:text-orange-600">Twitter</a>
          </div>
        </div>
      </footer>
    </main>
  );
}