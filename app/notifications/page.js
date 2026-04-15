"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import SiteHeader from "../components/SiteHeader";
import { auth, db } from "../utils/firebase";

function sortNotificationsByCreatedAt(items) {
  return [...items].sort((a, b) => {
    const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
    const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
    return bTime - aTime;
  });
}

export default function NotificationsPage() {
  const [user, setUser] = useState(null);
  const [expandedId, setExpandedId] = useState("profile-1");
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      setProfileName(currentUser?.displayName || "");
      setProfileEmail(currentUser?.email || "");

      if (!currentUser) {
        setNotifications([]);
        return;
      }

      try {
        const notificationsRef = collection(db, "notifications");

        try {
          const notificationsQuery = query(
            notificationsRef,
            where("recipientId", "==", currentUser.uid),
            orderBy("createdAt", "desc")
          );
          const snapshot = await getDocs(notificationsQuery);
          setNotifications(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        } catch (indexError) {
          const fallbackQuery = query(
            notificationsRef,
            where("recipientId", "==", currentUser.uid)
          );
          const snapshot = await getDocs(fallbackQuery);
          const notificationData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setNotifications(sortNotificationsByCreatedAt(notificationData));
          console.warn("Notifications query used fallback because the composite index is missing.", indexError);
        }
      } catch (err) {
        console.error("Failed to load notifications:", err);
        setNotifications([]);
      }
    });

    return unsubscribe;
  }, []);

  function handleToggle(id) {
    setExpandedId((currentId) => (currentId === id ? null : id));
    if (id !== "profile-1") {
      setProfileMessage("");
    }
  }

  function handleSaveProfile() {
    setProfileMessage("Your profile details were updated.");
  }

  const sampleCards = [
    {
      id: "confirm-1",
      title: "Booking confirmed",
      message: "Thank you for booking these items. The vendor will reach out soon to finalize details.",
      time: "Just now",
      details:
        "Your booking has been confirmed and is now being processed. The vendor will message you within the next few hours to confirm delivery or pickup details.",
    },
    {
      id: "vendor-1",
      title: "Vendor next step",
      message: "A vendor representative will contact you within 24 hours to confirm availability and delivery.",
      time: "2 hours ago",
      details:
        "This notification means your order is under vendor review. They may request additional details or confirm timing before your items are prepared.",
    },
    {
      id: "saved-1",
      title: "New saved item",
      message: "You clicked an item on the marketplace. It is now available in Saved Items for review.",
      time: "Yesterday",
      details:
        "The item has been added to your saved list so you can revisit it later. Use the saved items section to compare prices, vendors, and availability.",
    },
  ];

  const displayedCards = notifications.length > 0
    ? notifications.map((notification) => ({
        ...notification,
        title: notification.title || "Platform message",
        time: notification.createdAt?.toDate ? notification.createdAt.toDate().toLocaleString() : notification.time || "Just now",
        details: notification.details || notification.message,
      }))
    : sampleCards;

  return (
    <main className="min-h-screen bg-[#f9f9fb] text-slate-900">
      <SiteHeader activePage="" showSearch={false} />

      <div className="max-w-screen-2xl mx-auto px-10 py-16">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-12 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] font-semibold text-orange-600">Notifications</p>
              <h1 className="mt-3 text-4xl font-bold text-slate-900">Get Notified</h1>
              <p className="mt-4 text-slate-500 max-w-2xl">
                Review recent updates and adjust your profile details without leaving this page.
              </p>
            </div>
            <div className="rounded-3xl bg-orange-50 p-5 text-right">
              <p className="text-sm uppercase tracking-[0.25em] font-semibold text-orange-600">Tip</p>
              <p className="mt-3 text-xl font-semibold text-slate-900">Open any card for more details</p>
            </div>
          </div>

          <div className="mt-12 space-y-4">
            {displayedCards.map((card) => {
              const isExpanded = expandedId === card.id;
              return (
                <article key={card.id} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{card.title}</p>
                      <p className="mt-2 text-sm text-slate-600">{card.message}</p>
                    </div>

                    <div className="flex items-center gap-4 sm:justify-end">
                      <span className="text-xs uppercase tracking-[0.25em] text-slate-500">{card.time}</span>
                      <button
                        type="button"
                        onClick={() => handleToggle(card.id)}
                        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-orange-300 hover:text-orange-600 transition-all"
                      >
                        {isExpanded ? "Hide details" : "More details"}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white shadow-sm p-8">
                      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <span className="text-orange-600 text-lg">🛍️</span>
                            <div>
                              <p className="text-xs uppercase tracking-[0.2em] text-orange-600 font-bold">
                                {card.isProfile ? "Profile details" : "Notification details"}
                              </p>
                              <h2 className="text-2xl font-bold text-slate-900">{card.title}</h2>
                            </div>
                          </div>
                          <p className="text-slate-600 max-w-3xl">{card.details}</p>
                        </div>

                        <div className="flex flex-col gap-3 md:flex-row md:items-start">
                          {card.isProfile ? (
                            <button
                              type="button"
                              onClick={handleSaveProfile}
                              className="rounded-full bg-orange-600 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-700 transition-all"
                            >
                              Save changes
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setExpandedId(null)}
                              className="self-start rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-all"
                            >
                              Close details
                            </button>
                          )}
                        </div>
                      </div>

                      {card.isProfile && (
                        <div className="mt-8 grid gap-4 md:grid-cols-2">
                          <label className="space-y-2">
                            <span className="text-sm font-semibold text-slate-900">Display name</span>
                            <input
                              type="text"
                              value={profileName}
                              onChange={(e) => setProfileName(e.target.value)}
                              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                            />
                          </label>

                          <label className="space-y-2">
                            <span className="text-sm font-semibold text-slate-900">Email address</span>
                            <input
                              type="email"
                              value={profileEmail}
                              onChange={(e) => setProfileEmail(e.target.value)}
                              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                            />
                          </label>
                        </div>
                      )}

                      {card.isProfile && profileMessage && (
                        <p className="mt-6 rounded-3xl bg-emerald-50 border border-emerald-200 px-6 py-4 text-sm text-emerald-700">
                          {profileMessage}
                        </p>
                      )}
                    </section>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
