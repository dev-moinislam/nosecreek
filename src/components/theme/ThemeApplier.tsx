"use client";

import { useEffect } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

export interface ThemeColors {
  primary: string;
  secondary: string;
  dark: string;
  accent: string;
  bgLight: string;
}

export const defaultTheme: ThemeColors = {
  primary: "#1c9fd8",    // Nose Creek Cyan Blue
  secondary: "#6faf1c",  // Clinical Leaf Green
  dark: "#12303d",       // Deep Slate Teal
  accent: "#8cc63f",     // Bright Lime Green
  bgLight: "#f8fafc"     // Soft Light Background
};

export const themePresets: { name: string; colors: ThemeColors }[] = [
  {
    name: "Classic Nose Creek",
    colors: {
      primary: "#1c9fd8",
      secondary: "#6faf1c",
      dark: "#12303d",
      accent: "#8cc63f",
      bgLight: "#f8fafc"
    }
  },
  {
    name: "Deep Ocean Navy",
    colors: {
      primary: "#0284c7",
      secondary: "#0d9488",
      dark: "#0f172a",
      accent: "#38bdf8",
      bgLight: "#f0f9ff"
    }
  },
  {
    name: "Modern Emerald Health",
    colors: {
      primary: "#059669",
      secondary: "#10b981",
      dark: "#064e3b",
      accent: "#34d399",
      bgLight: "#ecfdf5"
    }
  },
  {
    name: "Royal Purple Clinical",
    colors: {
      primary: "#7c3aed",
      secondary: "#0284c7",
      dark: "#1e1b4b",
      accent: "#a855f7",
      bgLight: "#faf5ff"
    }
  },
  {
    name: "Warm Sunset Orange",
    colors: {
      primary: "#d97706",
      secondary: "#ea580c",
      dark: "#292524",
      accent: "#f59e0b",
      bgLight: "#fffbeb"
    }
  }
];

function adjustHex(hex: string, amount: number): string {
  try {
    let clean = hex.replace("#", "");
    if (clean.length === 3) {
      clean = clean.split("").map((c) => c + c).join("");
    }
    const num = parseInt(clean, 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  } catch {
    return hex;
  }
}

export function applyThemeTokens(colors: ThemeColors) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const primaryDark = adjustHex(colors.primary, -25);
  const secondaryDark = adjustHex(colors.secondary, -25);

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

  styleEl.innerHTML = `
    :root {
      --nc-blue: ${colors.primary} !important;
      --nc-blue-dark: ${primaryDark} !important;
      --primary: ${colors.primary} !important;
      --primary-hover: ${primaryDark} !important;
      --color-primary: ${colors.primary} !important;
      --nc-green: ${colors.secondary} !important;
      --nc-green-light: ${colors.accent || colors.secondary} !important;
      --secondary: ${colors.secondary} !important;
      --secondary-hover: ${colors.accent || colors.secondary} !important;
      --color-secondary: ${colors.secondary} !important;
      --accent: ${colors.accent || colors.secondary} !important;
      --color-accent: ${colors.accent || colors.secondary} !important;
      --nc-dark: ${colors.dark} !important;
      --dark: ${colors.dark} !important;
      --color-dark: ${colors.dark} !important;
      --nc-bg-blue: ${colors.bgLight || "#f2f8fb"} !important;
      --bg-offset: ${colors.bgLight || "#f8fafc"} !important;
      --adm-primary: ${colors.primary} !important;
      --adm-sidebar: ${colors.dark} !important;
    }
  `;
}

export default function ThemeApplier() {
  useEffect(() => {
    function loadAndApplyTheme() {
      try {
        const saved = localStorage.getItem("site_theme_colors");
        if (saved) {
          const colors: ThemeColors = JSON.parse(saved);
          applyThemeTokens(colors);
        }
      } catch {
        // ignore
      }
    }

    // 1. Instant local render
    loadAndApplyTheme();

    // 2. Background sync from Supabase if connected
    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          const { data } = await supabase
            .from("site_settings")
            .select("theme_colors")
            .eq("id", "main")
            .single();

          if (data && data.theme_colors) {
            applyThemeTokens(data.theme_colors);
            try {
              localStorage.setItem("site_theme_colors", JSON.stringify(data.theme_colors));
            } catch {}
          }
        } catch {
          // ignore error
        }
      })();
    }

    // 3. React instantly to real-time events across windows & modals
    window.addEventListener("storage", loadAndApplyTheme);
    window.addEventListener("themeChanged", loadAndApplyTheme);
    return () => {
      window.removeEventListener("storage", loadAndApplyTheme);
      window.removeEventListener("themeChanged", loadAndApplyTheme);
    };
  }, []);

  return null;
}
