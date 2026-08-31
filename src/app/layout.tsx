import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SchemaMarkup from "@/components/seo/SchemaMarkup";
import MarketingScripts from "@/components/marketing/MarketingScripts";
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
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
        <SchemaMarkup type="MedicalBusiness" data={settingsData} />
        <MarketingScripts />
      </body>
    </html>
  );
}
