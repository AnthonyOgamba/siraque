"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../utils/firebase";

export default function CreateServicePage() {
  const router = useRouter();

  const activeTab = "service";
  const pageLabel = "Create Offering";
  const pageTitle = "Add New Service";
  const pageDescription =
    "Define the details, pricing, and delivery for your new professional offering.";
  const publishButtonText = "Publish Service";

  const [deliveryMode, setDeliveryMode] = useState("remote");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    duration: "30",
    studioAddress: "882 West Editorial Lane, Suite 400, Chicago IL",
  });
  const [previewImage, setPreviewImage] = useState(
    "https://lh3.googleusercontent.com/aida-public/AB6AXuA-a1ibcH1KUKVVEo1HrL9fiY6ateZxD-H4naAVU6iO5HYKVSc6u7t3_62BAc3RpYQYj0PdhLd7CWABJziGr17LEGq1hlKD4tBcOKNvGtQ2V-yUT4hJQYtWbUk3WRBo-Nc8iRhyC467POCGlC4WU-6iNidXk_ileOZi4ff6rPVDSNHr0TnuDO29jBuFM_rLfzfU4bsRHrCGR3ExDceEhEt8TbScJ1wPwNYOASSbpoe9BCyUul7M-5g3tiGgFweFxZGejWkt7AuBSn5r"
  );
  const [isPublishing, setIsPublishing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setPreviewImage(imageUrl);
  }

  function getDeliveryLabel() {
    if (deliveryMode === "remote") return "Remote Delivery";
    if (deliveryMode === "studio") {
      return `In-Studio • ${formData.studioAddress || "Studio address not set"}`;
    }
    return "Mobile / On-site";
  }

  async function handlePublish() {
    setError("");
    setMessage("");

    const user = auth.currentUser;

    if (!user) {
      setError("You must be logged in to publish a service.");
      return;
    }

    if (!formData.title.trim()) {
      setError("Please enter a service name.");
      return;
    }

    if (!formData.description.trim()) {
      setError("Please enter a service description.");
      return;
    }

    if (!formData.price || Number(formData.price) <= 0) {
      setError("Please enter a valid service price.");
      return;
    }

    if (deliveryMode === "studio" && !formData.studioAddress.trim()) {
      setError("Please enter a studio address for in-studio services.");
      return;
    }

    try {
      setIsPublishing(true);

      const listingData = {
        type: "service",
        subtype: "single",
        vendorId: user.uid,
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        duration: Number(formData.duration),
        deliveryMode,
        studioAddress:
          deliveryMode === "studio" ? formData.studioAddress.trim() : "",
        imageUrl: previewImage,
        status: "published",
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "listings"), listingData);

      setMessage("Service published successfully.");

      setFormData({
        title: "",
        description: "",
        price: "",
        duration: "30",
        studioAddress: "882 West Editorial Lane, Suite 400, Chicago IL",
      });

      setDeliveryMode("remote");
    } catch (err) {
      console.error("Publish service error:", err);
      setError("Failed to publish service. Check Firestore rules and try again.");
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f9f9fb] text-[#2d3338]">
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/15 shadow-sm flex justify-between items-center px-8 h-16">
        <div className="flex items-center gap-8">
          <span className="text-xl font-bold tracking-tighter text-slate-800">
            Siraque
          </span>
          <div className="hidden md:flex items-center space-x-6">
            <a
              className="text-slate-500 hover:text-orange-600 transition-colors duration-300 font-medium text-sm"
              href="#"
            >
              Marketplace
            </a>
            <a
              className="text-slate-500 hover:text-orange-600 transition-colors duration-300 font-medium text-sm"
              href="#"
            >
              Analytics
            </a>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-500 hover:text-orange-600 transition-colors">
            <span>🔔</span>
          </button>
          <button className="p-2 text-slate-500 hover:text-orange-600 transition-colors">
            <span>❓</span>
          </button>
          <div className="h-8 w-8 rounded-full overflow-hidden border border-slate-200">
            <img
              className="h-full w-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRBmPQFUaVqmzsZ8P13H68CRdsQSbcJMY3WqW8jQNaG5VIbfawP8LjyGe35Hob8k3QoooEwjKWBXJlvsgEsv6Lb0dmh-SJqH177YXn_c9Dat-9JBsTxM8x2tg9_oihwIT2A-n_gWvq1vYt9r0kAYQXmG6YG7KSavlPhBh5YZIWlxw0ZU_7QF2xQp1mdJDCBbCF_21wPAsIX_KP95Ek7kamBjoh6gn_j-wH1K-AD3YCSViy-gucnTtAS6KlUhlGsQC2uTawO8plEOOl"
              alt="Vendor avatar"
            />
          </div>
        </div>
      </nav>

      <aside className="fixed left-0 top-0 h-screen w-64 pt-20 bg-slate-50 flex flex-col p-4 gap-2">
        <div className="mb-6 px-2">
          <h2 className="text-lg font-bold text-slate-900">Siraque</h2>
          <p className="text-xs text-slate-500">Vendor Portal</p>
        </div>

        <nav className="flex-1 space-y-1">
          <a
            className="flex items-center gap-3 px-3 py-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all rounded-lg"
            href="#"
          >
            <span>📊</span>
            <span className="font-medium text-sm">Dashboard</span>
          </a>
          <a
            className="flex items-center gap-3 px-3 py-2 text-orange-600 font-semibold bg-white shadow-sm rounded-lg"
            href="#"
          >
            <span>🧰</span>
            <span className="font-medium text-sm">Services</span>
          </a>
          <a
            className="flex items-center gap-3 px-3 py-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all rounded-lg"
            href="#"
          >
            <span>📅</span>
            <span className="font-medium text-sm">Bookings</span>
          </a>
          <a
            className="flex items-center gap-3 px-3 py-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all rounded-lg"
            href="#"
          >
            <span>💳</span>
            <span className="font-medium text-sm">Earnings</span>
          </a>
        </nav>

        <div className="pt-4 mt-4 border-t border-slate-200">
          <a
            className="flex items-center gap-3 px-3 py-2 text-slate-500 hover:bg-slate-100 transition-all rounded-lg"
            href="#"
          >
            <span>⚙️</span>
            <span className="font-medium text-sm">Settings</span>
          </a>
          <a
            className="flex items-center gap-3 px-3 py-2 text-slate-500 hover:bg-slate-100 transition-all rounded-lg"
            href="#"
          >
            <span>🆘</span>
            <span className="font-medium text-sm">Support</span>
          </a>
        </div>
      </aside>

      <main className="ml-64 pt-24 px-12 pb-20 max-w-7xl mx-auto">
        <div className="space-y-10 mb-12">
          <header className="flex justify-between items-end min-h-[110px]">
            <div className="space-y-2">
              <span className="text-[0.75rem] font-semibold tracking-wider text-orange-600 uppercase">
                {pageLabel}
              </span>
              <h1 className="text-[2rem] font-semibold tracking-tight text-slate-900 leading-tight">
                {pageTitle}
              </h1>
              <p className="text-slate-500 max-w-xl min-h-[56px]">
                {pageDescription}
              </p>
            </div>

            <div className="flex gap-3 shrink-0">
              <button className="w-[160px] h-[52px] rounded-xl font-medium text-slate-700 bg-slate-200 hover:bg-slate-300 transition-all duration-300">
                Save Draft
              </button>
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="w-[200px] h-[52px] rounded-xl font-medium text-white bg-orange-600 shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-60"
              >
                {isPublishing ? "Publishing..." : publishButtonText}
              </button>
            </div>
          </header>

          <section>
            <div className="inline-flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                className={`w-[210px] h-[52px] rounded-xl text-sm transition-colors ${
                  activeTab === "service"
                    ? "font-semibold text-white bg-orange-600 shadow-sm"
                    : "font-medium text-slate-500 hover:text-slate-900"
                }`}
              >
                Individual Service
              </button>

              <button
                type="button"
                onClick={() => router.push("/vendor-dashboard/create-service-package")}
                className={`w-[210px] h-[52px] rounded-xl text-sm transition-colors ${
                  activeTab === "package"
                    ? "font-semibold text-white bg-orange-600 shadow-sm"
                    : "font-medium text-slate-500 hover:text-slate-900"
                }`}
              >
                Service Package
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
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-orange-600 rounded-full"></div>
                <h3 className="text-xl font-semibold tracking-tight">
                  Service Cover Image
                </h3>
              </div>

              <div className="relative group">
                <div className="w-full h-64 border-2 border-dashed border-slate-300 rounded-3xl bg-slate-100 flex flex-col items-center justify-center gap-4 transition-all hover:border-orange-400 hover:bg-orange-50">
                  <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-500 group-hover:text-orange-600 transition-colors">
                    <span className="text-4xl">📷</span>
                  </div>

                  <div className="text-center">
                    <p className="text-slate-900 font-semibold">
                      Drag and drop your cover image here
                    </p>
                    <p className="text-sm text-slate-500">
                      Recommended size: 1200x800px. Max 5MB.
                    </p>
                  </div>

                  <label className="mt-2 px-8 py-3 rounded-xl font-bold text-white bg-orange-600 shadow-md hover:bg-orange-700 transition-all cursor-pointer">
                    Upload from Computer
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </section>

            <section className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-orange-600 rounded-full"></div>
                <h3 className="text-xl font-semibold tracking-tight">
                  Service Details
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="text-[0.75rem] font-semibold text-slate-500 mb-2 block uppercase tracking-wide">
                    Service Name
                  </label>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full bg-transparent border-b-2 border-slate-300 focus:border-orange-600 focus:ring-0 transition-all py-3 text-lg placeholder:text-slate-400 outline-none"
                    placeholder="e.g. Professional Business Consultation"
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
                    className="w-full bg-white rounded-xl p-4 border border-slate-200 focus:border-orange-600 focus:ring-1 focus:ring-orange-200 transition-all outline-none resize-none"
                    placeholder="Describe the value proposition, outcomes, and what clients should expect..."
                    rows="4"
                  ></textarea>
                </div>
              </div>
            </section>

            <section className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-orange-600 rounded-full"></div>
                <h3 className="text-xl font-semibold tracking-tight">
                  Pricing & Duration
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-8 p-8 bg-orange-50 rounded-3xl">
                <div className="space-y-4">
                  <label className="text-[0.75rem] font-bold text-orange-600 uppercase tracking-wider">
                    Rate (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-orange-600">
                      $
                    </span>
                    <input
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full bg-white rounded-2xl py-5 pl-10 pr-6 text-2xl font-bold text-slate-900 shadow-sm focus:ring-2 focus:ring-orange-300 border-none outline-none"
                      placeholder="0.00"
                      type="number"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[0.75rem] font-bold text-orange-600 uppercase tracking-wider">
                    Service Duration
                  </label>
                  <div className="flex items-center bg-white rounded-2xl shadow-sm px-6 py-5">
                    <select
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      className="w-full text-2xl font-bold text-slate-900 border-none focus:ring-0 p-0 outline-none bg-transparent appearance-none"
                    >
                      <option value="30">30</option>
                      <option value="60">60</option>
                      <option value="90">90</option>
                      <option value="120">120</option>
                    </select>
                    <span className="text-lg font-medium text-slate-500">
                      mins
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-8 pb-10">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-orange-600 rounded-full"></div>
                <h3 className="text-xl font-semibold tracking-tight">
                  Delivery & Location
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setDeliveryMode("remote")}
                  className={`p-6 rounded-2xl flex flex-col items-center text-center gap-3 cursor-pointer transition-all ${
                    deliveryMode === "remote"
                      ? "bg-white border-2 border-orange-600 ring-4 ring-orange-100"
                      : "bg-white border border-slate-200 hover:border-orange-400 hover:bg-orange-50"
                  }`}
                >
                  <span
                    className={`text-3xl ${
                      deliveryMode === "remote" ? "text-orange-600" : "text-slate-500"
                    }`}
                  >
                    💻
                  </span>
                  <span className="font-bold text-slate-900">Remote / Online</span>
                  <span className="text-xs text-slate-500">
                    Deliver via video call or digital platform.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryMode("studio")}
                  className={`p-6 rounded-2xl flex flex-col items-center text-center gap-3 cursor-pointer transition-all ${
                    deliveryMode === "studio"
                      ? "bg-white border-2 border-orange-600 ring-4 ring-orange-100"
                      : "bg-white border border-slate-200 hover:border-orange-400 hover:bg-orange-50"
                  }`}
                >
                  <span
                    className={`text-3xl ${
                      deliveryMode === "studio" ? "text-orange-600" : "text-slate-500"
                    }`}
                  >
                    🏢
                  </span>
                  <span className="font-bold text-slate-900">In-Studio</span>
                  <span className="text-xs text-slate-500">
                    Client visits your primary business location.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryMode("mobile")}
                  className={`p-6 rounded-2xl flex flex-col items-center text-center gap-3 cursor-pointer transition-all ${
                    deliveryMode === "mobile"
                      ? "bg-white border-2 border-orange-600 ring-4 ring-orange-100"
                      : "bg-white border border-slate-200 hover:border-orange-400 hover:bg-orange-50"
                  }`}
                >
                  <span
                    className={`text-3xl ${
                      deliveryMode === "mobile" ? "text-orange-600" : "text-slate-500"
                    }`}
                  >
                    📍
                  </span>
                  <span className="font-bold text-slate-900">Mobile / On-site</span>
                  <span className="text-xs text-slate-500">
                    You travel to the client&apos;s provided address.
                  </span>
                </button>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <label className="text-[0.75rem] font-bold text-slate-500 uppercase tracking-wide">
                  Studio Address
                </label>
                <input
                  name="studioAddress"
                  value={formData.studioAddress}
                  onChange={handleChange}
                  className="w-full p-4 bg-slate-100 rounded-xl border border-slate-200 focus:border-orange-600 focus:ring-1 focus:ring-orange-200 outline-none"
                  placeholder="Enter studio address"
                  type="text"
                />
              </div>
            </section>
          </div>

          <div className="col-span-4 sticky top-20 h-fit space-y-8 -mt-2">
            <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-200">
              <div className="h-56 relative overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  src={previewImage}
                  alt="Service preview"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-bold text-orange-600 shadow-sm">
                  PREVIEW
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-4">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 leading-tight">
                      {formData.title || "Professional Consultation"}
                    </h2>
                    <span className="bg-orange-100 text-orange-600 text-[0.65rem] font-extrabold px-2 py-1 rounded tracking-widest uppercase">
                      PRO
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-3">
                    {formData.description ||
                      "High-impact business strategy session to accelerate your brand's growth and operational efficiency."}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <span>⏱️</span>
                    <span>{formData.duration || "30"}m Session</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <span>📍</span>
                    <span>{getDeliveryLabel()}</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <div>
                    <span className="block text-xs text-slate-500 opacity-0">
                      $0.00
                    </span>
                    <span className="text-3xl font-black text-slate-900">
                      ${formData.price || "120.00"}
                    </span>
                  </div>

                  <button className="mt-4 w-full bg-orange-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md">
                    Select
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-100 rounded-2xl space-y-4">
              <div className="flex items-center gap-3 text-orange-600">
                <span>💡</span>
                <h4 className="font-bold text-sm uppercase tracking-wider">
                  Quick Tips
                </h4>
              </div>
              <ul className="space-y-3">
                <li className="flex gap-3 text-sm">
                  <span className="text-orange-600 mt-0.5">✔</span>
                  <span className="text-slate-700">
                    Clear, concise names rank better in search results.
                  </span>
                </li>
                <li className="flex gap-3 text-sm">
                  <span className="text-orange-600 mt-0.5">✔</span>
                  <span className="text-slate-700">
                    High-quality cover images increase click-through by 40%.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </main>
  );
}