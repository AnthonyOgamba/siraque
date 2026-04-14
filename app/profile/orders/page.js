"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const savedOrderHistory = window.localStorage.getItem("siraque_order_history");
    setOrders(savedOrderHistory ? JSON.parse(savedOrderHistory) : []);
  }, []);

  return (
    <main className="min-h-screen bg-[#f9f9fb] text-slate-900">
      <div className="max-w-screen-2xl mx-auto px-10 py-16">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] font-semibold text-orange-600">Orders</p>
            <h1 className="mt-3 text-4xl font-bold text-slate-900">Booked Items</h1>
            <p className="mt-3 text-slate-500 max-w-2xl">
              These are the items you booked. Click any order to review details and follow up with the vendor.
            </p>
          </div>
          <Link
            href="/profile"
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:border-orange-300 hover:text-orange-600 transition-all"
          >
            Back to Profile
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-12 text-center text-slate-600">
            No booked items yet. Complete a checkout to see orders here.
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.orderId || order.createdAt} className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-orange-600 font-semibold">Order confirmed</p>
                    <h2 className="mt-3 text-2xl font-semibold text-slate-900">{order.orderLabel || `Booking ${order.createdAt?.slice(0, 10)}`}</h2>
                    <p className="mt-2 text-sm text-slate-500">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">${order.totalPrice?.toFixed(2) ?? 0}</p>
                    <p className="text-sm text-slate-500">{order.items?.length ?? 0} items</p>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{item.title}</p>
                        <p className="text-sm text-slate-500">{item.subtype || item.type || "Item"}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">Qty {item.quantity || 1}</p>
                        <p className="text-sm text-slate-500">${(Number(item.unitPrice) || Number(item.price) || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
