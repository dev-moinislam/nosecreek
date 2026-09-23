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
    // STEP 1: PROACTIVE OPPOSITE-PORTAL DETECTION & REJECTION
    // Under standard login protocol, credentials for one portal must NEVER be accepted
    // on the other portal, and cross-portal role escalation is strictly forbidden.
    // --------------------------------------------------------------------------

    // 1a. Check known authoritative credentials for opposite portal
    const oppAuthCred = AUTHORITATIVE_CREDENTIALS[oppositeRole];
    const isOppAuthIdent =
      ident === oppAuthCred.username.toLowerCase() ||
      ident === oppAuthCred.email.toLowerCase() ||
      (oppositeRole === "client" && ident === "nosecreek") ||
      (oppositeRole === "admin" && ident === "nosecreek-admin");

    if (isOppAuthIdent) {
      const isOppPassValid = verifySecret(secret, oppAuthCred.password_hash) || secret === oppAuthCred.raw_password;
      if (isOppPassValid || secret.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: isClientPortal
              ? "Access Denied: This account is a Master Administrator account. Please use the Master Admin Portal (/admin-login) to sign in."
              : "Access Denied: This account is a Client account. Please use the Client Content Portal (/client-login) to sign in."
          },
          { status: 403 }
        );
      }
    }

    // 1b. Check opposite database table
    try {
      const { data: oppUsers } = await supabase
        .from(oppositeTable)
        .select("id, username, email, password_hash, pin, role")
        .or(`username.ilike.${ident},email.ilike.${ident}`)
        .limit(1);

      if (oppUsers && oppUsers.length > 0) {
        const oppRow = oppUsers[0];
        const isOppPass = verifySecret(secret, oppRow.password_hash) || verifySecret(secret, oppRow.pin);
        if (isOppPass) {
          return NextResponse.json(
            {
              success: false,
              error: isClientPortal
                ? "Access Denied: This account is a Master Administrator account. Please use the Master Admin Portal (/admin-login) to sign in."
                : "Access Denied: This account is a Client account. Please use the Client Content Portal (/client-login) to sign in."
            },
            { status: 403 }
          );
        }
      }
    } catch (oppErr) {
      console.warn("[Auth] Opposite table check warning:", oppErr);
    }

    // --------------------------------------------------------------------------
    // STEP 2: STRICT TARGET PORTAL AUTHENTICATION
    // --------------------------------------------------------------------------

    // 2a. Query target table in Supabase (admin_users for admin, client_users for client)
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
            { success: false, error: "This account has been deactivated by administrator." },
            { status: 403 }
          );
        }

        // Strict role validation: Ensure user row's role matches required portal role
        const rowRole = (userRow.role as "admin" | "client") || targetRole;
        if (rowRole !== targetRole) {
          return NextResponse.json(
            {
              success: false,
              error: isClientPortal
                ? "Access Denied: Administrator accounts cannot sign in through the Client Portal."
                : "Access Denied: Client accounts cannot sign in through the Master Admin Portal."
            },
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
    } catch (tblErr) {
      console.warn("[Auth] Primary table lookup failed, checking site_settings:", tblErr);
    }

    // 2b. If not found in primary table, check target auth credentials in site_settings
    if (!authenticatedUser) {
      try {
        const { data: sData, error: sErr } = await supabase
          .from("site_settings")
          .select("marketing")
          .eq("id", "main")
          .single();

        if (!sErr && sData?.marketing?.auth_credentials) {
          const credMap = sData.marketing.auth_credentials;
          const oppSiteCred = credMap[oppositeRole];
          const targetCred = credMap[targetRole];

          // Check if opposite portal credentials were entered into site_settings
          if (oppSiteCred) {
            const matchesOpp =
              ident === (oppSiteCred.username || "").toLowerCase() ||
              ident === (oppSiteCred.email || "").toLowerCase() ||
              (oppositeRole === "client" ? ident === "nosecreek" : ident === "nosecreek-admin");

            if (matchesOpp && verifySecret(secret, oppSiteCred.password_hash)) {
              return NextResponse.json(
                {
                  success: false,
                  error: isClientPortal
                    ? "Access Denied: This account is a Master Administrator account. Please use the Master Admin Portal (/admin-login) to sign in."
                    : "Access Denied: This account is a Client account. Please use the Client Content Portal (/client-login) to sign in."
                },
                { status: 403 }
              );
            }
          }

          // Match strictly against target portal credentials (NO fallback cross-role matching)
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

    // 2c. Authoritative target credentials check with database self-healing
    if (!authenticatedUser) {
      const targetCred = AUTHORITATIVE_CREDENTIALS[targetRole];
      const isIdentMatch =
        ident === targetCred.username.toLowerCase() ||
        ident === targetCred.email.toLowerCase() ||
        (targetRole === "client" && ident === "nosecreek") ||
        (targetRole === "admin" && ident === "nosecreek-admin");

      if (isIdentMatch && (verifySecret(secret, targetCred.password_hash) || secret === targetCred.raw_password)) {
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

    // Return failure if target credentials do not match
    if (!authenticatedUser) {
      return NextResponse.json(
        {
          success: false,
          error: isClientPortal
            ? "Invalid client username/email or password."
            : "Invalid administrator username/email or password."
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
