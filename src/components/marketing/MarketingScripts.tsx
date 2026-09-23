"use client";

import React, { useState, useEffect } from "react";
import CallTracking from "./CallTracking";
import GoogleTagManager from "./GoogleTagManager";
import GoogleAnalytics from "./GoogleAnalytics";
import FacebookPixel from "./FacebookPixel";

const DEFAULT_MARKETING = {
  gtm: {
    enabled: true,
    containerIds: ["GTM-M3WLKSQ", "GTM-PJ447MK"]
  },
  googleAnalytics: {
    enabled: false,
    trackingId: ""
  },
  facebookPixel: {
    enabled: true,
    pixelId: "275772356383035"
  },
  callTracking: {
    enabled: false
  }
};

export default function MarketingScripts() {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [marketing, setMarketing] = useState<any>(DEFAULT_MARKETING);

  useEffect(() => {
    // Fetch live marketing settings from API
    fetch("/api/content?type=settings")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data && data.marketing) {
          setMarketing(data.marketing);
        }
      })
      .catch(() => {});

    // 1. Load immediately upon real user interaction (scroll, touch, pointerdown, keydown)
    const triggerEvents = ["scroll", "touchstart", "pointerdown", "keydown"];
    const handleInteraction = () => {
      setShouldLoad(true);
      triggerEvents.forEach((ev) => window.removeEventListener(ev, handleInteraction));
    };

    triggerEvents.forEach((ev) => {
      window.addEventListener(ev, handleInteraction, { passive: true, once: true });
    });

    // 2. Or fallback load after 10s idle timer so no tracking is ever missed
    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, 10000);

    return () => {
      clearTimeout(timer);
      triggerEvents.forEach((ev) => window.removeEventListener(ev, handleInteraction));
    };
  }, []);

  if (!shouldLoad) return null;

  // GTM Container IDs (supports both GTM-M3WLKSQ and GTM-PJ447MK)
  const gtmIds = marketing.gtm?.containerIds ||
    (marketing.gtm?.containerId ? [marketing.gtm.containerId] : ["GTM-M3WLKSQ", "GTM-PJ447MK"]);
  const gtmEnabled = marketing.gtm?.enabled ?? true;

  // Google Analytics 4 (GA4) - ignores deprecated Universal Analytics (UA-)
  const rawGaId = marketing.googleAnalytics?.trackingId || "";
  const gaId = rawGaId.toUpperCase().startsWith("UA-") ? "" : rawGaId;
  const gaEnabled = Boolean(marketing.googleAnalytics?.enabled && gaId);

  // Facebook Pixel (275772356383035)
  const fbPixelId = marketing.facebookPixel?.pixelId || "275772356383035";
  const fbEnabled = marketing.facebookPixel?.enabled ?? true;

  // CallRail Call Tracking
  const callTrackingUrl =
    marketing.callTracking?.scriptUrl ||
    "https://cdn.calltrk.com/companies/208038913/2a4e80164caeb8bbc760/12/swap.js";
  const callTrackingEnabled = marketing.callTracking?.enabled ?? true;

  return (
    <>
      {gtmEnabled && <GoogleTagManager containerId={gtmIds} />}
      {gaEnabled && <GoogleAnalytics trackingId={gaId} />}
      {fbEnabled && <FacebookPixel pixelId={fbPixelId} />}
      {callTrackingEnabled && <CallTracking scriptUrl={callTrackingUrl} />}
    </>
  );
}
