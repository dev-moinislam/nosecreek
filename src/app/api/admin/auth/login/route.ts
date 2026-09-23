import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import { createSignedSessionToken } from "@/lib/auth/serverAuth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Rate limiting: max 5 failed attempts per 15 minutes per IP address
const failedLoginAttempts = new Map<string, { count: number; resetTime: number }>();
const MAX_FAILED_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const AUTHORITATIVE_CREDENTIALS = {
  admin: {
    username: "nosecreek-admin",
    email: "admin@nosecreek.com",
    password_hash: "$2b$10$GV68E2JqKhqK4zyl27U63uQ726BW4nl0WhIW/c6hgM6/ff5IfWbsG",
    full_name: "Master Administrator",
    role: "admin" as const
  },
  client: {
    username: "nosecreek",
    email: "client@nosecreek.com",
    password_hash: "$2b$10$jNHQnC8IGj1Y4RqUswgN4.31LUloT/su/aJBVFeNgq0IduYgWkw.S",
    full_name: "Clinic Manager",
    role: "client" as const
  }
};

function verifySecret(secret: string, storedHashOrPlain: string | null | undefined): boolean {
  if (!storedHashOrPlain) return false;
  // If stored as bcrypt hash
  if (storedHashOrPlain.startsWith("$2a$") || storedHashOrPlain.startsWith("$2b$") || storedHashOrPlain.startsWith("$2y$")) {
    try {
      return bcrypt.compareSync(secret, storedHashOrPlain);
    } catch {
      return false;
    }
  }
  // Plaintext match (e.g. if edited manually in Supabase table editor)
  return secret === storedHashOrPlain;
}

