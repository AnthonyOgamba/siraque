"use client";

import RoleGuard from "../components/RoleGuard";

export default function NotificationsLayout({ children }) {
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
