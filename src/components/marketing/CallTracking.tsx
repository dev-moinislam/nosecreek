import Script from "next/script";

interface CallTrackingProps {
  scriptUrl: string;
}

export default function CallTracking({ scriptUrl }: CallTrackingProps) {
  if (!scriptUrl) return null;

  return (
    <Script
      id="call-tracking"
      src={scriptUrl}
      strategy="afterInteractive"
    />
  );
}
