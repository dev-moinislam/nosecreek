"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function NavigationLoadingIndicator() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  // Complete and hide when page navigation finishes
  useEffect(() => {
    if (isNavigating) {
      const timer = setTimeout(() => {
        setIsNavigating(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Intercept internal link clicks to display instant loading spinner
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Ignore external, anchor hash only, new tab, download or mail/tel links
      if (
        href.startsWith("#") ||
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        target.getAttribute("target") === "_blank" ||
        target.hasAttribute("download") ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      // If navigation is within same exact URL, ignore
      const currentUrl = window.location.pathname + window.location.search;
      if (href === currentUrl || href === window.location.pathname) {
        return;
      }

      // Trigger animated clinical loading badge
      setIsNavigating(true);

      // Auto-cancel if navigation fails or takes unusually long (>10s)
      const timeout = setTimeout(() => {
        setIsNavigating(false);
      }, 10000);

      return () => clearTimeout(timeout);
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleAnchorClick, { capture: true });
    };
  }, []);

  if (!isNavigating) return null;

  return (
    <div
      id="nc-loading-floating-indicator"
      style={{
        position: "fixed",
        bottom: 28,
        right: 28,
        zIndex: 999998,
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "rgba(18, 48, 61, 0.95)",
        color: "#ffffff",
        padding: "10px 18px",
        borderRadius: 999,
        boxShadow: "0 10px 28px rgba(18, 48, 61, 0.35)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        fontFamily: "'Poppins', sans-serif",
        fontSize: 13,
        fontWeight: 600,
        animation: "slideDownFade 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
      }}
    >
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          border: "2.5px solid rgba(255, 255, 255, 0.2)",
          borderTopColor: "#6faf1c",
          borderRightColor: "#1c9fd8",
          animation: "ncSpin 0.75s linear infinite"
        }}
      />
      <span>Loading...</span>
    </div>
  );
}
