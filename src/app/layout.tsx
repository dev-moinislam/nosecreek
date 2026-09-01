import type { Metadata } from "next";
import "./globals.css";
import SiteLayout from "@/components/layout/SiteLayout";
import ThemeApplier from "@/components/theme/ThemeApplier";
import settingsData from "@/data/settings.json";

export const metadata: Metadata = {
  title: {
    default: settingsData.seo.title,
    template: `%s | ${settingsData.clinicName}`
  },
  description: settingsData.seo.description,
  metadataBase: new URL(settingsData.seo.canonicalUrl),
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: settingsData.seo.ogTitle,
    description: settingsData.seo.ogDescription,
    images: [{ url: settingsData.seo.ogImage }],
    type: "website",
    locale: "en_CA",
    siteName: settingsData.clinicName
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeApplier />
        <SiteLayout>{children}</SiteLayout>
      </body>
    </html>
  );
}
