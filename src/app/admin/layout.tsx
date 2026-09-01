"use client";

import React, { useState } from "react";
import "@/components/admin/admin.css";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { RoleProvider } from "@/components/admin/RoleGuard";

export default function AdminRootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <RoleProvider>
      <div className="adm-app">
        {/* Sidebar Navigation */}
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content Wrapper */}
        <div className="adm-main-wrapper">
          <AdminHeader
            onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
            title="Clinic Management Dashboard"
          />

          <main className="adm-content">{children}</main>
        </div>
      </div>
    </RoleProvider>
  );
}
