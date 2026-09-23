import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export interface SessionUser {
  username: string;
  email: string;
  full_name: string;
  role: "admin" | "client";
  timestamp: number;
}

const HMAC_SECRET =
  process.env.SESSION_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "nc-sec-token-99824-prod-key-hmac-v2";

async function getHmacKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return globalThis.crypto.subtle.importKey(
    "raw",
    enc.encode(HMAC_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Creates a cryptographically signed session token: <base64Payload>.<base64urlSignature>
 * Built with standard Web Crypto API for Edge & Node compatibility.
 */
export async function createSignedSessionToken(user: Omit<SessionUser, "timestamp">): Promise<string> {
  const payload: SessionUser = {
    ...user,
    timestamp: Date.now()
  };

  const payloadJson = JSON.stringify(payload);
  const payloadB64 = Buffer.from(payloadJson, "utf8").toString("base64");

  const key = await getHmacKey();
  const enc = new TextEncoder();
  const sigBuffer = await globalThis.crypto.subtle.sign("HMAC", key, enc.encode(payloadB64));
  const signature = Buffer.from(sigBuffer).toString("base64url");

  return `${payloadB64}.${signature}`;
}

/**
 * Verifies a signed session token. Returns parsed payload if signature matches and token is unexpired (7 days).
 * Timing-safe via native Web Crypto verify.
 */
export async function verifySignedSessionToken(token: string | null | undefined): Promise<SessionUser | null> {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return null;
  }

  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) {
    return null;
  }

  try {
    const key = await getHmacKey();
    const enc = new TextEncoder();
    const sigBytes = Buffer.from(signature, "base64url");

    const isValid = await globalThis.crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      enc.encode(payloadB64)
    );

    if (!isValid) {
      return null;
    }

    const jsonStr = Buffer.from(payloadB64, "base64").toString("utf-8");
    const payload = JSON.parse(jsonStr) as SessionUser;

    // Check expiration: 7 days max age
    const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - payload.timestamp > MAX_AGE_MS) {
      return null;
    }

    // Role validation
    if (payload.role !== "admin" && payload.role !== "client") {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Extracts and verifies session user from incoming request (supports Request, NextRequest, or next/headers cookies)
 */
export async function getServerSession(req?: Request | NextRequest): Promise<SessionUser | null> {
  let token: string | undefined = undefined;

  // 1. Try extracting from Request cookies
  if (req && "cookies" in req && typeof (req as any).cookies?.get === "function") {
    token = (req as NextRequest).cookies.get("adm_session")?.value;
  } else if (req && req.headers.get("cookie")) {
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(/adm_session=([^;]+)/);
    if (match) {
      token = decodeURIComponent(match[1]);
    }
  }

  // 2. Try extracting from next/headers cookies() (for App Router server components/handlers)
  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get("adm_session")?.value;
    } catch {
      // Ignore if called outside server request context
    }
  }

  return await verifySignedSessionToken(token);
}

/**
 * Reusable server-side route guard for Next.js API route handlers
 */
export async function requireAuth(
  req: Request | NextRequest,
  requiredRole?: "admin" | "client"
): Promise<{ user: SessionUser | null; errorResponse?: NextResponse }> {
  const user = await getServerSession(req);

  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { success: false, error: "Unauthorized: Invalid or missing administrator session." },
        { status: 401 }
      )
    };
  }

  if (requiredRole && user.role !== requiredRole) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { success: false, error: `Forbidden: This action requires ${requiredRole} privileges.` },
        { status: 403 }
      )
    };
  }

  return { user };
}