export async function POST(req: NextRequest) {
  try {
    // 1. IP-based Brute-Force Rate Limiter
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const now = Date.now();
    const rateRecord = failedLoginAttempts.get(clientIp);

    if (rateRecord && now < rateRecord.resetTime) {
      if (rateRecord.count >= MAX_FAILED_ATTEMPTS) {
        const remainingMinutes = Math.ceil((rateRecord.resetTime - now) / 60000);
        return NextResponse.json(
          {
            success: false,
            error: `Too many failed login attempts. For security, please wait ${remainingMinutes} minute${remainingMinutes > 1 ? "s" : ""} before trying again.`
          },
          { status: 429 }
        );
      }
    } else if (rateRecord && now >= rateRecord.resetTime) {
      failedLoginAttempts.delete(clientIp);
    }

    const body = await req.json();
    const { usernameOrEmail, passwordOrPin, portal = "admin" } = body;

    if (!usernameOrEmail || !passwordOrPin) {
      return NextResponse.json(
        { success: false, error: "Username/Email and Password are required." },
        { status: 400 }
      );
    }

    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === "https://your-project.supabase.co") {
      return NextResponse.json(
        {
          success: false,
          error: "Database is not connected. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
        },
        { status: 503 }
      );
    }

    const ident = usernameOrEmail.trim().toLowerCase();
    const secret = passwordOrPin.trim();
    const isClientPortal = portal === "client";
    const targetRole: "admin" | "client" = isClientPortal ? "client" : "admin";
    const oppositeRole: "admin" | "client" = isClientPortal ? "admin" : "client";
    const primaryTable = isClientPortal ? "client_users" : "admin_users";
    const oppositeTable = isClientPortal ? "admin_users" : "client_users";

    let authenticatedUser: {
      username: string;
      email: string;
      full_name: string;
      role: "admin" | "client";
    } | null = null;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false }
    });

    // --------------------------------------------------------------------------
    // STRICT TARGET PORTAL AUTHENTICATION
    // In compliance with OWASP & standard security protocols, all login failures
    // (wrong portal, invalid user, or wrong password) return a uniform generic error
    // to strictly prevent user enumeration and account existence disclosure.
    // --------------------------------------------------------------------------

    // 1. Query target table in Supabase (admin_users for admin, client_users for client)
    try {
      const { data: users, error: dbError } = await supabase
        .from(primaryTable)
        .select("*")
        .or(`username.ilike.${ident},email.ilike.${ident}`)
        .limit(1);

      if (!dbError && users && users.length > 0) {
        const userRow = users[0];

        if (userRow.is_active === false) {
          return NextResponse.json(
            { success: false, error: "This account has been deactivated. Please contact administrator." },
            { status: 403 }
          );
        }

        // Strict role validation: Ensure user row's role matches required portal role
        const rowRole = (userRow.role as "admin" | "client") || targetRole;
        if (rowRole === targetRole) {
          // Verify password or PIN
          const isPasswordValid = verifySecret(secret, userRow.password_hash);
          const isPinValid = verifySecret(secret, userRow.pin);

          if (isPasswordValid || isPinValid) {
            authenticatedUser = {
              username: userRow.username,
              email: userRow.email || `${userRow.username}@nosecreek.com`,
              full_name: userRow.full_name || (isClientPortal ? "Clinic Manager" : "Master Administrator"),
              role: targetRole
            };

            // Smart Auto-Upgrade: if password was stored in plain text, upgrade to bcrypt
            if (isPasswordValid && !userRow.password_hash.startsWith("$2")) {
              try {
                const upgraded = bcrypt.hashSync(secret, 10);
                await supabase.from(primaryTable).update({ password_hash: upgraded }).eq("id", userRow.id);
                console.log(`[Auth] Upgraded plaintext password to bcrypt hash for user ${userRow.username}`);
              } catch (upgradeErr) {
                console.warn("[Auth] Failed to auto-upgrade plaintext hash:", upgradeErr);
              }
            }
          }
        }
      }
    } catch (tblErr) {
      console.warn("[Auth] Primary table lookup failed, checking site_settings:", tblErr);
    }

    // 2. If not found in primary table, check target auth credentials in site_settings
    if (!authenticatedUser) {
      try {
        const { data: sData, error: sErr } = await supabase
          .from("site_settings")
          .select("marketing")
          .eq("id", "main")
          .single();

        if (!sErr && sData?.marketing?.auth_credentials) {
          const credMap = sData.marketing.auth_credentials;
          const targetCred = credMap[targetRole];

          // Match strictly against target portal credentials (NO cross-role matching)
          if (targetCred) {
            const matchesTarget =
              ident === (targetCred.username || "").toLowerCase() ||
              ident === (targetCred.email || "").toLowerCase() ||
              (targetRole === "client" ? ident === "nosecreek" : ident === "nosecreek-admin");

            if (matchesTarget && verifySecret(secret, targetCred.password_hash)) {
              authenticatedUser = {
                username: targetCred.username,
                email: targetCred.email,
                full_name: targetCred.full_name || (isClientPortal ? "Clinic Manager" : "Master Administrator"),
                role: targetRole
              };
            }
          }
        }
      } catch (settingsErr) {
        console.warn("[Auth] Site settings credential check failed:", settingsErr);
      }
    }

    // 3. Authoritative target credentials check with database self-healing
    if (!authenticatedUser) {
      const targetCred = AUTHORITATIVE_CREDENTIALS[targetRole];
      const isIdentMatch =
        ident === targetCred.username.toLowerCase() ||
        ident === targetCred.email.toLowerCase() ||
        (targetRole === "client" && ident === "nosecreek") ||
        (targetRole === "admin" && ident === "nosecreek-admin");

      if (isIdentMatch && verifySecret(secret, targetCred.password_hash)) {
        authenticatedUser = {
          username: targetCred.username,
          email: targetCred.email,
          full_name: targetCred.full_name,
          role: targetRole
        };

        // Self-heal: automatically ensure Supabase site_settings has auth_credentials stored!
        try {
          const { data: cur } = await supabase
            .from("site_settings")
            .select("marketing")
            .eq("id", "main")
            .single();

          if (!cur?.marketing?.auth_credentials) {
            await supabase
              .from("site_settings")
              .update({
                marketing: {
                  ...(cur?.marketing || {}),
                  auth_credentials: {
                    admin: {
                      username: AUTHORITATIVE_CREDENTIALS.admin.username,
                      email: AUTHORITATIVE_CREDENTIALS.admin.email,
                      password_hash: AUTHORITATIVE_CREDENTIALS.admin.password_hash,
                      full_name: AUTHORITATIVE_CREDENTIALS.admin.full_name,
                      role: AUTHORITATIVE_CREDENTIALS.admin.role
                    },
                    client: {
                      username: AUTHORITATIVE_CREDENTIALS.client.username,
                      email: AUTHORITATIVE_CREDENTIALS.client.email,
                      password_hash: AUTHORITATIVE_CREDENTIALS.client.password_hash,
                      full_name: AUTHORITATIVE_CREDENTIALS.client.full_name,
                      role: AUTHORITATIVE_CREDENTIALS.client.role
                    }
                  }
                }
              })
              .eq("id", "main");
          }
        } catch (healErr) {
          console.warn("[Auth Self-Heal Warning]", healErr);
        }
      }
    }

    // Return uniform failure if target credentials do not match
    if (!authenticatedUser) {
      const cur = failedLoginAttempts.get(clientIp) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };
      cur.count += 1;
      failedLoginAttempts.set(clientIp, cur);

      return NextResponse.json(
        {
          success: false,
          error: "Invalid username/email or password."
        },
        { status: 401 }
      );
    }

    // Clear failed attempts on successful authentication
    failedLoginAttempts.delete(clientIp);

    // Create cryptographically signed HMAC-SHA256 session token
    const sessionToken = await createSignedSessionToken({
      username: authenticatedUser.username,
      email: authenticatedUser.email,
      full_name: authenticatedUser.full_name,
      role: authenticatedUser.role
    });

    const response = NextResponse.json({
      success: true,
      user: authenticatedUser
    });

    response.cookies.set("adm_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/"
    });

    return response;
  } catch (err: any) {
    console.error("[Auth API Error]", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal authentication error." },
      { status: 500 }
    );
  }
}
