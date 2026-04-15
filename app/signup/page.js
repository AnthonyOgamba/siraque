"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, db } from "../utils/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function SignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "customer",
    terms: false,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const { fullName, email, password, confirmPassword, role, terms } = formData;

    if (!fullName || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!terms) {
      setError("You must agree to the terms and privacy policy.");
      return;
    }

    try {
      setLoading(true);

      console.log("SELECTED ROLE:", role);

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log("AUTH USER CREATED:", user.uid);

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        fullName,
        email,
        role,
        status: "active",
        createdAt: serverTimestamp(),
      });

      console.log("FIRESTORE USER SAVED");

      setSuccess(`Account created successfully as ${role}. Redirecting...`);

      setTimeout(() => {
        if (role === "vendor") {
          router.push("/vendor-dashboard");
        } else if (role === "superadmin") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      }, 1500);
    } catch (err) {
      console.log("SIGNUP ERROR CODE:", err.code);
      console.log("SIGNUP ERROR MESSAGE:", err.message);

      if (err.code === "auth/email-already-in-use") {
        setError("An account with this email already exists.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak.");
      } else if (err.code === "permission-denied") {
        setError("Firestore permissions are blocking account creation.");
      } else {
        setError(`Failed to create account: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex bg-white text-slate-900">
      <section className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBpms6ra1W5nMVW_q0mcwjMFFIN97kbPR2FOQb-bFSiahyAOR-0ppExz423ZwnUVyXSR90Aep0bcmQ9Zac64VmvtM0-hUeBa6Z0fTBZGqACz5KmvGlQHAquVvsmONIyhfioyDOSWbW_-kMx5_2YAJ3No2ImKe4FIzD44RKQfozH29YLhXasIkX5smp_UIC1wFLYU3ghidUrd3KvUvKxW7t7t6dcfPcjOuRoMD1gUii5m_L6tP0PnFlkggbslO9txH-ZwnllRZrGJda9"
            alt="Siraque signup"
            className="h-full w-full object-cover opacity-50"
          />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-16 text-white w-full">
          <div>
            <h1 className="text-4xl font-bold mb-4">Siraque</h1>
            <p className="text-lg max-w-md text-slate-200">
              Create an account to buy, sell, and manage products and services in one platform.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg">Customer Access</h3>
              <p className="text-sm text-slate-300">
                Browse listings, explore services, and interact with marketplace offerings.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Vendor Access</h3>
              <p className="text-sm text-slate-300">
                Create and manage products and services from your dashboard.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Role-Based System</h3>
              <p className="text-sm text-slate-300">
                Your account type determines the experience and features you see.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-orange-600 mb-2">
              Get Started
            </p>
            <h2 className="text-3xl font-bold text-slate-900">Create your account</h2>
            <p className="text-slate-600 mt-2">
              Choose whether you want to join Siraque as a customer, vendor, or superadmin.
            </p>
            <p className="text-slate-600 mt-2">
              Already have an account?{" "}
              <Link href="/login" className="text-orange-600 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full rounded-md border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@siraque.com"
                className="w-full rounded-md border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-3">
                Choose Account Type
              </label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      role: "customer",
                    }))
                  }
                  className={`rounded-lg border p-4 text-left transition ${
                    formData.role === "customer"
                      ? "border-orange-600 bg-orange-50 ring-2 ring-orange-200"
                      : "border-slate-300 bg-white hover:border-orange-400"
                  }`}
                >
                  <h3 className="text-base font-semibold text-slate-900">Customer</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Browse products and services, explore listings, and interact with marketplace offerings.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      role: "vendor",
                    }))
                  }
                  className={`rounded-lg border p-4 text-left transition ${
                    formData.role === "vendor"
                      ? "border-orange-600 bg-orange-50 ring-2 ring-orange-200"
                      : "border-slate-300 bg-white hover:border-orange-400"
                  }`}
                >
                  <h3 className="text-base font-semibold text-slate-900">Vendor</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Create and manage product and service listings from your vendor dashboard.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      role: "superadmin",
                    }))
                  }
                  className={`rounded-lg border p-4 text-left transition ${
                    formData.role === "superadmin"
                      ? "border-orange-600 bg-orange-50 ring-2 ring-orange-200"
                      : "border-slate-300 bg-white hover:border-orange-400"
                  }`}
                >
                  <h3 className="text-base font-semibold text-slate-900">Superadmin</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Manage vendors, customers, and platform content from the admin dashboard.
                  </p>
                </button>
              </div>


              <p className="mt-3 text-sm text-slate-600">
                Selected account type:{" "}
                <span className="font-semibold text-slate-900 capitalize">
                  {formData.role}
                </span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className="w-full rounded-md border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  className="w-full rounded-md border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
                className="mt-1"
              />
              <label className="text-sm text-slate-600">
                I agree to the Terms of Service and Privacy Policy.
              </label>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-orange-600 py-3 font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}