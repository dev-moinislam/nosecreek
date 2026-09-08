"use client";

import { useEffect } from "react";

export default function Report404Hit() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const rawPath = window.location.pathname;
    const lowerPath = rawPath.toLowerCase();
    const cleanPath = lowerPath.endsWith("/") && lowerPath.length > 1 ? lowerPath.slice(0, -1) : lowerPath;
    const referrer = document.referrer;

    // Do not log dashboard, next internal, or api paths
    if (cleanPath.startsWith("/admin") || cleanPath.startsWith("/api") || cleanPath.startsWith("/_next")) return;

    // First check if a redirect rule exists for this broken link
    fetch("/api/admin/redirects")
      .then((res) => res.json())
      .then((data) => {
        const rules = data.rules || [];
        const matchingRule = rules.find((r: any) => {
          if (!r.enabled) return false;
          const from = (r.fromPath || "").toLowerCase().trim();
          const normalizedFrom = from.endsWith("/") && from.length > 1 ? from.slice(0, -1) : from;
          return normalizedFrom === cleanPath || normalizedFrom === lowerPath;
        });

        if (matchingRule && matchingRule.toPath) {
          // Dynamic redirect match! Take user to the destination immediately without reporting 404
          window.location.replace(matchingRule.toPath);
          return;
        }

        // No redirect rule matched -> report genuine 404 hit
        fetch("/api/admin/redirects/log-404", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: rawPath, referrer }),
        }).catch(() => {});
      })
      .catch(() => {
        // Fallback report
        fetch("/api/admin/redirects/log-404", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: rawPath, referrer }),
        }).catch(() => {});
      });
  }, []);

  return null;
}
