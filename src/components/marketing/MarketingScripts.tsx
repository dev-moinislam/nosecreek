import settingsData from "@/data/settings.json";
import CallTracking from "./CallTracking";
import GoogleTagManager from "./GoogleTagManager";

export default function MarketingScripts() {
  // Safe navigation in case marketing is not yet defined in settings
  const marketing = (settingsData as any).marketing;

  if (!marketing) return null;

  return (
    <>
      {marketing.callTracking?.enabled && (
        <CallTracking scriptUrl={marketing.callTracking.scriptUrl} />
      )}
      {marketing.gtm?.enabled && (
        <GoogleTagManager containerId={marketing.gtm.containerId} />
      )}
    </>
  );
}
