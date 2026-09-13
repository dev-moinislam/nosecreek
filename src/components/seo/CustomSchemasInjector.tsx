"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { CustomSchemaItem } from "@/types/content";
import settingsData from "@/data/settings.json";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

function matchesTargetScope(
  scope: "site_wide" | "homepage" | "specific",
  targetPages: string[] = [],
  currentPath: string
): boolean {
  if (scope === "site_wide") {
    return true;
  }

  // Normalize path: clean off query string, trailing slashes (except root '/')
  const cleanPath = (currentPath.split("?")[0].split("#")[0].toLowerCase().trim() || "/").replace(/\/+$/, "") || "/";

  if (scope === "homepage") {
    return cleanPath === "/" || cleanPath === "";
  }

  if (scope === "specific") {
    if (!targetPages || targetPages.length === 0) {
      return false;
    }
    return targetPages.some((rawTarget) => {
      let normTarget = (rawTarget.toLowerCase().trim() || "/").replace(/\/+$/, "") || "/";
      if (!normTarget.startsWith("/")) normTarget = "/" + normTarget;

      // Exact match
      if (normTarget === cleanPath) return true;

      // Wildcard match, e.g. /services/* or /services*
      if (normTarget.endsWith("/*")) {
        const prefix = normTarget.slice(0, -2);
        return cleanPath === prefix || cleanPath.startsWith(prefix + "/");
      }
      if (normTarget.endsWith("*")) {
        const prefix = normTarget.slice(0, -1);
        return cleanPath === prefix || cleanPath.startsWith(prefix + "/");
      }

      return false;
    });
  }

  return false;
}

interface CustomSchemasInjectorProps {
  initialSchemas?: CustomSchemaItem[];
}

/**
 * CustomSchemasInjector:
 * Injects multiple business and custom schemas dynamically into the live website
 * according to each schema's configured target scope (Site-wide, Homepage, or Specific Pages).
 */
export default function CustomSchemasInjector({ initialSchemas }: CustomSchemasInjectorProps = {}) {
  const pathname = usePathname() || "/";
  const [mounted, setMounted] = useState(false);

  // Initial schemas from SSR prop or static settings data
  const [schemas, setSchemas] = useState<CustomSchemaItem[]>(() => {
    if (initialSchemas && Array.isArray(initialSchemas)) {
      return initialSchemas;
    }
    return (settingsData as any).customSchemas || [];
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keep state in sync if initialSchemas changes from server
  useEffect(() => {
    if (initialSchemas && Array.isArray(initialSchemas)) {
      setSchemas(initialSchemas);
    }
  }, [initialSchemas]);

  useEffect(() => {
    async function loadLiveSchemas() {
      // 1. Try local storage sync from admin if populated
      try {
        const local = localStorage.getItem("adm_settings");
        if (local) {
          const parsed = JSON.parse(local);
          const custom = parsed.customSchemas !== undefined ? parsed.customSchemas : (parsed.marketing?.customSchemas || parsed.settings?.customSchemas);
          if (Array.isArray(custom) && custom.length > 0) {
            setSchemas(custom);
            return;
          }
        }
      } catch {}

      // 2. Fetch canonical settings from /api/content?type=settings
      try {
        const res = await fetch("/api/content?type=settings");
        if (res.ok) {
          const data = await res.json();
          const custom = data.customSchemas !== undefined ? data.customSchemas : data.marketing?.customSchemas;
          if (Array.isArray(custom)) {
            setSchemas(custom);
            return;
          }
        }
      } catch {}

      // 3. Fallback direct to Supabase
      if (isSupabaseConfigured && supabase) {
        try {
          const { data } = await supabase
            .from("site_settings")
            .select("marketing")
            .eq("id", "main")
            .maybeSingle();
          if (data?.marketing?.customSchemas && Array.isArray(data.marketing.customSchemas)) {
            setSchemas(data.marketing.customSchemas);
          }
        } catch {}
      }
    }

    loadLiveSchemas();

    // Listen to real-time settings update events
    window.addEventListener("settingsUpdated", loadLiveSchemas);
    return () => window.removeEventListener("settingsUpdated", loadLiveSchemas);
  }, []);

  // Filter schemas that are enabled and apply to current pathname
  const applicableSchemas = schemas.filter((s) => {
    if (!s.enabled || !s.schemaJson) return false;
    if (!matchesTargetScope(s.scope, s.targetPages, pathname)) return false;

    // During SSR, site_wide is rendered by RootLayout in <head>, and homepage is rendered by page.tsx.
    // So only render specific route schemas during SSR to avoid duplicate SSR tags.
    if (!mounted) {
      return s.scope === "specific";
    }

    // On client: if already in DOM from SSR, don't duplicate
    const existing = document.getElementById(`schema-${s.id || s.title}`);
    if (existing) return false;

    return true;
  });

  if (applicableSchemas.length === 0) {
    return null;
  }

  return (
    <>
      {applicableSchemas.map((item) => {
        let jsonPayload: any = null;
        try {
          jsonPayload = typeof item.schemaJson === "string" ? JSON.parse(item.schemaJson) : item.schemaJson;
        } catch (e) {
          // If JSON parse fails, skip broken JSON
          console.warn(`[CustomSchemasInjector] Invalid JSON in schema "${item.title}":`, e);
          return null;
        }

        return (
          <script
            key={item.id || item.title}
            id={`schema-${item.id || item.title}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonPayload) }}
          />
        );
      })}
    </>
  );
}
