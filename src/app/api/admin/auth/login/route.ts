import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Precomputed fallback bcrypt hashes for emergency / offline dev
const FALLBACK_ADMIN = {
  username: "nosecreek-admin",
  email: "admin@nosecreek.com",
  password_hash: "$2b$10$iYI06kE6lK2l3RF/KMgDhOf/Aeh8GY1hjwIcmQS9nDBLzbs5ctj26",
  full_name: "Master Administrator",
  role: "admin" as const
};

const FALLBACK_CLIENT = {
  username: "nosecreek",
  email: "client@nosecreek.com",
  password_hash: "$2b$10$1pI9LKG4S6Jkno2FTtk1OO8pG.7LdOx0DDeh1FMPwmVq8pu8LE5om",
  full_name: "Clinic Manager (Client Mode)",
  role: "client" as const
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
    const body = await req.json();
    const { usernameOrEmail, passwordOrPin, portal = "admin" } = body;

    if (!usernameOrEmail || !passwordOrPin) {
      return NextResponse.json(
        { success: false, error: "Username/Email and Password are required." },
        { status: 400 }
      );
    }

    const ident = usernameOrEmail.trim().toLowerCase();
    const secret = passwordOrPin.trim();
    const isClientPortal = portal === "client";
    const tableName = isClientPortal ? "client_users" : "admin_users";

    let authenticatedUser: {
      username: string;
      email: string;
      full_name: string;
      role: "admin" | "client";
    } | null = null;

    // 1. Check Supabase Database
    if (supabaseUrl && supabaseAnonKey && supabaseUrl !== "https://your-project.supabase.co") {
      try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
          auth: { persistSession: false }
        });

        // 1a. Check primary table (admin_users or client_users)
        const { data: users, error: dbError } = await supabase
          .from(tableName)
          .select("*")
          .or(`username.ilike.${ident},email.ilike.${ident}`)
          .limit(1);

        if (!dbError && users && users.length > 0) {
          const userRow = users[0];

          if (userRow.is_active === false) {
            return NextResponse.json(
              { success: false, error: "This account has been deactivated by administrator." },
              { status: 403 }
            );
          }

          // Verify password or PIN
          const isPasswordValid = verifySecret(secret, userRow.password_hash);
          const isPinValid = verifySecret(secret, userRow.pin);

          if (isPasswordValid || isPinValid) {
            authenticatedUser = {
              username: userRow.username,
              email: userRow.email || `${userRow.username}@nosecreek.com`,
              full_name: userRow.full_name || (isClientPortal ? "Clinic Manager" : "Master Administrator"),
              role: (userRow.role as "admin" | "client") || (isClientPortal ? "client" : "admin")
            };

            // Smart Auto-Upgrade: if password was stored in plain text (manual entry in Supabase), upgrade to bcrypt!
            if (isPasswordValid && !userRow.password_hash.startsWith("$2")) {
              try {
                const upgraded = bcrypt.hashSync(secret, 10);
                await supabase.from(tableName).update({ password_hash: upgraded }).eq("id", userRow.id);
                console.log(`[Auth] Upgraded plaintext password to bcrypt hash for user ${userRow.username}`);
              } catch (upgradeErr) {
                console.warn("[Auth] Failed to auto-upgrade plaintext hash:", upgradeErr);
              }
            }
          }
        }

        // 1b. If not found in primary table or table does not exist, check Supabase site_settings
        if (!authenticatedUser) {
          const { data: sData, error: sErr } = await supabase
            .from("site_settings")
            .select("marketing")
            .eq("id", "main")
            .single();

          if (!sErr && sData?.marketing?.auth_credentials) {
            const credMap = sData.marketing.auth_credentials;
            const portalCreds = credMap[isClientPortal ? "client" : "admin"];
            if (portalCreds) {
              const matchesUser =
                ident === (portalCreds.username || "").toLowerCase() ||
                ident === (portalCreds.email || "").toLowerCase();

              if (matchesUser && verifySecret(secret, portalCreds.password_hash)) {
                authenticatedUser = {
                  username: portalCreds.username,
                  email: portalCreds.email,
                  full_name: portalCreds.full_name || (isClientPortal ? "Clinic Manager" : "Master Administrator"),
                  role: (portalCreds.role as "admin" | "client") || (isClientPortal ? "client" : "admin")
                };
              }
            }
          }
        }
      } catch (connErr) {
        console.warn("[Auth] Supabase query failed, evaluating fallback:", connErr);
      }
    }

    // 2. Fallback check for resilience
    if (!authenticatedUser) {
      const fallback = isClientPortal ? FALLBACK_CLIENT : FALLBACK_ADMIN;
      const isUsernameMatch = ident === fallback.username.toLowerCase() || ident === fallback.email.toLowerCase();

      if (isUsernameMatch) {
        const isPassValid = verifySecret(secret, fallback.password_hash);
        if (isPassValid) {
          authenticatedUser = {
            username: fallback.username,
            email: fallback.email,
            full_name: fallback.full_name,
            role: fallback.role
          };
        }
      }
    }

    // Return failure if not matched
    if (!authenticatedUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid username/email or password."
        },
        { status: 401 }
      );
    }

    // Create session payload and set secure cookie
    const sessionToken = Buffer.from(
      JSON.stringify({
        ...authenticatedUser,
        timestamp: Date.now()
      })
    ).toString("base64");

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
