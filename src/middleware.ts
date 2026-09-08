import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import redirectsData from "@/data/redirects.json";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const lowerPath = pathname.toLowerCase();
  const normalizedPath = lowerPath.endsWith("/") && lowerPath.length > 1 ? lowerPath.slice(0, -1) : lowerPath;

  const rules = (redirectsData as any)?.rules || [];

  for (const rule of rules) {
    if (!rule.enabled) continue;
    const from = (rule.fromPath || "").toLowerCase().trim();
    const normalizedFrom = from.endsWith("/") && from.length > 1 ? from.slice(0, -1) : from;

    if (normalizedPath === normalizedFrom) {
      let target = rule.toPath.trim();
      if (search && !target.includes("?")) {
        target += search;
      }

      if (target.startsWith("http://") || target.startsWith("https://")) {
        return NextResponse.redirect(new URL(target), { status: rule.statusCode || 301 });
      }

      return NextResponse.redirect(new URL(target, request.url), { status: rule.statusCode || 301 });
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
