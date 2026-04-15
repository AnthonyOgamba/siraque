"use client";

import Link from "next/link";

export default function VendorNotificationsPage() {
  const notificationItems = [
    {
      id: 1,
      title: "New booking received",
      description: "A customer booked your premium service package.",
      time: "2 hours ago",
    },
    {
      id: 2,
      title: "Listing performance alert",
      description: "Your service listing has received 128 views in the last 24 hours.",
      time: "5 hours ago",
    },
    {
      id: 3,
      title: "Payment status updated",
      description: "Your payout for the latest booking has been processed.",
      time: "Yesterday",
    },
  ];

  return (
      <section className="pb-32">
        <header className="mb-12">
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-orange-600 block mb-2">
            Vendor Notifications
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-slate-900 max-w-2xl">
            Stay on top of activity for your vendor account.
          </h1>
          <p className="mt-4 max-w-3xl text-slate-500">
            Review booking alerts, payout updates, and listing performance notifications all in one place.
          </p>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1.7fr_0.9fr]">
          <div className="space-y-6">
            {notificationItems.map((item) => (
              <article
                key={item.id}
                className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{item.title}</h2>
                    <p className="mt-2 text-sm text-slate-500">{item.description}</p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    {item.time}
                  </span>
                </div>
              </article>
            ))}
          </div>

          <aside className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">Notification tips</h2>
            <p className="mt-4 text-sm text-slate-600">
              You can control vendor notification preferences in Settings and choose which alerts you want to receive.
            </p>
            <Link
              href="/vendor-dashboard/settings"
              className="mt-8 inline-flex w-full items-center justify-center rounded-3xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-700 transition-all"
            >
              Manage notification settings
            </Link>
          </aside>
        </div>
      </section>
  );
}
