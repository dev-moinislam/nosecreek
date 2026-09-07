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

export function adjustHex(hex: string, amount: number): string {
  try {
    let clean = (hex || "").replace("#", "");
    if (clean.length === 3) {
      clean = clean.split("").map((c) => c + c).join("");
    }
    const num = parseInt(clean, 16);
    if (isNaN(num)) return hex;
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  } catch {
    return hex;
  }
}

export function buildThemeCss(colors: ThemeColors): string {
  if (!colors) return "";
  const primaryDark = adjustHex(colors.primary, -25);
  return `
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
      --color-bg-light: ${colors.bgLight || "#f8fafc"} !important;
      --adm-primary: ${colors.primary} !important;
      --adm-sidebar: ${colors.dark} !important;
    }
  `;
}
