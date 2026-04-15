"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "../utils/firebase";
import { resolveUserRole } from "../utils/resolveUserRole";

export function useAuthRole() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    let active = true;

    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!active) return;

      if (!currentUser) {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      setUser(currentUser);
      setLoading(true);

      try {
        const resolvedRole = await resolveUserRole(currentUser.uid);
        if (!active) return;
        setRole(resolvedRole);
      } catch (err) {
        console.error("RoleGuard failed to load role:", err);
        if (!active) return;
        setRole(null);
      } finally {
        if (!active) return;
        setLoading(false);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return { loading, user, role };
}

export default function RoleGuard({
  allowedRoles = [],
  redirectTo = "/",
  loginRedirect = "/login",
  children,
}) {
  const { loading, user, role } = useAuthRole();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      // Not signed in: send the visitor to login with redirect info.
      router.replace(`${loginRedirect}?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!allowedRoles.includes(role)) {
      // Signed in, but role is not allowed for this route.
      router.replace(redirectTo);
    }
  }, [loading, user, role, router, pathname, allowedRoles, redirectTo, loginRedirect]);

  if (loading || !user || !allowedRoles.includes(role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f9fb] text-slate-900">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-center">
          <p className="text-xl font-semibold">Checking access…</p>
          <p className="mt-3 text-sm text-slate-500">
            Verifying your authentication and role before loading this page.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
