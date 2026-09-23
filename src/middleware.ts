import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySignedSessionToken } from "@/lib/auth/serverAuth";

interface CachedRule {
  id: string;
  fromPath: string;
  toPath: string;
  statusCode: number;
  enabled: boolean;
  hitCount?: number;
}

// In-memory cache for ultra-fast middleware execution
let cachedRules: CachedRule[] = [];
let lastFetchTime = 0;
const CACHE_TTL_MS = 60000; // Refresh rules from API every 60 seconds

export async function middleware(request: NextRequest) {
  const { pathname, search, origin } = request.nextUrl;
  const lowerPath = pathname.toLowerCase();
  const normalizedPath = lowerPath.endsWith("/") && lowerPath.length > 1 ? lowerPath.slice(0, -1) : lowerPath;

  // 1. Server-Side Route Guard for Protected Admin Routes
  const isAdminRoute = normalizedPath === "/admin" || normalizedPath.startsWith("/admin/");
  const isLoginPage = normalizedPath === "/admin-login" || normalizedPath === "/client-login";

  if (isAdminRoute || isLoginPage) {
    const sessionToken = request.cookies.get("adm_session")?.value;
    const user = await verifySignedSessionToken(sessionToken);

    if (isAdminRoute) {
      if (!user) {
        const loginUrl = new URL("/admin-login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Restrict client-role users from accessing master-admin configuration
      const masterAdminOnlySubpaths = [
        "/admin/settings",
        "/admin/schemas",
        "/admin/seo",
        "/admin/navigation",
        "/admin/email-setup",
        "/admin/redirects"
      ];
      if (user.role === "client" && masterAdminOnlySubpaths.some((p) => normalizedPath.startsWith(p))) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    } else if (isLoginPage && user) {
      // If already authenticated and visiting login page, redirect directly to dashboard
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // 2. Dynamic Redirect Rules Engine
  const now = Date.now();
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
      // Fall back to currently cached rules
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
