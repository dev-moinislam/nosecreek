"use client";

import React, { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

const DEFAULT_FLOATING_CODE = `<div data-rw-flash="49021"></div>
<script>var script = document.createElement("script");script.type = "module";script.src = "https://widgets.revue.us/2.0/rw-widget-flash.js";document.getElementsByTagName("head")[0].appendChild(script);</script>`;

export default function FloatingReviewsWidget() {
  const [enabled, setEnabled] = useState(true);
  const [widgetCode, setWidgetCode] = useState(DEFAULT_FLOATING_CODE);

  useEffect(() => {
    // 1. Check localStorage for instant sync
    const syncSettings = () => {
      try {
        const local = localStorage.getItem("adm_settings");
        if (local) {
          const parsed = JSON.parse(local);
          if (typeof parsed.floatingReviewsEnabled === "boolean") {
            setEnabled(parsed.floatingReviewsEnabled);
          }
          if (parsed.floatingReviewsCode) {
            setWidgetCode(parsed.floatingReviewsCode);
          }
        }
      } catch {}
    };

    syncSettings();
    window.addEventListener("settingsUpdated", syncSettings);
    window.addEventListener("storage", syncSettings);

    // 2. Fetch from Supabase site_settings
    async function fetchDbSettings() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data } = await supabase
            .from("site_settings")
            .select("floating_reviews_enabled, floating_reviews_code")
            .eq("id", "main")
            .single();

          if (data) {
            if (typeof data.floating_reviews_enabled === "boolean") {
              setEnabled(data.floating_reviews_enabled);
            }
            if (data.floating_reviews_code) {
              setWidgetCode(data.floating_reviews_code);
            }
          }
        } catch {}
      }
    }

    // Defer initial Supabase check until browser idle
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      (window as any).requestIdleCallback(() => fetchDbSettings());
    } else {
      setTimeout(fetchDbSettings, 1500);
    }

    return () => {
      window.removeEventListener("settingsUpdated", syncSettings);
      window.removeEventListener("storage", syncSettings);
    };
  }, []);

  // Performance: Lazy load floating widget after idle/4s or on first user interaction
  useEffect(() => {
    if (!enabled) return;

    let loaded = false;

    const loadFloatingScript = () => {
      if (loaded) return;
      loaded = true;

      // Extract flash ID or use default
      const flashMatch = widgetCode.match(/data-rw-flash=["']?(\d+)["']?/i);
      const flashId = flashMatch ? flashMatch[1] : "49021";

      // Ensure flash container exists in body
      let container = document.querySelector(`[data-rw-flash="${flashId}"]`);
      if (!container) {
        container = document.createElement("div");
        container.setAttribute("data-rw-flash", flashId);
        document.body.appendChild(container);
      }

      // Inject script if not already present
      const scriptId = "rw-widget-flash-script";
      if (!document.getElementById(scriptId)) {
        const srcMatch = widgetCode.match(/src=["']([^"']+)["']/i);
        const scriptSrc = srcMatch ? srcMatch[1] : "https://widgets.revue.us/2.0/rw-widget-flash.js";

        const script = document.createElement("script");
        script.id = scriptId;
        script.type = "module";
        script.src = scriptSrc;
        script.async = true;
        document.head.appendChild(script);
      }
    };

    // Load after delay or on user interaction to ensure zero blocking during page speed audit
    const timer = setTimeout(loadFloatingScript, 10000);
    const triggerEvents = ["scroll", "touchstart", "pointerdown", "keydown"];
    const handleInteraction = () => {
      loadFloatingScript();
      triggerEvents.forEach((ev) => window.removeEventListener(ev, handleInteraction));
    };

    triggerEvents.forEach((ev) => window.addEventListener(ev, handleInteraction, { passive: true, once: true }));

    return () => {
      clearTimeout(timer);
      triggerEvents.forEach((ev) => window.removeEventListener(ev, handleInteraction));
    };
  }, [enabled, widgetCode]);

  return null;
}
