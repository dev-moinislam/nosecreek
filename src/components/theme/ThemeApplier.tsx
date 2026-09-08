"use client";

import { useEffect } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import { ThemeColors, defaultTheme, themePresets, adjustHex, buildThemeCss } from "@/lib/theme";

export { defaultTheme, themePresets, buildThemeCss };
export type { ThemeColors };

export function applyThemeTokens(colors: ThemeColors) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const primaryDark = adjustHex(colors.primary, -25);

  // Set standard tokens on documentElement
  root.style.setProperty("--nc-blue", colors.primary);
  root.style.setProperty("--nc-blue-dark", primaryDark);
  root.style.setProperty("--primary", colors.primary);
  root.style.setProperty("--primary-hover", primaryDark);
  root.style.setProperty("--color-primary", colors.primary);

  root.style.setProperty("--nc-green", colors.secondary);
  root.style.setProperty("--nc-green-light", colors.accent || colors.secondary);
  root.style.setProperty("--secondary", colors.secondary);
  root.style.setProperty("--secondary-hover", colors.accent || colors.secondary);
  root.style.setProperty("--color-secondary", colors.secondary);

  root.style.setProperty("--accent", colors.accent || colors.secondary);
  root.style.setProperty("--color-accent", colors.accent || colors.secondary);

  root.style.setProperty("--nc-dark", colors.dark);
  root.style.setProperty("--dark", colors.dark);
  root.style.setProperty("--color-dark", colors.dark);

  root.style.setProperty("--nc-bg-blue", colors.bgLight || "#f2f8fb");
  root.style.setProperty("--bg-offset", colors.bgLight || "#f8fafc");
  root.style.setProperty("--color-bg-light", colors.bgLight || "#f8fafc");

  root.style.setProperty("--adm-primary", colors.primary);
  root.style.setProperty("--adm-sidebar", colors.dark);

  // Inject or update global high-priority style tag
  let styleEl = document.getElementById("nc-dynamic-theme-style") as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "nc-dynamic-theme-style";
    document.head.appendChild(styleEl);
  }

  styleEl.innerHTML = buildThemeCss(colors);
}

export default function ThemeApplier({ initialTheme }: { initialTheme?: ThemeColors }) {
  useEffect(() => {
    function loadAndApplyTheme() {
      try {
        const saved = localStorage.getItem("site_theme_colors");
        if (saved) {
          const colors: ThemeColors = JSON.parse(saved);
          applyThemeTokens(colors);
          return;
        }
      } catch {
        // ignore
      }

      if (initialTheme) {
        applyThemeTokens(initialTheme);
      }
    }

    // 1. Instant local render
    loadAndApplyTheme();

    // 2. Background sync from Supabase if connected
    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          const { data, error } = await supabase
            .from("site_settings")
            .select("marketing")
            .eq("id", "main")
            .single();

          if (!error && data?.marketing) {
            const colors = (data.marketing as any)?.theme_colors;
            if (colors) {
              applyThemeTokens(colors);
              try {
                localStorage.setItem("site_theme_colors", JSON.stringify(colors));
              } catch {}
            }
          }
        } catch {
          // ignore error
        }
      })();
    }

    function loadAndApplyFavicon() {
      try {
        const saved = localStorage.getItem("adm_settings");
        if (saved) {
          const parsed = JSON.parse(saved);
          const icon = parsed.favicon || parsed.seo?.favicon || parsed.settings?.favicon || parsed.settings?.seo?.favicon;
          if (icon) {
            let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
            if (link) link.href = icon;
          }
        }
      } catch {}
    }
    loadAndApplyFavicon();

    // 3. React instantly to real-time events across windows & modals
    window.addEventListener("storage", loadAndApplyTheme);
    window.addEventListener("themeChanged", loadAndApplyTheme);
    window.addEventListener("settingsUpdated", loadAndApplyFavicon);
    return () => {
      window.removeEventListener("storage", loadAndApplyTheme);
      window.removeEventListener("themeChanged", loadAndApplyTheme);
      window.removeEventListener("settingsUpdated", loadAndApplyFavicon);
    };
  }, [initialTheme]);

  return null;
}
