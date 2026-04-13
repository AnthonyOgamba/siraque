"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../utils/firebase";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const placeholderImage = "https://via.placeholder.com/800x500?text=Siraque+Service";

  function handleSelectService(service) {
    setSelectedService(service);
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
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-screen-2xl mx-auto px-10 h-20 flex justify-between items-center">
          <div className="flex items-center gap-12">
            <Link href="/" className="text-2xl font-bold tracking-tighter text-slate-900">
              Siraque
            </Link>

            <div className="hidden md:flex items-center gap-8 tracking-tight">
              <Link
                href="/products"
                className="text-slate-600 hover:text-orange-600 transition-all duration-300"
              >
                Products
              </Link>
              <Link
                href="/services"
                className="text-orange-600 font-semibold transition-all duration-300"
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
                ✉️
              </button>
              <button className="text-slate-600 hover:text-orange-600 transition-colors duration-300">
                🛒
              </button>
              <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 hover:border-orange-600 transition-all cursor-pointer">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-9_s2IwwI1_LatEY6gZ_zCGjIdR3He8SOafuAsSzClDoNnzwuBeP-GxIXdlkv0g6-C35w3XQfyLxr8kLrZr50NddH0m7jHUWE0aADxNjWZVnzQtDEwsmnWPFwL6G3sUimn0TfD_uzpwfNvhLwvrABb7DDFXh8UHC6jAvw3ytPLRZb7KPXeVGTwXg75-ZYJJ8R9NksFDxgkDMQdOJTJCsWwpENfHELB_dj8_ZnCRBOyIdWeh5ceWUlXvg0NqNiE8uY0LhozV8ZC-Pe"
                  alt="Vendor avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

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

        {!loading && !error && services.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">
            No services have been published yet.
          </div>
        )}

        {!loading && !error && services.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {services.map((service) => {
              const isPackage = service.subtype === "package";
              const imageSrc =
                [service.imageUrl, service.image, service.imageURL].find(
                  (src) => src && src !== "null"
                ) || placeholderImage;

              return (
                <div
                  key={service.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelectService(service)}
                  className={`bg-white rounded-[2rem] overflow-hidden border shadow-sm hover:shadow-xl transition-all duration-300 ${
                    selectedService?.id === service.id
                      ? "border-orange-500 ring-1 ring-orange-200"
                      : "border-slate-200"
                  } cursor-pointer`}
                >
                  <div className="h-48 relative overflow-hidden bg-slate-100">
                    <img
                      src={imageSrc}
                      alt={service.title}
                      onError={(event) => {
                        event.currentTarget.src = placeholderImage;
                      }}
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-bold text-orange-600 shadow-sm uppercase">
                      {isPackage ? "Package" : "Service"}
                    </div>
                  </div>

                  <div className="p-8 space-y-6 flex flex-col">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-4">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 leading-tight">
                          {service.title || "Untitled Service"}
                        </h2>

                        <span className="bg-orange-100 text-orange-600 text-[0.65rem] font-extrabold px-2 py-1 rounded tracking-widest uppercase">
                          PRO
                        </span>
                      </div>

                      <p className="text-sm text-slate-500 line-clamp-3">
                        {service.description || "No description available."}
                      </p>
                    </div>

                    <div className="space-y-3 text-sm text-slate-500">
                      <div className="flex items-center gap-3">
                        <span>⏱️</span>
                        <span>
                          {isPackage
                            ? `${service.totalDuration || 0}m Session`
                            : `${service.duration || 0}m Session`}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span>📍</span>
                        <span>
                          {service.deliveryMode === "studio"
                            ? `In-Studio${service.studioAddress ? ` • ${service.studioAddress}` : ""}`
                            : service.deliveryMode === "mobile"
                            ? "Mobile / On-site"
                            : service.deliveryMode === "digital"
                            ? "Digital / Video"
                            : "Remote Delivery"}
                        </span>
                      </div>

                      {isPackage && (
                        <div className="flex items-center gap-3">
                          <span>📦</span>
                          <span>
                            {Array.isArray(service.services) ? service.services.length : 0} Services Included
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-100">
                      <div>
                        <span className="text-3xl font-black text-slate-900">
                          ${(Number(service.price) || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selectedService && (
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

              <button
                onClick={() => setSelectedService(null)}
                className="self-start rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-all"
              >
                Close details
              </button>
            </div>

            {selectedService.subtype === "package" ? (
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {Array.isArray(selectedService.services) && selectedService.services.length > 0 ? (
                  selectedService.services.map((item, index) => (
                    <div key={index} className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">{item.name}</p>
                          <p className="text-sm text-slate-500">{item.description || "No description"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-900">{item.duration || 0}m</p>
                          <p className="text-sm text-slate-500">${(Number(item.price) || 0).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50 text-sm text-slate-500">
                    No package items are available for this selection.
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-8 rounded-3xl border border-slate-200 p-5 bg-slate-50 text-sm text-slate-500">
                This is a single service. Use the details above to learn more about the offering.
              </div>
            )}
          </section>
        )}
      </section>
    </main>
  );
}
