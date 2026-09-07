import settingsData from "@/data/settings.json";
import CallTracking from "./CallTracking";
import GoogleTagManager from "./GoogleTagManager";
import GoogleAnalytics from "./GoogleAnalytics";
import FacebookPixel from "./FacebookPixel";

export default function MarketingScripts() {
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
