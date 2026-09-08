import Script from "next/script";

interface GoogleAnalyticsProps {
  trackingId?: string | string[];
}

export default function GoogleAnalytics({
  trackingId = "UA-121730452-1"
}: GoogleAnalyticsProps) {
  const ids = (
    Array.isArray(trackingId)
      ? trackingId
      : (trackingId ? trackingId.split(",") : [])
  )
    .map((s) => s.trim())
    .filter(Boolean);

  if (ids.length === 0) return null;
  const primaryId = ids[0];

  return (
    <>
      <Script
        id="ga-gtag-src"
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${primaryId}`}
      />
      <Script
        id="ga-gtag-inline"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            ${ids.map((id) => `gtag('config', '${id}', { send_page_view: true });`).join("\n            ")}
          `,
        }}
      />
    </>
  );
}
