import React from "react";
import Script from "next/script";

interface GoogleTagManagerProps {
  containerId: string | string[];
}

export default function GoogleTagManager({ containerId }: GoogleTagManagerProps) {
  const ids = (Array.isArray(containerId) ? containerId : [containerId]).filter(Boolean);

  if (ids.length === 0) return null;

  return (
    <>
      {ids.map((id, index) => (
        <React.Fragment key={id}>
          {/* Google Tag Manager - Script */}
          <Script
            id={`gtm-script-${index}`}
            strategy="lazyOnload"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${id}');
              `,
            }}
          />

          {/* Google Tag Manager - NoScript (Fallback) */}
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${id}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        </React.Fragment>
      ))}
    </>
  );
}
