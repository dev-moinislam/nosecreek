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

  const login = async (email: string, pass: string, chosenRole?: UserRole): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPass = pass.trim();

    // 1. Check Supabase Auth if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: trimmedPass
        });
        if (!error && data?.user) {
          const userRole: UserRole =
            (data.user.user_metadata?.role as UserRole) || chosenRole || "admin";
          const authUser: AuthUser = {
            email: data.user.email || trimmedEmail,
            role: userRole,
            name: data.user.user_metadata?.full_name || (userRole === "admin" ? "Master Admin" : "Clinic Client")
          };
          setUser(authUser);
          setRoleState(userRole);
          localStorage.setItem("adm_auth_user", JSON.stringify(authUser));
          return { success: true };
        }
      } catch {
        // fallthrough to standard credentials check
      }
    }

    // 2. Built-in Master Credentials & PIN Check for 1-Click Instant Access
    if (
      (trimmedEmail === "admin@nosecreek.com" && trimmedPass === "admin123") ||
      trimmedPass === "8590" || // Quick Admin PIN
      (trimmedEmail === "admin" && trimmedPass === "admin")
    ) {
      const authUser: AuthUser = {
        email: "admin@nosecreek.com",
        role: "admin",
        name: "Master Administrator"
      };
      setUser(authUser);
      setRoleState("admin");
      localStorage.setItem("adm_auth_user", JSON.stringify(authUser));
      return { success: true };
    }

    if (
      (trimmedEmail === "client@nosecreek.com" && trimmedPass === "client123") ||
      trimmedPass === "1234" || // Quick Client Safe PIN
      (trimmedEmail === "client" && trimmedPass === "client")
    ) {
      const authUser: AuthUser = {
        email: "client@nosecreek.com",
        role: "client",
        name: "Clinic Manager (Client Mode)"
      };
      setUser(authUser);
      setRoleState("client");
      localStorage.setItem("adm_auth_user", JSON.stringify(authUser));
      return { success: true };
    }

    return {
      success: false,
      error: "Invalid login credentials. Please use your administrator email or access PIN."
    };
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("adm_auth_user");
    }
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
