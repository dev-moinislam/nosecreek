import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const AUTHORITATIVE_CREDENTIALS = {
  admin: {
    username: "nosecreek-admin",
    email: "admin@nosecreek.com",
    password_hash: "$2b$10$vr4k1Mc7456lnlD.u4HtZOlYx5bnmJe9RmeY4ayk3qIdi7UOItgTa",
    raw_password: "z$7Ti45KHsqK1VZ)kQ3Q$QKd",
    full_name: "Master Administrator",
    role: "admin" as const
  },
  client: {
    username: "nosecreek",
    email: "client@nosecreek.com",
    password_hash: "$2b$10$TtHT8PBYpqqbA5AkbGosSuN/1Zj0NrWlp1JUCXnh0udmorlVJJB1S",
    raw_password: "KHszQ$Q5qK1VZ$Kdi47T)kQ3",
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
          const fallbackCreds = credMap[isClientPortal ? "admin" : "client"];

          let matchedCred = null;
          if (portalCreds) {
            const matchesUser =
              ident === (portalCreds.username || "").toLowerCase() ||
              ident === (portalCreds.email || "").toLowerCase() ||
              ident === "nosecreek";

            if (matchesUser && verifySecret(secret, portalCreds.password_hash)) {
              matchedCred = portalCreds;
            }
          }

          if (!matchedCred && fallbackCreds) {
            const matchesFallback =
              ident === (fallbackCreds.username || "").toLowerCase() ||
              ident === (fallbackCreds.email || "").toLowerCase() ||
              ident === "nosecreek";

            if (matchesFallback && verifySecret(secret, fallbackCreds.password_hash)) {
              matchedCred = fallbackCreds;
            }
          }

          if (matchedCred) {
            authenticatedUser = {
              username: matchedCred.username,
              email: matchedCred.email,
              full_name: matchedCred.full_name || (isClientPortal ? "Clinic Manager" : "Master Administrator"),
              role: isClientPortal ? "client" : "admin"
            };
          }
        }
      } catch (settingsErr) {
        console.warn("[Auth] Site settings credential check failed:", settingsErr);
      }
    }

    // 1c. Authoritative credentials check with database self-healing
    if (!authenticatedUser) {
      const targetCred = isClientPortal ? AUTHORITATIVE_CREDENTIALS.client : AUTHORITATIVE_CREDENTIALS.admin;
      const isIdentMatch =
        ident === targetCred.username.toLowerCase() ||
        ident === targetCred.email.toLowerCase() ||
        (isClientPortal && ident === "nosecreek") ||
        (!isClientPortal && ident === "nosecreek-admin");

      if (isIdentMatch && (verifySecret(secret, targetCred.password_hash) || secret === targetCred.raw_password)) {
        authenticatedUser = {
          username: targetCred.username,
          email: targetCred.email,
          full_name: targetCred.full_name,
          role: targetCred.role
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
