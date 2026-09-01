"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole } from "@/lib/supabase/types";

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  isAdmin: boolean;
  isClient: boolean;
  canDelete: boolean;
  canEditMarketingScripts: boolean;
  canEditSlugs: boolean;
}

const RoleContext = createContext<RoleContextType>({
  role: "admin",
  setRole: () => {},
  isAdmin: true,
  isClient: false,
  canDelete: true,
  canEditMarketingScripts: true,
  canEditSlugs: true
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>("admin");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("adm_user_role") as UserRole;
      if (saved === "admin" || saved === "client") {
        setRoleState(saved);
      }
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (typeof window !== "undefined") {
      localStorage.setItem("adm_user_role", newRole);
    }
  };

  const isAdmin = role === "admin";
  const isClient = role === "client";

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        isAdmin,
        isClient,
        canDelete: isAdmin,
        canEditMarketingScripts: isAdmin,
        canEditSlugs: isAdmin
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}
