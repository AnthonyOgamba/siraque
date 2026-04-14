"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../utils/firebase";

export default function CreateRentalHousingPage() {
  const router = useRouter();
  const activeTab = "housing";

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    nightlyRate: "",
    weeklyRate: "",
    bedrooms: "",
    bathrooms: "",
    guests: "",
    address: "",
    propertyType: "Apartment",
    availabilityNotes: "",
  });

  const [isPublishing, setIsPublishing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handlePublish() {
    setError("");
    setMessage("");

    const user = auth.currentUser;
    if (!user) return setError("You must be logged in to publish a housing rental.");
    if (!formData.title.trim()) return setError("Please enter a property title.");
    if (!formData.description.trim()) return setError("Please enter a description.");
    if (!formData.nightlyRate || Number(formData.nightlyRate) <= 0) return setError("Please enter a valid nightly rate.");
    if (!formData.address.trim()) return setError("Please enter the property address.");

    try {
      setIsPublishing(true);

      await addDoc(collection(db, "listings"), {
        type: "rental",
        subtype: "housing",
        vendorId: user.uid,
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: Number(formData.nightlyRate),
        nightlyRate: Number(formData.nightlyRate),
        weeklyRate: Number(formData.weeklyRate || 0),
        bedrooms: Number(formData.bedrooms || 0),
        bathrooms: Number(formData.bathrooms || 0),
        guests: Number(formData.guests || 0),
        address: formData.address.trim(),
        propertyType: formData.propertyType,
        availabilityNotes: formData.availabilityNotes.trim(),
        status: "published",
        createdAt: serverTimestamp(),
      });

      setMessage("Housing rental published successfully.");
      setFormData({
        title: "",
        description: "",
        nightlyRate: "",
        weeklyRate: "",
        bedrooms: "",
        bathrooms: "",
        guests: "",
        address: "",
        propertyType: "Apartment",
        availabilityNotes: "",
      });
    } catch (err) {
      console.error(err);
      setError("Failed to publish housing rental.");
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f9f9fb] text-[#2d3338]">
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/15 shadow-sm flex justify-between items-center px-8 h-16">
        <div className="flex items-center gap-8">
          <span className="text-xl font-bold tracking-tighter text-slate-800">Siraque</span>
        </div>
      </nav>

      <aside className="fixed left-0 top-0 h-screen w-64 pt-20 bg-slate-50 flex flex-col p-4 gap-2">
        <div className="mb-6 px-2">
          <h2 className="text-lg font-bold text-slate-900">Siraque</h2>
          <p className="text-xs text-slate-500">Vendor Portal</p>
        </div>
      </aside>

      <main className="ml-64 pt-24 px-12 pb-20 max-w-7xl mx-auto">
        <div className="space-y-10 mb-12">
          <header className="flex justify-between items-end min-h-[110px]">
            <div className="space-y-2">
              <span className="text-[0.75rem] font-semibold tracking-wider text-orange-600 uppercase">Create Offering</span>
              <h1 className="text-[2rem] font-semibold tracking-tight text-slate-900 leading-tight">Add Housing Rental</h1>
              <p className="text-slate-500 max-w-xl min-h-[56px]">Define your property details, capacity, pricing, and availability.</p>
            </div>

            <div className="flex gap-3 shrink-0">
              <button className="w-[160px] h-[52px] rounded-xl font-medium text-slate-700 bg-slate-200">Save Draft</button>
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="w-[220px] h-[52px] rounded-xl font-medium text-white bg-orange-600 disabled:opacity-60"
              >
                {isPublishing ? "Publishing..." : "Publish Housing Rental"}
              </button>
            </div>
          </header>

          <section>
            <div className="inline-flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
              <button onClick={() => router.push("/vendor-dashboard/create-rental-equipment")} className="w-[180px] h-[52px] rounded-xl text-sm font-medium text-slate-500 hover:text-slate-900">Equipment</button>
              <button className={`w-[180px] h-[52px] rounded-xl text-sm ${activeTab === "housing" ? "font-semibold text-white bg-orange-600 shadow-sm" : ""}`}>Housing</button>
              <button onClick={() => router.push("/vendor-dashboard/create-rental-vehicle")} className="w-[180px] h-[52px] rounded-xl text-sm font-medium text-slate-500 hover:text-slate-900">Vehicle</button>
            </div>
          </section>
        </div>

        {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {message && <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>}

        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-8 space-y-12">
            <section className="space-y-8">
              <div className="flex items-center gap-3"><div className="w-1 h-8 bg-orange-600 rounded-full"></div><h3 className="text-xl font-semibold tracking-tight">Property Details</h3></div>
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="text-[0.75rem] font-semibold text-slate-500 mb-2 block uppercase tracking-wide">Property Title</label>
                  <input name="title" value={formData.title} onChange={handleChange} className="w-full bg-transparent border-b-2 border-slate-300 focus:border-orange-600 py-3 text-lg outline-none" placeholder="e.g. Downtown Executive Apartment" type="text" />
                </div>
                <div className="col-span-2">
                  <label className="text-[0.75rem] font-semibold text-slate-500 mb-2 block uppercase tracking-wide">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full bg-white rounded-xl p-4 border border-slate-200 outline-none" placeholder="Describe the housing, key features, amenities, and guest experience..."></textarea>
                </div>
                <div>
                  <label className="text-[0.75rem] font-semibold text-slate-500 mb-2 block uppercase tracking-wide">Property Type</label>
                  <select name="propertyType" value={formData.propertyType} onChange={handleChange} className="w-full bg-white rounded-xl p-4 border border-slate-200 outline-none">
                    <option>Apartment</option>
                    <option>House</option>
                    <option>Condo</option>
                    <option>Basement Suite</option>
                  </select>
                </div>
                <div>
                  <label className="text-[0.75rem] font-semibold text-slate-500 mb-2 block uppercase tracking-wide">Address</label>
                  <input name="address" value={formData.address} onChange={handleChange} className="w-full bg-white rounded-xl p-4 border border-slate-200 outline-none" placeholder="Enter property address" type="text" />
                </div>
              </div>
            </section>

            <section className="space-y-8">
              <div className="flex items-center gap-3"><div className="w-1 h-8 bg-orange-600 rounded-full"></div><h3 className="text-xl font-semibold tracking-tight">Capacity & Pricing</h3></div>
              <div className="grid grid-cols-2 gap-8 p-8 bg-orange-50 rounded-3xl">
                <div>
                  <label className="text-[0.75rem] font-bold text-orange-600 uppercase tracking-wider">Nightly Rate</label>
                  <input name="nightlyRate" value={formData.nightlyRate} onChange={handleChange} className="mt-4 w-full bg-white rounded-2xl py-5 px-6 text-2xl font-bold text-slate-900" placeholder="$0.00" type="number" />
                </div>
                <div>
                  <label className="text-[0.75rem] font-bold text-orange-600 uppercase tracking-wider">Weekly Rate</label>
                  <input name="weeklyRate" value={formData.weeklyRate} onChange={handleChange} className="mt-4 w-full bg-white rounded-2xl py-5 px-6 text-2xl font-bold text-slate-900" placeholder="$0.00" type="number" />
                </div>
                <div>
                  <label className="text-[0.75rem] font-bold text-orange-600 uppercase tracking-wider">Bedrooms</label>
                  <input name="bedrooms" value={formData.bedrooms} onChange={handleChange} className="mt-4 w-full bg-white rounded-2xl py-5 px-6 text-2xl font-bold text-slate-900" placeholder="0" type="number" />
                </div>
                <div>
                  <label className="text-[0.75rem] font-bold text-orange-600 uppercase tracking-wider">Bathrooms</label>
                  <input name="bathrooms" value={formData.bathrooms} onChange={handleChange} className="mt-4 w-full bg-white rounded-2xl py-5 px-6 text-2xl font-bold text-slate-900" placeholder="0" type="number" />
                </div>
                <div className="col-span-2">
                  <label className="text-[0.75rem] font-bold text-orange-600 uppercase tracking-wider">Guest Capacity</label>
                  <input name="guests" value={formData.guests} onChange={handleChange} className="mt-4 w-full bg-white rounded-2xl py-5 px-6 text-2xl font-bold text-slate-900" placeholder="0" type="number" />
                </div>
              </div>
              <div>
                <label className="text-[0.75rem] font-semibold text-slate-500 mb-2 block uppercase tracking-wide">Availability Notes</label>
                <textarea name="availabilityNotes" value={formData.availabilityNotes} onChange={handleChange} rows="3" className="w-full bg-white rounded-xl p-4 border border-slate-200 outline-none" placeholder="e.g. Minimum 2-night stay, available holidays only..."></textarea>
              </div>
            </section>
          </div>

          <div className="col-span-4 sticky top-20 h-fit">
            <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-200">
              <div className="h-56 bg-orange-50 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl">🏠</div>
                  <p className="text-sm font-semibold text-slate-700 mt-2">Housing rental preview</p>
                </div>
              </div>
              <div className="p-8 space-y-4">
                <h2 className="text-2xl font-bold text-slate-900">{formData.title || "Downtown Executive Apartment"}</h2>
                <p className="text-sm text-slate-500">{formData.description || "Modern housing rental preview with pricing and guest details."}</p>
                <div className="space-y-2 text-sm text-slate-500">
                  <div>🏠 {formData.propertyType}</div>
                  <div>🛏️ {formData.bedrooms || 0} bedrooms</div>
                  <div>🛁 {formData.bathrooms || 0} bathrooms</div>
                  <div>👥 Sleeps {formData.guests || 0}</div>
                  <div>📍 {formData.address || "Address not set"}</div>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <span className="text-3xl font-black text-slate-900">${formData.nightlyRate || "0.00"}</span>
                  <span className="text-sm text-slate-500 ml-2">/ night</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </main>
  );
}