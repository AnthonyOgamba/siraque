"use client";

import RoleGuard from "../components/RoleGuard";

export default function CheckoutLayout({ children }) {
  return (
    <RoleGuard
      allowedRoles={["customer"]}
      redirectTo="/"
      loginRedirect="/login"
    >
      {children}
    </RoleGuard>
  );
}
