import Link from "next/link";

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-[#f9f9fb] text-slate-900">
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="mb-6">
        <Link
            href="/vendor-dashboard"
            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
        >
            Back to Dashboard
        </Link>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-12 shadow-sm">
          <span className="text-[0.75rem] uppercase tracking-[0.2em] font-bold text-orange-600">
            FAQ
          </span>
          
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">Frequently asked questions</h1>
          <p className="mt-4 text-slate-500">Find vendor and marketplace help content for using the Siraque platform.</p>

          <div className="mt-10 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">How do I manage my vendor listings?</h2>
              <p className="mt-2 text-slate-600">Use the Listings screen in the vendor dashboard to edit, delete, or view your published items.</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Where can I see bookings?</h2>
              <p className="mt-2 text-slate-600">Open the Bookings page to review recent customer orders and booking details.</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">How do I update my vendor profile?</h2>
              <p className="mt-2 text-slate-600">Click the Profile button in the top-right vendor header to update your account information and settings.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
