"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, db } from "../../utils/firebase";

export default function CreateRentalEquipmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingId = searchParams?.get("id");
  const isEditMode = Boolean(listingId);

  const activeTab = "equipment";
  const pageLabel = "Create Offering";
  const pageTitle = "Add Equipment Rental";
  const pageDescription =
    "Define the details, pricing, availability, and pickup terms for your equipment rental.";
  const publishButtonText = "Publish Equipment Rental";

  const [fulfillmentMode, setFulfillmentMode] = useState("pickup");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dailyRate: "",
    weeklyRate: "",
    quantity: "",
    category: "",
    condition: "Good",
    deposit: "",
    pickupAddress: "882 West Editorial Lane, Suite 400, Chicago IL",
    availabilityNotes: "",
  });

  const [isPublishing, setIsPublishing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch("/api/categories?type=rental");
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (err) {
        console.error("Unable to load rental categories:", err);
      }
    }

    loadCategories();
  }, []);

  useEffect(() => {
    if (!listingId) return;

    async function loadListing() {
      try {
        const listingDoc = await getDoc(doc(db, "listings", listingId));
        if (!listingDoc.exists()) {
          setError("Listing not found for editing.");
          return;
        }

        const data = listingDoc.data();
        if (data.type !== "rental" || data.subtype !== "equipment") {
          setError("This listing cannot be edited here.");
          return;
        }

        setFulfillmentMode(data.deliveryMode || "pickup");
        setFormData({
          title: data.title || "",
          description: data.description || "",
          dailyRate: data.dailyRate?.toString() || "",
          weeklyRate: data.weeklyRate?.toString() || "",
          quantity: data.quantity?.toString() || "",
          category: data.category || "",
          condition: data.condition || "Good",
          deposit: data.deposit?.toString() || "",
          pickupAddress: data.pickupAddress || "882 West Editorial Lane, Suite 400, Chicago IL",
          availabilityNotes: data.availabilityNotes || "",
        });
      } catch (err) {
        console.error("Load equipment rental for edit error:", err);
        setError("Unable to load the rental for editing.");
      }
    }

    loadListing();
  }, [listingId]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function getFulfillmentLabel() {
    if (fulfillmentMode === "pickup") {
      return `Pickup • ${formData.pickupAddress || "Pickup address not set"}`;
    }
    return "Delivery Available";
  }

  async function handlePublish() {
    setError("");
    setMessage("");

    const user = auth.currentUser;
    if (!user) {
      setError("You must be logged in to publish an equipment rental.");
      return;
    }

    if (!formData.title.trim()) {
      setError("Please enter an equipment name.");
      return;
    }

    if (!formData.description.trim()) {
      setError("Please enter a description.");
      return;
    }

    if (!formData.dailyRate || Number(formData.dailyRate) <= 0) {
      setError("Please enter a valid daily rate.");
      return;
    }

    if (!formData.quantity || Number(formData.quantity) <= 0) {
      setError("Please enter a valid quantity.");
      return;
    }

    if (fulfillmentMode === "pickup" && !formData.pickupAddress.trim()) {
      setError("Please enter a pickup address.");
      return;
    }

    try {
      setIsPublishing(true);

      const listingData = {
        type: "rental",
        subtype: "equipment",
        vendorId: user.uid,
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: Number(formData.dailyRate),
        dailyRate: Number(formData.dailyRate),
        weeklyRate: Number(formData.weeklyRate || 0),
        quantity: Number(formData.quantity),
        category: formData.category.trim(),
        condition: formData.condition,
        deposit: Number(formData.deposit || 0),
        deliveryMode: fulfillmentMode,
        pickupAddress: formData.pickupAddress.trim(),
        availabilityNotes: formData.availabilityNotes.trim(),
        status: "published",
        ...(isEditMode ? { updatedAt: serverTimestamp() } : { createdAt: serverTimestamp() }),
      };

      if (isEditMode && listingId) {
        await updateDoc(doc(db, "listings", listingId), listingData);
        setMessage("Equipment rental updated successfully.");
      } else {
        await addDoc(collection(db, "listings"), listingData);
        setMessage("Equipment rental published successfully.");
      }
      setFormData({
        title: "",
        description: "",
        dailyRate: "",
        weeklyRate: "",
        quantity: "",
        category: "",
        condition: "Good",
        deposit: "",
        pickupAddress: "882 West Editorial Lane, Suite 400, Chicago IL",
        availabilityNotes: "",
      });
      setFulfillmentMode("pickup");
    } catch (err) {
      console.error("Publish equipment rental error:", err);
      setError("Failed to publish equipment rental.");
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-[#2d3338]">
      <div className="pt-24 px-6 pb-20 max-w-7xl mx-auto">
        <div className="space-y-10 mb-12">
          <header className="flex justify-between items-end min-h-[110px]">
            <div className="space-y-2">
              <span className="text-[0.75rem] font-semibold tracking-wider text-orange-600 uppercase">
                {pageLabel}
              </span>
              <h1 className="text-[2rem] font-semibold tracking-tight text-slate-900 leading-tight">
                {pageTitle}
              </h1>
              <p className="text-slate-500 max-w-xl min-h-[56px]">{pageDescription}</p>
            </div>

            <div className="flex gap-3 shrink-0">
              <button className="w-[160px] h-[52px] rounded-xl font-medium text-slate-700 bg-slate-200 hover:bg-slate-300 transition-all duration-300">
                Save Draft
              </button>
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="w-[240px] h-[52px] rounded-xl font-medium text-white bg-orange-600 shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-60"
              >
                {isPublishing ? "Publishing..." : publishButtonText}
              </button>
            </div>
          </header>

          <section>
            <div className="inline-flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => router.push("/vendor-dashboard/create-rental-equipment")}
                className={`w-[180px] h-[52px] rounded-xl text-sm transition-colors ${
                  activeTab === "equipment"
                    ? "font-semibold text-white bg-orange-600 shadow-sm"
                    : "font-medium text-slate-500 hover:text-slate-900"
                }`}
              >
                Equipment
              </button>

              <button
                type="button"
                onClick={() => router.push("/vendor-dashboard/create-rental-housing")}
                className="w-[180px] h-[52px] rounded-xl text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                Housing
              </button>

              <button
                type="button"
                onClick={() => router.push("/vendor-dashboard/create-rental-vehicle")}
                className="w-[180px] h-[52px] rounded-xl text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                Vehicle
              </button>
            </div>
          </section>
        </div>

        {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {message && <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>}

        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-8 space-y-12">
            <section className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-orange-600 rounded-full"></div>
                <h3 className="text-xl font-semibold tracking-tight">Rental Details</h3>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="text-[0.75rem] font-semibold text-slate-500 mb-2 block uppercase tracking-wide">Equipment Name</label>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full bg-transparent border-b-2 border-slate-300 focus:border-orange-600 focus:ring-0 transition-all py-3 text-lg placeholder:text-slate-400 outline-none"
                    placeholder="e.g. Professional Camera Kit"
                    type="text"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[0.75rem] font-semibold text-slate-500 mb-2 block uppercase tracking-wide">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    className="w-full bg-white rounded-xl p-4 border border-slate-200 focus:border-orange-600 focus:ring-1 focus:ring-orange-200 transition-all outline-none resize-none"
                    placeholder="Describe the equipment, its use case, condition, and rental terms..."
                  ></textarea>
                </div>

                <div>
                  <label className="text-[0.75rem] font-semibold text-slate-500 mb-2 block uppercase tracking-wide">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-white rounded-xl p-4 border border-slate-200 focus:border-orange-600 outline-none"
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[0.75rem] font-semibold text-slate-500 mb-2 block uppercase tracking-wide">Condition</label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="w-full bg-white rounded-xl p-4 border border-slate-200 focus:border-orange-600 outline-none"
                  >
                    <option>Excellent</option>
                    <option>Good</option>
                    <option>Fair</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-orange-600 rounded-full"></div>
                <h3 className="text-xl font-semibold tracking-tight">Pricing & Availability</h3>
              </div>

              <div className="grid grid-cols-2 gap-8 p-8 bg-orange-50 rounded-3xl">
                <div className="space-y-4">
                  <label className="text-[0.75rem] font-bold text-orange-600 uppercase tracking-wider">Daily Rate</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-orange-600">$</span>
                    <input
                      name="dailyRate"
                      value={formData.dailyRate}
                      onChange={handleChange}
                      className="w-full bg-white rounded-2xl py-5 pl-10 pr-6 text-2xl font-bold text-slate-900 shadow-sm border-none outline-none"
                      placeholder="0.00"
                      type="number"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[0.75rem] font-bold text-orange-600 uppercase tracking-wider">Weekly Rate</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-orange-600">$</span>
                    <input
                      name="weeklyRate"
                      value={formData.weeklyRate}
                      onChange={handleChange}
                      className="w-full bg-white rounded-2xl py-5 pl-10 pr-6 text-2xl font-bold text-slate-900 shadow-sm border-none outline-none"
                      placeholder="0.00"
                      type="number"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[0.75rem] font-bold text-orange-600 uppercase tracking-wider">Quantity Available</label>
                  <div className="flex items-center bg-white rounded-2xl shadow-sm px-6 py-5">
                    <input
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      className="w-full text-2xl font-bold text-slate-900 border-none outline-none bg-transparent"
                      placeholder="0"
                      type="number"
                    />
                    <span className="text-lg font-medium text-slate-500">units</span>
                  </div>
                </div>

                <div>
                  <label className="text-[0.75rem] font-bold text-orange-600 uppercase tracking-wider">Security Deposit</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-orange-600">$</span>
                    <input
                      name="deposit"
                      value={formData.deposit}
                      onChange={handleChange}
                      className="w-full bg-white rounded-2xl py-5 pl-10 pr-6 text-2xl font-bold text-slate-900 shadow-sm border-none outline-none"
                      placeholder="0.00"
                      type="number"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[0.75rem] font-semibold text-slate-500 mb-2 block uppercase tracking-wide">Availability Notes</label>
                <textarea
                  name="availabilityNotes"
                  value={formData.availabilityNotes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full bg-white rounded-xl p-4 border border-slate-200 focus:border-orange-600 outline-none resize-none"
                  placeholder="e.g. Available weekends only, minimum 2-day rental..."
                ></textarea>
              </div>
            </section>

            <section className="space-y-8 pb-10">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-orange-600 rounded-full"></div>
                <h3 className="text-xl font-semibold tracking-tight">Pickup & Delivery</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFulfillmentMode("pickup")}
                  className={`p-6 rounded-2xl flex flex-col items-center text-center gap-3 transition-all ${
                    fulfillmentMode === "pickup"
                      ? "bg-white border-2 border-orange-600 ring-4 ring-orange-100"
                      : "bg-white border border-slate-200 hover:border-orange-400 hover:bg-orange-50"
                  }`}
                >
                  <span className={`text-3xl ${fulfillmentMode === "pickup" ? "text-orange-600" : "text-slate-500"}`}>📦</span>
                  <span className="font-bold text-slate-900">Pickup</span>
                  <span className="text-xs text-slate-500">Renter collects from your location.</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFulfillmentMode("delivery")}
                  className={`p-6 rounded-2xl flex flex-col items-center text-center gap-3 transition-all ${
                    fulfillmentMode === "delivery"
                      ? "bg-white border-2 border-orange-600 ring-4 ring-orange-100"
                      : "bg-white border border-slate-200 hover:border-orange-400 hover:bg-orange-50"
                  }`}
                >
                  <span className={`text-3xl ${fulfillmentMode === "delivery" ? "text-orange-600" : "text-slate-500"}`}>🚚</span>
                  <span className="font-bold text-slate-900">Delivery</span>
                  <span className="text-xs text-slate-500">You arrange drop-off for renters.</span>
                </button>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <label className="text-[0.75rem] font-bold text-slate-500 uppercase tracking-wide">Pickup Address</label>
                <input
                  name="pickupAddress"
                  value={formData.pickupAddress}
                  onChange={handleChange}
                  className="w-full p-4 bg-slate-100 rounded-xl border border-slate-200 focus:border-orange-600 outline-none"
                  placeholder="Enter pickup address"
                  type="text"
                />
              </div>
            </section>
          </div>

          <div className="col-span-4 sticky top-20 h-fit space-y-8 -mt-2">
            <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-200">
              <div className="h-56 bg-orange-50 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="text-4xl">🧰</div>
                  <p className="text-sm font-semibold text-slate-700">Equipment rental preview</p>
                  <p className="text-xs text-slate-500">Your rental details will appear here.</p>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-4">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 leading-tight">
                      {formData.title || "Professional Camera Kit"}
                    </h2>
                    <span className="bg-orange-100 text-orange-600 text-[0.65rem] font-extrabold px-2 py-1 rounded tracking-widest uppercase">
                      RENT
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-3">
                    {formData.description || "High-quality equipment rental listing preview with pricing, category, and pickup terms."}
                  </p>
                </div>

                <div className="space-y-3 text-sm text-slate-500">
                  <div className="flex items-center gap-3"><span>🏷️</span><span>{formData.category || "Equipment"}</span></div>
                  <div className="flex items-center gap-3"><span>📌</span><span>{formData.condition || "Good"}</span></div>
                  <div className="flex items-center gap-3"><span>📦</span><span>{formData.quantity || "0"} available</span></div>
                  <div className="flex items-center gap-3"><span>📍</span><span>{getFulfillmentLabel()}</span></div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <div>
                    <span className="block text-xs text-slate-500">Daily Rate</span>
                    <span className="text-3xl font-black text-slate-900">${formData.dailyRate || "0.00"}</span>
                  </div>
                  <button className="mt-4 w-full bg-orange-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md">
                    Select
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}