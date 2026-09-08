import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/api";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getSiteSettings();
    const faviconUrl = settings.favicon || settings.seo?.favicon;

    if (faviconUrl) {
      if (faviconUrl.startsWith("http://") || faviconUrl.startsWith("https://")) {
        try {
          const res = await fetch(faviconUrl, { cache: "no-store" });
          if (res.ok) {
            const buffer = await res.arrayBuffer();
            const contentType = res.headers.get("content-type") || "image/png";
            return new Response(buffer, {
              status: 200,
              headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
              },
            });
          }
        } catch {
          // fallback to 307 redirect
          return NextResponse.redirect(new URL(faviconUrl), { status: 307 });
        }
      }

      // Local public path
      const cleanPath = faviconUrl.startsWith("/") ? faviconUrl.slice(1) : faviconUrl;
      const localFile = path.join(process.cwd(), "public", cleanPath);
      if (fs.existsSync(localFile)) {
        const fileBuffer = fs.readFileSync(localFile);
        const ext = path.extname(localFile).toLowerCase();
        const mimeTypes: Record<string, string> = {
          ".ico": "image/x-icon",
          ".png": "image/png",
          ".jpg": "image/jpeg",
          ".jpeg": "image/jpeg",
          ".svg": "image/svg+xml",
          ".webp": "image/webp",
        };
        return new Response(fileBuffer, {
          status: 200,
          headers: {
            "Content-Type": mimeTypes[ext] || "image/png",
            "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
          },
        });
      }
    }

    // Default Fallback: Nose Creek Clinic Logo (Never Vercel)
    const fallbackLogo = path.join(process.cwd(), "public", "images", "logo", "nose-creek-logo.webp");
    if (fs.existsSync(fallbackLogo)) {
      const fileBuffer = fs.readFileSync(fallbackLogo);
      return new Response(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": "image/webp",
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        },
      });
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error in /favicon.ico route handler:", error);
    return new Response(null, { status: 500 });
  }
}
