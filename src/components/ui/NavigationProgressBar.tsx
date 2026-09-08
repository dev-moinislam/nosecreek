"use client";

import React, { useEffect, useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  // Complete and hide bar when page navigation finishes
  useEffect(() => {
    if (isNavigating) {
      setProgress(100);
      const timer = setTimeout(() => {
        setIsNavigating(false);
        setProgress(0);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Intercept client link clicks
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

      // Start navigation animation
      setIsNavigating(true);
      setProgress(25);

      const t1 = setTimeout(() => setProgress((p) => (p < 60 ? 60 : p)), 180);
      const t2 = setTimeout(() => setProgress((p) => (p < 85 ? 85 : p)), 400);

      // Auto-cancel if navigation fails or takes unusually long (>10s)
      const timeout = setTimeout(() => {
        setIsNavigating(false);
        setProgress(0);
      }, 10000);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(timeout);
      };
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleAnchorClick, { capture: true });
    };
  }, []);

  if (!isNavigating && progress === 0) return null;

  return (
    <>
      {/* Top Gradient Progress Bar */}
      <div
        id="nc-navigation-progress-container"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 3.5,
          zIndex: 999999,
          pointerEvents: "none",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg, #1c9fd8 0%, #6faf1c 50%, #8cc63f 100%)",
            boxShadow: "0 0 12px rgba(28, 159, 216, 0.7), 0 0 6px rgba(111, 175, 28, 0.6)",
            transition: progress === 100 ? "width 0.2s ease-out, opacity 0.3s ease-out" : "width 0.35s cubic-bezier(0.1, 0.5, 0.1, 1)",
            opacity: progress === 100 ? 0.2 : 1
          }}
        />
      </div>

      {/* Floating Corner Indicator Pill for instant interactive feedback */}
      <div
        id="nc-loading-floating-indicator"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 999998,
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "rgba(18, 48, 61, 0.94)",
          color: "#ffffff",
          padding: "9px 16px",
          borderRadius: 999,
          boxShadow: "0 8px 24px rgba(18, 48, 61, 0.28)",
          backdropFilter: "blur(6px)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          fontFamily: "'Poppins', sans-serif",
          fontSize: 12.5,
          fontWeight: 600,
          animation: "slideDownFade 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            border: "2px solid rgba(255, 255, 255, 0.25)",
            borderTopColor: "#6faf1c",
            animation: "ncSpin 0.7s linear infinite"
          }}
        />
        <span>Loading page...</span>
      </div>
    </>
  );
}
