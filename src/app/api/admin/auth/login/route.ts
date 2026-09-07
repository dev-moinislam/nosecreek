import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

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
    const tableName = isClientPortal ? "client_users" : "admin_users";

    let authenticatedUser: {
      username: string;
      email: string;
      full_name: string;
      role: "admin" | "client";
    } | null = null;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false }
    });

    // 1a. Query primary table in Supabase (admin_users or client_users)
    try {
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

          // Smart Auto-Upgrade: if password was stored in plain text, upgrade to bcrypt
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
    } catch (tblErr) {
      console.warn("[Auth] Primary table lookup failed, checking site_settings:", tblErr);
    }

    // 1b. If not found in primary table, check auth credentials stored in Supabase site_settings
    if (!authenticatedUser) {
      try {
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
      } catch (settingsErr) {
        console.warn("[Auth] Site settings credential check failed:", settingsErr);
      }
    }

    // Return failure if not matched in database
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
