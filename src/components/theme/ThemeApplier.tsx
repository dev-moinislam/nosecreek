"use client";

import { useEffect } from "react";

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

export default function ThemeApplier() {
  useEffect(() => {
    function applyTheme() {
      try {
        const saved = localStorage.getItem("site_theme_colors");
        if (saved) {
          const colors: ThemeColors = JSON.parse(saved);
          const root = document.documentElement;
          if (colors.primary) root.style.setProperty("--color-primary", colors.primary);
          if (colors.secondary) root.style.setProperty("--color-secondary", colors.secondary);
          if (colors.dark) root.style.setProperty("--color-dark", colors.dark);
          if (colors.accent) root.style.setProperty("--color-accent", colors.accent);
          if (colors.bgLight) root.style.setProperty("--color-bg-light", colors.bgLight);
        }
      } catch {
        // ignore
      }
    }

    applyTheme();
    window.addEventListener("storage", applyTheme);
    window.addEventListener("themeChanged", applyTheme);
    return () => {
      window.removeEventListener("storage", applyTheme);
      window.removeEventListener("themeChanged", applyTheme);
    };
  }, []);

  return null;
}
