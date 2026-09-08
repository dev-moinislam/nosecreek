import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import staticRedirectsData from "@/data/redirects.json";

interface CachedRule {
  id: string;
  fromPath: string;
  toPath: string;
  statusCode: number;
  enabled: boolean;
  hitCount?: number;
}

// In-memory cache for ultra-fast middleware execution
let cachedRules: CachedRule[] = (staticRedirectsData as any)?.rules || [];
let lastFetchTime = 0;
const CACHE_TTL_MS = 1500; // Refresh rules from API every 1.5 seconds

export async function middleware(request: NextRequest) {
  const { pathname, search, origin } = request.nextUrl;
  const lowerPath = pathname.toLowerCase();
  const normalizedPath = lowerPath.endsWith("/") && lowerPath.length > 1 ? lowerPath.slice(0, -1) : lowerPath;

  const now = Date.now();

  // Dynamically refresh rules from API if TTL expired
  if (now - lastFetchTime > CACHE_TTL_MS) {
    try {
      const res = await fetch(`${origin}/api/admin/redirects`, {
        cache: "no-store",
        headers: { "x-internal-middleware": "1" }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.rules)) {
          cachedRules = data.rules;
          lastFetchTime = now;
        }
      }
    } catch {
      // Fall back to currently cached rules or static data
    }
  }

  for (const rule of cachedRules) {
    if (!rule.enabled) continue;

    const from = (rule.fromPath || "").toLowerCase().trim();
    const normalizedFrom = from.endsWith("/") && from.length > 1 ? from.slice(0, -1) : from;

    if (normalizedPath === normalizedFrom) {
      let target = rule.toPath.trim();

      // Preserve query params if not already in target
      if (search && !target.includes("?")) {
        target += search;
      }

      const statusCode = Number(rule.statusCode) || 301;
      const destinationUrl = target.startsWith("http://") || target.startsWith("https://")
        ? new URL(target)
        : new URL(target, request.url);

      // Async background fire-and-forget to increment hit count
      fetch(`${origin}/api/admin/redirects?hitId=${encodeURIComponent(rule.id)}`, {
        method: "PATCH",
        headers: { "x-internal-middleware": "1" }
      }).catch(() => {});

      return NextResponse.redirect(destinationUrl, { status: statusCode });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (public static images)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
  ],
};
