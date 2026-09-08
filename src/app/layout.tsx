import type { Metadata } from "next";
import "./globals.css";
import SiteLayout from "@/components/layout/SiteLayout";
import ThemeApplier from "@/components/theme/ThemeApplier";
import { buildThemeCss, ThemeColors } from "@/lib/theme";
import { RoleProvider } from "@/components/admin/RoleGuard";
import settingsData from "@/data/settings.json";
import { getSiteSettings } from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const faviconUrl = settings.favicon || settings.seo?.favicon || "/favicon.ico";

  return {
    title: {
      default: settings.seo?.title || settingsData.seo.title,
      template: `%s | ${settings.clinicName || settingsData.clinicName}`
    },
    description: settings.seo?.description || settingsData.seo.description,
    metadataBase: new URL(settings.seo?.canonicalUrl || settingsData.seo.canonicalUrl),
    alternates: {
      canonical: "/"
    },
    icons: {
      icon: [
        { url: faviconUrl, sizes: "any" },
        { url: faviconUrl, sizes: "16x16" },
        { url: faviconUrl, sizes: "32x32" },
        { url: faviconUrl, sizes: "192x192" },
        { url: faviconUrl, sizes: "512x512" },
      ],
      shortcut: faviconUrl,
      apple: faviconUrl,
    },
    openGraph: {
      title: settings.seo?.ogTitle || settingsData.seo.ogTitle,
      description: settings.seo?.ogDescription || settingsData.seo.ogDescription,
      images: [{ url: settings.seo?.ogImage || settingsData.seo.ogImage }],
      type: "website",
      locale: "en_CA",
      siteName: settings.clinicName || settingsData.clinicName
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
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();
  const serverThemeColors = ((settings as any)?.marketing?.theme_colors || (settings as any)?.themeColors) as ThemeColors | undefined;
  const serverThemeCss = serverThemeColors ? buildThemeCss(serverThemeColors) : null;

  return (
    <html lang="en">
      <head>
        <link rel="icon" href={settings.favicon || settings.seo?.favicon || "/favicon.ico"} sizes="any" />
        <link rel="shortcut icon" href={settings.favicon || settings.seo?.favicon || "/favicon.ico"} />
        <link rel="apple-touch-icon" href={settings.favicon || settings.seo?.favicon || "/favicon.ico"} />
        {serverThemeCss && (
          <style
            id="nc-ssr-theme-style"
            dangerouslySetInnerHTML={{ __html: serverThemeCss }}
          />
        )}
      </head>
      <body>
        <ThemeApplier initialTheme={serverThemeColors} />
        <RoleProvider>
          <SiteLayout>{children}</SiteLayout>
        </RoleProvider>
      </body>
    </html>
  );
}
