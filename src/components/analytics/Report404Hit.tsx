"use client";

import { useEffect } from "react";

export default function Report404Hit() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const path = window.location.pathname;
    const referrer = document.referrer;

    // Do not log dashboard or api paths
    if (path.startsWith("/admin") || path.startsWith("/api")) return;

    try {
      fetch("/api/admin/redirects/log-404", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, referrer }),
      }).catch(() => {});
    } catch {}
  }, []);

  return null;
}
