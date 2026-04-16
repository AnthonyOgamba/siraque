"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import { collection, doc, getDocs, increment, query, updateDoc, where } from "firebase/firestore";
import { auth, db } from "../utils/firebase";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedService, setSelectedService] = useState(null);
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

  function saveClickedItem(service) {
    const savedClicks = window.localStorage.getItem("siraque_saved_items");
    const currentSaved = savedClicks ? JSON.parse(savedClicks) : [];
    const nextSaved = [
      {
        id: service.id,
        title: service.title || "Untitled item",
        subtitle: service.subtype || service.type || "Service",
        price: Number(service.price) || 0,
        type: service.type || "service",
        image: service.image || service.photoURL || "",
        clickedAt: new Date().toISOString(),
      },
      ...currentSaved.filter((item) => item.id !== service.id),
    ].slice(0, 20);

    window.localStorage.setItem("siraque_saved_items", JSON.stringify(nextSaved));
  }

  function getServiceItemKey(item, index, serviceId) {
    const base = item.id || item.name || item.title || `service-${index}`;
    return `${serviceId || "package"}-${index}-${base}`;
  }

  function initializePackageSelection(service) {
    if (service?.subtype !== "package" || !Array.isArray(service.services)) {
      setSelectedPackageItems([]);
      return;
    }

    const selectedKeys = service.services
      .slice(0, Math.min(2, service.services.length))
      .map((item, index) => getServiceItemKey(item, index, service.id));

    setSelectedPackageItems(selectedKeys);
  }

  function togglePackageItem(itemKey) {
    setSelectedPackageItems((current) =>
      current.includes(itemKey)
        ? current.filter((key) => key !== itemKey)
        : [...current, itemKey]
    );
  }

  function getPackageServiceItems(service) {
    return Array.isArray(service?.services)
      ? service.services.map((item, index) => ({
          ...item,
          key: getServiceItemKey(item, index, service.id),
        }))
      : [];
  }

  function getPackageSelectedTotal(service) {
    return getPackageServiceItems(service)
      .filter((item) => selectedPackageItems.includes(item.key))
      .reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  }

  function getUserInitial() {
    if (!user) return "U";
    if (user.photoURL) return "";
    const email = user.email || "";
    return email[0]?.toUpperCase() || "U";
  }

  const filteredServices = services.filter((service) => {
    if (!searchQuery.trim()) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return [
      service.title,
      service.description,
      service.type,
      service.subtype,
      service.category,
      service.condition,
      service.deliveryMode,
      service.location,
    ]
      .filter(Boolean)
      .some((value) => value.toString().toLowerCase().includes(lowerQuery));
  });

  async function handleSelectService(service) {
    setSelectedService(service);
    saveClickedItem(service);
    initializePackageSelection(service);

    if (!user || service.vendorId !== user.uid) {
      return;
    }

    try {
      await updateDoc(doc(db, "listings", service.id), {
        clicks: increment(1),
      });
    } catch {
      // Click tracking is optional and may be restricted by Firestore rules.
    }
  }

  function handleAddToCart(event, service) {
    event.stopPropagation();

    setCart((currentCart) => {
      if (service.subtype === "package" && Array.isArray(service.services)) {
        const packageItems = getPackageServiceItems(service);
        const selectedItems = packageItems.filter((item) => selectedPackageItems.includes(item.key));
        const selectedCount = selectedItems.length;

        if (selectedCount < 2) {
          return currentCart;
        }

        const totalPrice = selectedItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

        const nextCart = [
          ...currentCart.filter((item) => item.id !== service.id),
          {
            id: service.id,
            title: `${service.title || "Package"} (${selectedCount} services)`,
            price: totalPrice,
            vendorId: service.vendorId || "",
            type: service.type,
            subtype: service.subtype,
            quantity: selectedCount,
            packageItems: selectedItems.map(({ key, ...item }) => item),
            packageTotal: totalPrice,
          },
        ];

        saveCart(nextCart);
        return nextCart;
      }

      const existingItem = currentCart.find((item) => item.id === service.id);
      const nextCart = existingItem
        ? currentCart.map((item) =>
            item.id === service.id
              ? { ...item, quantity: (item.quantity || 1) + 1 }
              : item
          )
        : [
            ...currentCart,
            {
              id: service.id,
              title: service.title || "Untitled item",
              price: Number(service.price) || 0,
              vendorId: service.vendorId || "",
              type: service.type,
              subtype: service.subtype,
              quantity: 1,
            },
          ];

      saveCart(nextCart);
      return nextCart;
    });
  }

  async function fetchServices() {
    console.log("ServicesPage: fetchServices start");
    try {
      setLoading(true);
      setError("");

      const listingsRef = collection(db, "listings");
      const servicesQuery = query(
        listingsRef,
        where("type", "==", "service"),
        where("status", "==", "published")
      );

      console.log("ServicesPage: running query", {
        collection: "listings",
        filters: [
          { field: "type", op: "==", value: "service" },
          { field: "status", op: "==", value: "published" },
        ],
      });

      const snapshot = await getDocs(servicesQuery);
      console.log("ServicesPage: snapshot received", {
        size: snapshot.size,
        docs: snapshot.docs.map((doc) => doc.id),
      });

      const servicesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("SERVICES DATA:", servicesData);

      setServices(servicesData);
    } catch (err) {
      console.error("Fetch services error:", err.code, err.message, err);
      setError(`Failed to load services: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    console.log("ServicesPage: useEffect mount");
    fetchServices();
  }, []);

  return (
    <main className="min-h-screen bg-[#f9f9fb] text-slate-900">
      <SiteHeader
        activePage="services"
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        showSearch
        searchPlaceholder="Find anything..."
      />

      <section className="max-w-7xl mx-auto px-8 pt-12 pb-10">
        <div className="space-y-3">
          <span className="text-[0.75rem] uppercase tracking-[0.2em] font-bold text-orange-600">
            Explore Services
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
            Find professional services and curated packages
          </h1>
          <p className="text-slate-500 max-w-2xl text-lg">
            Discover expert services from trusted vendors on Siraque.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-8 pb-16">
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">
            Loading services...
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && filteredServices.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">
            No services match your search. Try another keyword.
          </div>
        )}

        {!loading && !error && filteredServices.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredServices.flatMap((service) => {
              const isPackage = service.subtype === "package";
              const inCart = cart.some((item) => item.id === service.id);

              const card = (
                <div
                  key={service.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelectService(service)}
                  className={`bg-white rounded-[2rem] border shadow-sm hover:shadow-xl transition-all duration-300 ${
                    selectedService?.id === service.id
                      ? "border-orange-500 ring-1 ring-orange-200"
                      : "border-slate-200"
                  } cursor-pointer h-full`}
                >
                  <div className="p-8 flex h-full flex-col gap-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.25em] font-semibold text-orange-600">
                          {isPackage ? "Package" : "Service"}
                        </p>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                          {service.title || "Untitled Service"}
                        </h2>
                      </div>
                      <span className="rounded-full bg-orange-100 text-orange-600 px-3 py-1 text-[0.65rem] font-bold uppercase">
                        {isPackage ? "PACKAGE" : "PRO"}
                      </span>
                    </div>

                    <p className="min-h-[2.5rem] text-sm text-slate-500 line-clamp-2">
                      {service.description || "No description available."}
                    </p>

                    <div className="space-y-3 text-sm text-slate-500">
                      <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                        <span className="font-semibold text-slate-900">Duration</span>
                        <span>
                          {isPackage
                            ? `${service.totalDuration || 0}m Session`
                            : `${service.duration || 0}m Session`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                        <span className="font-semibold text-slate-900">Delivery</span>
                        <span className="text-right">
                          {service.deliveryMode === "studio"
                            ? `In-Studio${service.studioAddress ? ` • ${service.studioAddress}` : ""}`
                            : service.deliveryMode === "mobile"
                            ? "Mobile / On-site"
                            : service.deliveryMode === "digital"
                            ? "Digital / Video"
                            : "Remote Delivery"}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
                      {isPackage
                        ? `${Array.isArray(service.services) ? service.services.length : 0} Services Included`
                        : "Professional Service"}
                    </div>

                    <div className="mt-auto text-3xl font-black text-slate-900">
                      ${(Number(service.price) || 0).toFixed(2)}
                    </div>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        if (isPackage) {
                          handleSelectService(service);
                        } else {
                          handleAddToCart(event, service);
                        }
                      }}
                      className="rounded-3xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-700 transition-all"
                    >
                      {isPackage ? "Select package items" : inCart ? "Add another" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              );

              if (selectedService?.id !== service.id) {
                return [card];
              }

              return [
                card,
                <div key={`${service.id}-details`} className="col-span-full">
                  <section className="mt-12 rounded-[2rem] border border-slate-200 bg-white shadow-sm p-8">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <span className="text-orange-600 text-lg">📦</span>
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-orange-600 font-bold">
                              {selectedService.subtype === "package" ? "Package Details" : "Service Details"}
                            </p>
                            <h2 className="text-2xl font-bold text-slate-900">
                              {selectedService.title || "Selected Service"}
                            </h2>
                          </div>
                        </div>
                        <p className="text-slate-600 max-w-3xl">
                          {selectedService.description || "This service includes the selected offering details."}
                        </p>
                      </div>

                      <div className="flex flex-col gap-3 md:flex-row md:items-start">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleAddToCart(event, selectedService);
                          }}
                          disabled={
                            selectedService.subtype === "package" && selectedPackageItems.length < 2
                          }
                          className="rounded-full bg-orange-600 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-700 transition-all disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {selectedService.subtype === "package"
                            ? selectedPackageItems.length >= 2
                              ? `Add ${selectedPackageItems.length} services to Cart`
                              : "Select at least 2 services"
                            : "Add to Cart"}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedService(null);
                            setSelectedPackageItems([]);
                          }}
                          className="self-start rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-all"
                        >
                          Close details
                        </button>
                      </div>
                    </div>

                    {selectedService.subtype === "package" ? (
                      <div className="mt-8 space-y-6">
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                          <p className="text-sm text-slate-500">
                            Select at least 2 services from this package. Each service carries its own price.
                          </p>
                          <p className="mt-3 text-sm text-slate-700">
                            Selected: <span className="font-semibold text-slate-900">{selectedPackageItems.length}</span> /{' '}
                            <span className="font-semibold text-slate-900">{Array.isArray(selectedService.services) ? selectedService.services.length : 0}</span>
                          </p>
                          <p className="mt-2 text-sm font-semibold text-orange-600">
                            Total selected price: <span>${getPackageSelectedTotal(selectedService).toFixed(2)}</span>
                          </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          {Array.isArray(selectedService.services) && selectedService.services.length > 0 ? (
                            getPackageServiceItems(selectedService).map((item, index) => {
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
                    ) : (
                      <div className="mt-8 rounded-3xl border border-slate-200 p-5 bg-slate-50 text-sm text-slate-500">
                        This is a single service. Use the details above to learn more about the offering.
                      </div>
                    )}
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
