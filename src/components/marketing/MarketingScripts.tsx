"use client";

import React, { useState, useEffect } from "react";
import settingsData from "@/data/settings.json";
import CallTracking from "./CallTracking";
import GoogleTagManager from "./GoogleTagManager";
import GoogleAnalytics from "./GoogleAnalytics";
import FacebookPixel from "./FacebookPixel";

export default function MarketingScripts() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // 1. Load immediately upon first user interaction (scroll, touch, click, mousemove)
    const triggerEvents = ["scroll", "touchstart", "mousemove", "keydown", "click"];
    const handleInteraction = () => {
      setShouldLoad(true);
      triggerEvents.forEach((ev) => window.removeEventListener(ev, handleInteraction));
    };

    triggerEvents.forEach((ev) => {
      window.addEventListener(ev, handleInteraction, { passive: true, once: true });
    });

    // 2. Or fallback load after 8s idle timer so no tracking is ever missed
    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, 8000);

    return () => {
      clearTimeout(timer);
      triggerEvents.forEach((ev) => window.removeEventListener(ev, handleInteraction));
    };
  }, []);

  if (!shouldLoad) return null;

  const marketing = (settingsData as any).marketing || {};

  // GTM Container IDs (supports both GTM-M3WLKSQ and GTM-PJ447MK)
  const gtmIds = marketing.gtm?.containerIds ||
    (marketing.gtm?.containerId ? [marketing.gtm.containerId] : ["GTM-M3WLKSQ", "GTM-PJ447MK"]);
  const gtmEnabled = marketing.gtm?.enabled ?? true;

  // Google Analytics (UA-121730452-1)
  const gaId = marketing.googleAnalytics?.trackingId || "UA-121730452-1";
  const gaEnabled = marketing.googleAnalytics?.enabled ?? true;

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
