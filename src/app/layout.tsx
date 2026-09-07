import type { Metadata } from "next";
import "./globals.css";
import SiteLayout from "@/components/layout/SiteLayout";
import ThemeApplier from "@/components/theme/ThemeApplier";
import { RoleProvider } from "@/components/admin/RoleGuard";
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
  },
  formatDetection: {
    telephone: false
  },
  verification: {
    google: [
      "VdGWvsNmPysBfWw1MpJIQm94R_Lb1ll_mKLYEw-NnPg",
      "Xypr33c-GZbfb5iCkpnk_NXoEs2pjpUyPTPpFglIol8",
      "LJFmcK_xs2gq47oE17mVlpakVzJBD4Ss7AR8SvcgeA8"
    ],
    other: {
      "msvalidate.01": [
        "05FF7C5576F0BF31E798C271D8097CB3",
        "CE71D0049F828E7D8D023D99CB4961E5"
      ]
    }
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
        <RoleProvider>
          <SiteLayout>{children}</SiteLayout>
        </RoleProvider>
      </body>
    </html>
  );
}
