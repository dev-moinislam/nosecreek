"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole } from "@/lib/supabase/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export interface AuthUser {
  email: string;
  role: UserRole;
  name: string;
}

interface RoleContextType {
  user: AuthUser | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, pass: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setRole: (role: UserRole) => void;
  isAdmin: boolean;
  isClient: boolean;
  canDelete: boolean;
  canEditMarketingScripts: boolean;
  canEditSlugs: boolean;
}

const RoleContext = createContext<RoleContextType>({
  user: null,
  role: "admin",
  isAuthenticated: false,
  login: async () => ({ success: false }),
  logout: () => {},
  setRole: () => {},
  isAdmin: true,
  isClient: false,
  canDelete: true,
  canEditMarketingScripts: true,
  canEditSlugs: true
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRoleState] = useState<UserRole>("admin");
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAuth = localStorage.getItem("adm_auth_user");
      if (savedAuth) {
        try {
          const parsed = JSON.parse(savedAuth);
          setUser(parsed);
          setRoleState(parsed.role || "admin");
        } catch {
          // ignore
        }
      }
      setCheckedAuth(true);
    }
  }, []);

  const login = async (usernameOrEmail: string, passOrPin: string, chosenRole?: UserRole): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usernameOrEmail,
          passwordOrPin: passOrPin,
          portal: chosenRole || "admin"
        })
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        const authUser: AuthUser = {
          email: data.user.email || (data.user.role === "admin" ? "admin@nosecreek.com" : "client@nosecreek.com"),
          role: data.user.role,
          name: data.user.full_name || (data.user.role === "admin" ? "Master Administrator" : "Clinic Manager")
        };
        setUser(authUser);
        setRoleState(data.user.role);
        if (typeof window !== "undefined") {
          localStorage.setItem("adm_auth_user", JSON.stringify(authUser));
        }
        return { success: true };
      }

      return {
        success: false,
        error: data.error || "Invalid username, password, or PIN."
      };
    } catch (err: any) {
      console.error("Login API request failed:", err);
      return {
        success: false,
        error: "Unable to reach authentication server. Please try again."
      };
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("adm_auth_user");
    }
    fetch("/api/admin/auth/logout", { method: "POST" }).catch(() => {});
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut().catch(() => {});
    }
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (user) {
      const updated = { ...user, role: newRole };
      setUser(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem("adm_auth_user", JSON.stringify(updated));
      }
    }
  };

  const isAdmin = role === "admin";
  const isClient = role === "client";
  const isAuthenticated = Boolean(user);

  return (
    <RoleContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        login,
        logout,
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
