"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, db } from "../../utils/firebase";

export default function CreateRentalVehiclePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingId = searchParams?.get("id");
  const isEditMode = Boolean(listingId);
  const activeTab = "vehicle";

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dailyRate: "",
    weeklyRate: "",
    make: "",
    model: "",
    year: "",
    seats: "",
    transmission: "Automatic",
    fuelType: "Gasoline",
    pickupAddress: "",
    availabilityNotes: "",
  });

  const [isPublishing, setIsPublishing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
        if (data.type !== "rental" || data.subtype !== "vehicle") {
          setError("This listing cannot be edited here.");
          return;
        }

        setFormData({
          title: data.title || "",
          description: data.description || "",
          dailyRate: data.dailyRate?.toString() || "",
          weeklyRate: data.weeklyRate?.toString() || "",
          make: data.make || "",
          model: data.model || "",
          year: data.year?.toString() || "",
          seats: data.seats?.toString() || "",
          transmission: data.transmission || "Automatic",
          fuelType: data.fuelType || "Gasoline",
          pickupAddress: data.pickupAddress || "",
          availabilityNotes: data.availabilityNotes || "",
        });
      } catch (err) {
        console.error("Load vehicle rental for edit error:", err);
        setError("Unable to load the rental for editing.");
      }
    }

    loadListing();
  }, [listingId]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handlePublish() {
    setError("");
    setMessage("");

    const user = auth.currentUser;
    if (!user) return setError("You must be logged in to publish a vehicle rental.");
    if (!formData.title.trim()) return setError("Please enter a vehicle title.");
    if (!formData.description.trim()) return setError("Please enter a description.");
    if (!formData.dailyRate || Number(formData.dailyRate) <= 0)
      return setError("Please enter a valid daily rate.");
    if (!formData.pickupAddress.trim()) return setError("Please enter a pickup address.");

    try {
      setIsPublishing(true);

      const listingData = {
        type: "rental",
        subtype: "vehicle",
        vendorId: user.uid,
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: Number(formData.dailyRate),
        dailyRate: Number(formData.dailyRate),
        weeklyRate: Number(formData.weeklyRate || 0),
        make: formData.make.trim(),
        model: formData.model.trim(),
        year: Number(formData.year || 0),
        seats: Number(formData.seats || 0),
        transmission: formData.transmission,
        fuelType: formData.fuelType,
        pickupAddress: formData.pickupAddress.trim(),
        availabilityNotes: formData.availabilityNotes.trim(),
        status: "published",
        ...(isEditMode ? { updatedAt: serverTimestamp() } : { createdAt: serverTimestamp() }),
      };

      if (isEditMode && listingId) {
        await updateDoc(doc(db, "listings", listingId), listingData);
        setMessage("Vehicle rental updated successfully.");
      } else {
        await addDoc(collection(db, "listings"), listingData);
        setMessage("Vehicle rental published successfully.");
      }
      setFormData({
        title: "",
        description: "",
        dailyRate: "",
        weeklyRate: "",
        make: "",
        model: "",
        year: "",
        seats: "",
        transmission: "Automatic",
        fuelType: "Gasoline",
        pickupAddress: "",
        availabilityNotes: "",
      });
    } catch (err) {
      console.error(err);
      setError("Failed to publish vehicle rental.");
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
                Create Offering
              </span>
              <h1 className="text-[2rem] font-semibold tracking-tight text-slate-900 leading-tight">
                Add Vehicle Rental
              </h1>
              <p className="text-slate-500 max-w-xl min-h-[56px]">
                Define vehicle details, pricing, pickup, and availability for your vehicle rental.
              </p>
            </div>

            <div className="flex gap-3 shrink-0">
              <button className="w-[160px] h-[52px] rounded-xl font-medium text-slate-700 bg-slate-200">
                Save Draft
              </button>
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="w-[240px] h-[52px] rounded-xl font-medium text-white bg-orange-600 disabled:opacity-60"
              >
                {isPublishing ? "Publishing..." : "Publish Vehicle Rental"}
              </button>
            </div>
          </header>

          <section>
            <div className="inline-flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                onClick={() => router.push("/vendor-dashboard/create-rental-equipment")}
                className="w-[180px] h-[52px] rounded-xl text-sm font-medium text-slate-500 hover:text-slate-900"
              >
                Equipment
              </button>
              <button
                onClick={() => router.push("/vendor-dashboard/create-rental-housing")}
                className="w-[180px] h-[52px] rounded-xl text-sm font-medium text-slate-500 hover:text-slate-900"
              >
                Housing
              </button>
              <button
                className={`w-[180px] h-[52px] rounded-xl text-sm ${
                  activeTab === "vehicle"
                    ? "font-semibold text-white bg-orange-600 shadow-sm"
                    : ""
                }`}
              >
                Vehicle
              </button>
            </div>
          </section>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-8 space-y-12">
            <section className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-orange-600 rounded-full"></div>
                <h3 className="text-xl font-semibold tracking-tight">Vehicle Details</h3>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="text-[0.75rem] font-semibold text-slate-500 mb-2 block uppercase tracking-wide">
                    Vehicle Title
                  </label>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full bg-transparent border-b-2 border-slate-300 focus:border-orange-600 py-3 text-lg outline-none"
                    placeholder="e.g. 2022 Toyota Corolla"
                    type="text"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[0.75rem] font-semibold text-slate-500 mb-2 block uppercase tracking-wide">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    className="w-full bg-white rounded-xl p-4 border border-slate-200 outline-none"
                    placeholder="Describe the vehicle, features, mileage, and rental terms..."
                  ></textarea>
                </div>

                <div>
                  <label className="text-[0.75rem] font-semibold text-slate-500 mb-2 block uppercase tracking-wide">
                    Make
                  </label>
                  <input
                    name="make"
                    value={formData.make}
                    onChange={handleChange}
                    className="w-full bg-white rounded-xl p-4 border border-slate-200 outline-none"
                    placeholder="e.g. Toyota"
                    type="text"
                  />
                </div>

                <div>
                  <label className="text-[0.75rem] font-semibold text-slate-500 mb-2 block uppercase tracking-wide">
                    Model
                  </label>
                  <input
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    className="w-full bg-white rounded-xl p-4 border border-slate-200 outline-none"
                    placeholder="e.g. Corolla"
                    type="text"
                  />
                </div>

                <div>
                  <label className="text-[0.75rem] font-semibold text-slate-500 mb-2 block uppercase tracking-wide">
                    Year
                  </label>
                  <input
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full bg-white rounded-xl p-4 border border-slate-200 outline-none"
                    placeholder="2022"
                    type="number"
                  />
                </div>

                <div>
                  <label className="text-[0.75rem] font-semibold text-slate-500 mb-2 block uppercase tracking-wide">
                    Seats
                  </label>
                  <input
                    name="seats"
                    value={formData.seats}
                    onChange={handleChange}
                    className="w-full bg-white rounded-xl p-4 border border-slate-200 outline-none"
                    placeholder="5"
                    type="number"
                  />
                </div>

                <div>
                  <label className="text-[0.75rem] font-semibold text-slate-500 mb-2 block uppercase tracking-wide">
                    Transmission
                  </label>
                  <select
                    name="transmission"
                    value={formData.transmission}
                    onChange={handleChange}
                    className="w-full bg-white rounded-xl p-4 border border-slate-200 outline-none"
                  >
                    <option>Automatic</option>
                    <option>Manual</option>
                  </select>
                </div>

                <div>
                  <label className="text-[0.75rem] font-semibold text-slate-500 mb-2 block uppercase tracking-wide">
                    Fuel Type
                  </label>
                  <select
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={handleChange}
                    className="w-full bg-white rounded-xl p-4 border border-slate-200 outline-none"
                  >
                    <option>Gasoline</option>
                    <option>Hybrid</option>
                    <option>Electric</option>
                    <option>Diesel</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-orange-600 rounded-full"></div>
                <h3 className="text-xl font-semibold tracking-tight">Pricing & Pickup</h3>
              </div>

              <div className="grid grid-cols-2 gap-8 p-8 bg-orange-50 rounded-3xl">
                <div>
                  <label className="text-[0.75rem] font-bold text-orange-600 uppercase tracking-wider">
                    Daily Rate
                  </label>
                  <input
                    name="dailyRate"
                    value={formData.dailyRate}
                    onChange={handleChange}
                    className="mt-4 w-full bg-white rounded-2xl py-5 px-6 text-2xl font-bold text-slate-900"
                    placeholder="$0.00"
                    type="number"
                  />
                </div>

                <div>
                  <label className="text-[0.75rem] font-bold text-orange-600 uppercase tracking-wider">
                    Weekly Rate
                  </label>
                  <input
                    name="weeklyRate"
                    value={formData.weeklyRate}
                    onChange={handleChange}
                    className="mt-4 w-full bg-white rounded-2xl py-5 px-6 text-2xl font-bold text-slate-900"
                    placeholder="$0.00"
                    type="number"
                  />
                </div>
              </div>

              <div>
                <label className="text-[0.75rem] font-semibold text-slate-500 mb-2 block uppercase tracking-wide">
                  Pickup Address
                </label>
                <input
                  name="pickupAddress"
                  value={formData.pickupAddress}
                  onChange={handleChange}
                  className="w-full bg-white rounded-xl p-4 border border-slate-200 outline-none"
                  placeholder="Enter pickup address"
                  type="text"
                />
              </div>

              <div>
                <label className="text-[0.75rem] font-semibold text-slate-500 mb-2 block uppercase tracking-wide">
                  Availability Notes
                </label>
                <textarea
                  name="availabilityNotes"
                  value={formData.availabilityNotes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full bg-white rounded-xl p-4 border border-slate-200 outline-none"
                  placeholder="e.g. Weekend pickup only, no smoking, minimum driver age..."
                ></textarea>
              </div>
            </section>
          </div>

          <div className="col-span-4 sticky top-20 h-fit">
            <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-200">
              <div className="h-56 bg-orange-50 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl">🚙</div>
                  <p className="text-sm font-semibold text-slate-700 mt-2">Vehicle rental preview</p>
                </div>
              </div>
              <div className="p-8 space-y-4">
                <h2 className="text-2xl font-bold text-slate-900">
                  {formData.title || "2022 Toyota Corolla"}
                </h2>
                <p className="text-sm text-slate-500">
                  {formData.description || "Vehicle rental preview with pricing, pickup, and core details."}
                </p>
                <div className="space-y-2 text-sm text-slate-500">
                  <div>🚙 {formData.make || "Make"} {formData.model || "Model"}</div>
                  <div>📅 {formData.year || "Year"}</div>
                  <div>👥 {formData.seats || 0} seats</div>
                  <div>⚙️ {formData.transmission}</div>
                  <div>⛽ {formData.fuelType}</div>
                  <div>📍 {formData.pickupAddress || "Pickup address not set"}</div>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <span className="text-3xl font-black text-slate-900">${formData.dailyRate || "0.00"}</span>
                  <span className="text-sm text-slate-500 ml-2">/ day</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}