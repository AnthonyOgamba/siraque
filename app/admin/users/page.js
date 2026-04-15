"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../utils/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [messageDrafts, setMessageDrafts] = useState({});

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    async function loadUsers() {
      setLoading(true);
      setError("");

      try {
        const snapshot = await getDocs(collection(db, "users"));
        setUsers(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
      } catch (err) {
        console.error("Admin users load error:", err);
        setError("Unable to load user accounts.");
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  async function handleUpdateUser(userId, updates) {
    try {
      await updateDoc(doc(db, "users", userId), updates);
      setStatusMessage("User profile updated successfully.");
      setTimeout(() => setStatusMessage(""), 4000);
      const snapshot = await getDocs(collection(db, "users"));
      setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Admin user update error:", err);
      setError("Unable to update user details.");
    }
  }

  async function handleToggleStatus(user) {
    const nextStatus = user.status === "suspended" ? "active" : "suspended";
    await handleUpdateUser(user.id, {
      status: nextStatus,
      suspendedAt: nextStatus === "suspended" ? serverTimestamp() : null,
    });
  }

  async function handleDeleteUser(userId) {
    if (!window.confirm("Delete this user and remove their platform account?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "users", userId));
      setStatusMessage("User deleted successfully.");
      setTimeout(() => setStatusMessage(""), 4000);
      setUsers((currentUsers) => currentUsers.filter((user) => user.id !== userId));
    } catch (err) {
      console.error("Admin user delete error:", err);
      setError("Unable to delete user.");
    }
  }

  async function handleSendMessage(userId) {
    const message = messageDrafts[userId]?.trim();
    if (!message) {
      setError("Enter a message before sending.");
      return;
    }

    try {
      await addDoc(collection(db, "notifications"), {
        recipientId: userId,
        senderId: currentUser?.uid || "admin",
        senderRole: "superadmin",
        message,
        read: false,
        createdAt: serverTimestamp(),
      });

      setStatusMessage("Notification sent successfully.");
      setTimeout(() => setStatusMessage(""), 4000);
      setMessageDrafts((prev) => ({ ...prev, [userId]: "" }));
      setError("");
    } catch (err) {
      console.error("Admin notification send error:", err);
      setError("Unable to send notification.");
    }
  }

  function handleDraftChange(userId, value) {
    setMessageDrafts((prev) => ({ ...prev, [userId]: value }));
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-10 shadow-sm border border-slate-200">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] font-semibold text-orange-600">
              User management
            </p>
            <h2 className="mt-2 text-4xl font-bold text-slate-900">Manage customers and vendors</h2>
            <p className="mt-3 text-slate-600 max-w-2xl">
              View every registered account, change roles, suspend activity, delete users, or send platform notifications.
            </p>
          </div>

          <div className="rounded-3xl bg-orange-50 px-6 py-4 text-sm font-semibold text-orange-700">
            <p>Current admin</p>
            <p className="mt-1 text-slate-900">{currentUser?.email || "Not signed in"}</p>
          </div>
        </div>

        {statusMessage && <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{statusMessage}</div>}
        {error && <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      </section>

      <section className="space-y-6">
        {loading ? (
          <div className="rounded-[2rem] bg-white p-10 shadow-sm border border-slate-200 text-slate-500">Loading users...</div>
        ) : (
          users.map((user) => (
            <div key={user.id} className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-2xl">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                      {user.role || "customer"}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                      {user.status || "active"}
                    </span>
                  </div>
                  <h3 className="mt-4 text-2xl font-bold text-slate-900">{user.fullName || "Unnamed user"}</h3>
                  <p className="mt-2 text-sm text-slate-500">{user.email}</p>
                  <p className="mt-3 text-sm text-slate-500">
                    Created {user.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString() : "unknown"}
                  </p>
                </div>

                <div className="grid gap-3 sm:w-72">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(user)}
                    className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
                  >
                    {user.status === "suspended" ? "Reactivate account" : "Suspend account"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteUser(user.id)}
                    className="rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 hover:bg-red-100 transition"
                  >
                    Delete user
                  </button>
                </div>
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-slate-700">Role</label>
                  <select
                    value={user.role || "customer"}
                    onChange={(event) =>
                      handleUpdateUser(user.id, { role: event.target.value })
                    }
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  >
                    <option value="customer">Customer</option>
                    <option value="vendor">Vendor</option>
                    <option value="superadmin">Superadmin</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-slate-700">Send notification</label>
                  <textarea
                    value={messageDrafts[user.id] || ""}
                    onChange={(event) => handleDraftChange(user.id, event.target.value)}
                    placeholder="Write a message to this user"
                    className="min-h-[120px] w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendMessage(user.id)}
                    className="rounded-2xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-700 transition"
                  >
                    Send notification
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
