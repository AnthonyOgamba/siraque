"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import ListingCard from "../components/ListingCard";
import { collection, doc, getDocs, increment, query, updateDoc, where } from "firebase/firestore";
import { auth, db } from "../utils/firebase";

export default function RentalsPage() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRental, setSelectedRental] = useState(null);
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

  function saveClickedItem(rental) {
    const savedClicks = window.localStorage.getItem("siraque_saved_items");
    const currentSaved = savedClicks ? JSON.parse(savedClicks) : [];
    const nextSaved = [
      {
        id: rental.id,
        title: rental.title || "Untitled item",
        subtitle: rental.subtype || rental.type || "Rental",
        price: Number(rental.price) || 0,
        type: rental.type || "rental",
        image: rental.image || rental.photoURL || "",
        clickedAt: new Date().toISOString(),
      },
      ...currentSaved.filter((item) => item.id !== rental.id),
    ].slice(0, 20);

    window.localStorage.setItem("siraque_saved_items", JSON.stringify(nextSaved));
  }

  function getUserInitial() {
    if (!user) return "U";
    if (user.photoURL) return "";
    const email = user.email || "";
    return email[0]?.toUpperCase() || "U";
  }

  const filteredRentals = rentals.filter((rental) => {
    if (!searchQuery.trim()) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return [
      rental.title,
      rental.description,
      rental.type,
      rental.subtype,
      rental.category,
      rental.deliveryMode,
      rental.pickupAddress,
      rental.location,
      rental.propertyType,
    ]
      .filter(Boolean)
      .some((value) => value.toString().toLowerCase().includes(lowerQuery));
  });

  async function handleSelectRental(rental) {
    setSelectedRental(rental);
    saveClickedItem(rental);

    if (!user || rental.vendorId !== user.uid) {
      return;
    }

    try {
      await updateDoc(doc(db, "listings", rental.id), {
        clicks: increment(1),
      });
    } catch {
      // Click tracking is optional and may be restricted by Firestore rules.
    }
  }

  function handleAddToCart(event, rental) {
    event.stopPropagation();

    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.id === rental.id);
      const nextCart = existingItem
        ? currentCart.map((item) =>
            item.id === rental.id
              ? { ...item, quantity: (item.quantity || 1) + 1 }
              : item
          )
        : [
            ...currentCart,
            {
              id: rental.id,
              title: rental.title || "Untitled item",
              price: Number(rental.price) || 0,
              vendorId: rental.vendorId || "",
              type: rental.type,
              subtype: rental.subtype,
              quantity: 1,
            },
          ];

      saveCart(nextCart);
      return nextCart;
    });
  }

  async function fetchRentals() {
    try {
      setLoading(true);
      setError("");

      const listingsRef = collection(db, "listings");
      const rentalsQuery = query(
        listingsRef,
        where("type", "==", "rental"),
        where("status", "==", "published")
      );

      const snapshot = await getDocs(rentalsQuery);

      const rentalsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setRentals(rentalsData);
    } catch (err) {
      console.error("Fetch rentals error:", err.code, err.message, err);
      setError(`Failed to load rentals: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRentals();
  }, []);

  function getRentalLabel(rental) {
    if (rental.subtype === "equipment") return "Equipment";
    if (rental.subtype === "housing") return "Housing";
    if (rental.subtype === "vehicle") return "Vehicle";
    return "Rental";
  }

  function getRentalSummary(rental) {
    if (rental.subtype === "equipment") {
      return `${rental.quantity || 0} units available`;
    }

    if (rental.subtype === "housing") {
      return `${rental.guests || 0} guests`;
    }

    if (rental.subtype === "vehicle") {
      return `${rental.seats || 0} seats`;
    }

    return "Rental listing";
  }

  function getRentalLocation(rental) {
    if (rental.subtype === "equipment") {
      return rental.deliveryMode === "delivery"
        ? "Delivery Available"
        : `Pickup${rental.pickupAddress ? ` • ${rental.pickupAddress}` : ""}`;
    }

    if (rental.subtype === "housing") {
      return rental.address || "Address not set";
    }

    if (rental.subtype === "vehicle") {
      return rental.pickupAddress || "Pickup address not set";
    }

    return "Location not set";
  }

  function getRentalMeta(rental) {
    if (rental.subtype === "equipment") {
      return rental.category || "Equipment Rental";
    }

    if (rental.subtype === "housing") {
      return rental.propertyType || "Housing Rental";
    }

    if (rental.subtype === "vehicle") {
      return `${rental.make || ""} ${rental.model || ""}`.trim() || "Vehicle Rental";
    }

    return "Rental";
  }

  function getPriceSuffix(rental) {
    if (rental.subtype === "housing") return "/ night";
    return "/ day";
  }

  return (
    <main className="min-h-screen bg-[#f9f9fb] text-slate-900">
      <SiteHeader
        activePage="rentals"
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        showSearch
        searchPlaceholder="Find anything..."
      />

      <section className="max-w-7xl mx-auto px-8 pt-12 pb-10">
        <div className="space-y-3">
          <span className="text-[0.75rem] uppercase tracking-[0.2em] font-bold text-orange-600">
            Explore Rentals
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
            Find equipment, housing, and vehicle rentals
          </h1>
          <p className="text-slate-500 max-w-2xl text-lg">
            Discover rental listings published by trusted vendors on Siraque.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-8 pb-16">
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">
            Loading rentals...
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && filteredRentals.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">
            No rentals match your search. Try another keyword.
          </div>
        )}

        {!loading && !error && filteredRentals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredRentals.flatMap((rental) => {
              const inCart = cart.some((item) => item.id === rental.id);
              const card = (
                <ListingCard
                  key={rental.id}
                  isSelected={selectedRental?.id === rental.id}
                  onSelect={() => handleSelectRental(rental)}
                  eyebrow="Rental"
                  title={rental.title}
                  titleFallback="Untitled Rental"
                  badge="RENT"
                  description={rental.description}
                  primaryLabel="Details"
                  primaryValue={getRentalSummary(rental)}
                  secondaryLabel="Type"
                  secondaryValue={getRentalMeta(rental)}
                  summaryText={
                    rental.subtype === "equipment"
                      ? `${rental.quantity || 0} Units Available`
                      : rental.subtype === "housing"
                      ? `${rental.guests || 0} Guest Capacity`
                      : `${rental.seats || 0} Seat Vehicle`
                  }
                  price={(Number(rental.price) || 0).toFixed(2)}
                  priceSuffix={getPriceSuffix(rental)}
                  buttonText={inCart ? "Add another" : "Add to Cart"}
                  onButtonClick={(event) => handleAddToCart(event, rental)}
                />
              );
              if (selectedRental?.id !== rental.id) {
                return [card];
              }

              return [
                card,
                <div key={`${rental.id}-details`} className="col-span-full">
                  <section className="mt-12 rounded-[2rem] border border-slate-200 bg-white shadow-sm p-8">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <span className="text-orange-600 text-lg">[Rental]</span>
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-orange-600 font-bold">
                              Rental Details
                            </p>
                            <h2 className="text-2xl font-bold text-slate-900">
                              {selectedRental.title || "Selected Rental"}
                            </h2>
                          </div>
                        </div>

                        <p className="text-slate-600 max-w-3xl">
                          {selectedRental.description || "This rental includes the selected details."}
                        </p>
                      </div>

                      <div className="flex flex-col gap-3 md:flex-row md:items-start">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleAddToCart(event, selectedRental);
                          }}
                          className="rounded-full bg-orange-600 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-700 transition-all"
                        >
                          Add to Cart
                        </button>
                        <button
                          onClick={() => setSelectedRental(null)}
                          className="self-start rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-all"
                        >
                          Close details
                        </button>
                      </div>
                    </div>

                    <div className="mt-8 grid gap-4 md:grid-cols-2">
                      <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
                        <p className="text-sm text-slate-500">Rental Type</p>
                        <p className="font-semibold text-slate-900 mt-1">
                          {getRentalLabel(selectedRental)}
                        </p>
                      </div>

                      <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
                        <p className="text-sm text-slate-500">Location / Pickup</p>
                        <p className="font-semibold text-slate-900 mt-1">
                          {getRentalLocation(selectedRental)}
                        </p>
                      </div>

                      {selectedRental.subtype === "equipment" && (
                        <>
                          <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
                            <p className="text-sm text-slate-500">Category</p>
                            <p className="font-semibold text-slate-900 mt-1">
                              {selectedRental.category || "Equipment"}
                            </p>
                          </div>

                          <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
                            <p className="text-sm text-slate-500">Condition</p>
                            <p className="font-semibold text-slate-900 mt-1">
                              {selectedRental.condition || "Good"}
                            </p>
                          </div>

                          <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
                            <p className="text-sm text-slate-500">Quantity Available</p>
                            <p className="font-semibold text-slate-900 mt-1">
                              {selectedRental.quantity || 0} units
                            </p>
                          </div>

                          <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
                            <p className="text-sm text-slate-500">Security Deposit</p>
                            <p className="font-semibold text-slate-900 mt-1">
                              ${(Number(selectedRental.deposit) || 0).toFixed(2)}
                            </p>
                          </div>
                        </>
                      )}

                      {selectedRental.subtype === "housing" && (
                        <>
                          <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
                            <p className="text-sm text-slate-500">Property Type</p>
                            <p className="font-semibold text-slate-900 mt-1">
                              {selectedRental.propertyType || "Housing"}
                            </p>
                          </div>

                          <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
                            <p className="text-sm text-slate-500">Address</p>
                            <p className="font-semibold text-slate-900 mt-1">
                              {selectedRental.address || "Address not set"}
                            </p>
                          </div>

                          <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
                            <p className="text-sm text-slate-500">Bedrooms</p>
                            <p className="font-semibold text-slate-900 mt-1">
                              {selectedRental.bedrooms || 0}
                            </p>
                          </div>

                          <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
                            <p className="text-sm text-slate-500">Bathrooms</p>
                            <p className="font-semibold text-slate-900 mt-1">
                              {selectedRental.bathrooms || 0}
                            </p>
                          </div>

                          <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50 md:col-span-2">
                            <p className="text-sm text-slate-500">Guest Capacity</p>
                            <p className="font-semibold text-slate-900 mt-1">
                              {selectedRental.guests || 0} guests
                            </p>
                          </div>
                        </>
                      )}

                      {selectedRental.subtype === "vehicle" && (
                        <>
                          <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
                            <p className="text-sm text-slate-500">Vehicle</p>
                            <p className="font-semibold text-slate-900 mt-1">
                              {`${selectedRental.make || ""} ${selectedRental.model || ""}`.trim() ||
                                "Vehicle"}
                            </p>
                          </div>

                          <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
                            <p className="text-sm text-slate-500">Year</p>
                            <p className="font-semibold text-slate-900 mt-1">
                              {selectedRental.year || "Not set"}
                            </p>
                          </div>

                          <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
                            <p className="text-sm text-slate-500">Seats</p>
                            <p className="font-semibold text-slate-900 mt-1">
                              {selectedRental.seats || 0}
                            </p>
                          </div>

                          <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
                            <p className="text-sm text-slate-500">Transmission</p>
                            <p className="font-semibold text-slate-900 mt-1">
                              {selectedRental.transmission || "Not set"}
                            </p>
                          </div>

                          <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50 md:col-span-2">
                            <p className="text-sm text-slate-500">Fuel Type</p>
                            <p className="font-semibold text-slate-900 mt-1">
                              {selectedRental.fuelType || "Not set"}
                            </p>
                          </div>
                        </>
                      )}

                      <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50 md:col-span-2">
                        <p className="text-sm text-slate-500">Price</p>
                        <p className="text-2xl font-black text-slate-900 mt-1">
                          ${(Number(selectedRental.price) || 0).toFixed(2)}
                          <span className="text-sm font-medium text-slate-500 ml-2">
                            {getPriceSuffix(selectedRental)}
                          </span>
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
