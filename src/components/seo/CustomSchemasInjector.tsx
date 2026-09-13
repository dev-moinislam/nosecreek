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
  const normPath = currentPath.toLowerCase();

  if (scope === "site_wide") {
    return true;
  }

  if (scope === "homepage") {
    return normPath === "/" || normPath === "";
  }

  if (scope === "specific") {
    if (!targetPages || targetPages.length === 0) {
      return false;
    }
    return targetPages.some((target) => {
      const normTarget = target.toLowerCase().trim();
      if (!normTarget) return false;
      if (normTarget === normPath) return true;
      if (normTarget.endsWith("/*")) {
        const prefix = normTarget.slice(0, -2);
        return normPath.startsWith(prefix);
      }
      if (normTarget.endsWith("*")) {
        const prefix = normTarget.slice(0, -1);
        return normPath.startsWith(prefix);
      }
      return false;
    });
  }

  return false;
}

/**
 * CustomSchemasInjector:
 * Injects multiple business and custom schemas dynamically into the live website
 * according to each schema's configured target scope (Site-wide, Homepage, or Specific Pages).
 */
export default function CustomSchemasInjector() {
  const pathname = usePathname() || "/";

  // Initial schemas from static settings data
  const initialSchemas: CustomSchemaItem[] = (settingsData as any).customSchemas || [];
  const [schemas, setSchemas] = useState<CustomSchemaItem[]>(initialSchemas);

  useEffect(() => {
    function loadLiveSchemas() {
      // 1. Try local storage sync from admin
      try {
        const local = localStorage.getItem("adm_settings");
        if (local) {
          const parsed = JSON.parse(local);
          const custom = parsed.customSchemas || parsed.settings?.customSchemas;
          if (Array.isArray(custom)) {
            setSchemas(custom);
            return;
          }
        }
      } catch {}

      // 2. Try Supabase
      if (isSupabaseConfigured && supabase) {
        (async () => {
          try {
            const { data } = await supabase
              .from("site_settings")
              .select("marketing")
              .eq("id", "main")
              .single();
            if (data?.marketing?.customSchemas && Array.isArray(data.marketing.customSchemas)) {
              setSchemas(data.marketing.customSchemas);
            }
          } catch {
            // ignore
          }
        })();
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
    return matchesTargetScope(s.scope, s.targetPages, pathname);
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
          // If JSON parse fails, render as raw string or skip broken JSON
          console.warn(`[CustomSchemasInjector] Invalid JSON in schema "${item.title}":`, e);
          return null;
        }

        return (
          <script
            key={item.id || item.title}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonPayload) }}
          />
        );
      })}
    </>
  );
}
