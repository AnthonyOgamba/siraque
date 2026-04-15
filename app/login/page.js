"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "../utils/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { resolveUserRole } from "../utils/resolveUserRole";

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function routeUserByRole(uid) {
    const role = await resolveUserRole(uid);

    if (role === "vendor") {
      router.push("/vendor-dashboard");
    } else if (role === "superadmin") {
      router.push("/admin");
    } else {
      router.push("/homepage");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const { email, password } = formData;

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await routeUserByRole(userCredential.user.uid);
    } catch (err) {
      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/user-not-found"
      ) {
        setError("Invalid email or password.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("Failed to sign in. Please try again.");
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
            alt="Siraque login"
            className="h-full w-full object-cover opacity-50"
          />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-16 text-white w-full">
          <div>
            <h1 className="text-4xl font-bold mb-4">Siraque</h1>
            <p className="text-lg max-w-md text-slate-200">
              Sign in to manage your account and access your marketplace experience.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg">Customer Access</h3>
              <p className="text-sm text-slate-300">
                Browse listings and interact with marketplace content.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Vendor Access</h3>
              <p className="text-sm text-slate-300">
                Manage your products and services from your vendor dashboard.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Simple Authentication</h3>
              <p className="text-sm text-slate-300">
                Sign in with email and password using Firebase Authentication.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-orange-600 mb-2">
              Welcome Back
            </p>
            <h2 className="text-3xl font-bold text-slate-900">Sign in to your account</h2>
            <p className="text-slate-600 mt-2">
              Don’t have an account?{" "}
              <Link href="/signup" className="text-orange-600 font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full rounded-md border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-orange-600 py-3 font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
