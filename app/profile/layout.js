"use client";

import RoleGuard from "../components/RoleGuard";

export default function ProfileLayout({ children }) {
  return (
    <RoleGuard
      allowedRoles={["customer", "vendor", "superadmin"]}
      redirectTo="/"
      loginRedirect="/login"
    >
      {children}
    </RoleGuard>
  );
}
