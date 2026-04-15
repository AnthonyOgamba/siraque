"use client";

import RoleGuard from "../components/RoleGuard";
import VendorDashboardShell from "./VendorDashboardShell";

export default function VendorDashboardLayout({ children }) {
  return (
    <RoleGuard allowedRoles={["vendor"]} redirectTo="/" loginRedirect="/login">
      <VendorDashboardShell>{children}</VendorDashboardShell>
    </RoleGuard>
  );
}
