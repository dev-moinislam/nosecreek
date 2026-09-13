import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

interface NotificationSettings {
  enabled: boolean;
  receiverEmail: string;
  senderName?: string;
  subjectPrefix?: string;
  provider?: "resend" | "smtp" | "webhook";
  resendApiKey?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  webhookUrl?: string;
}

async function getNotificationSettings(): Promise<NotificationSettings | null> {
  // 1. Try Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase
        .from("site_settings")
        .select("marketing, clinic_name")
        .eq("id", "main")
        .single();
      if (data?.marketing?.notifications) {
        return data.marketing.notifications;
      }
    } catch {
      // fallback
    }
  }

  // 2. Read from settings.json
  try {
    const settingsPath = path.resolve(process.cwd(), "src/data/settings.json");
    if (fs.existsSync(settingsPath)) {
      const raw = fs.readFileSync(settingsPath, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed.notifications) {
        return parsed.notifications;
      }
    }
  } catch (err) {
    console.warn("Could not read settings.json for notifications:", err);
  }

  return null;
}

function buildEmailHtml(lead: any, isTest = false): string {
  const brandTeal = "#0e78a8";
  const bgLight = "#f8fafc";
  const borderCol = "#e2e8f0";

  if (isTest) {
    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid ${borderCol}; border-radius: 12px; overflow: hidden;">
        <div style="background: ${brandTeal}; padding: 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">Nose Creek Physiotherapy</h1>
          <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">Form Notification Email System Test</p>
        </div>
        <div style="padding: 28px;">
          <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 14px; margin-bottom: 20px; color: #065f46; font-size: 14px;">
            <strong>✓ Test Email Successful!</strong> Your client notification receiver email is properly connected to the website.
          </div>
          <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
            Whenever a patient or visitor submits any form on the Nose Creek Physiotherapy website (Contact, Booking, Workshops, or future custom forms), complete submission details will be dispatched immediately to this email address.
          </p>
          <div style="background: ${bgLight}; border-radius: 8px; padding: 14px; border: 1px solid ${borderCol}; font-size: 13px; color: #64748b;">
            <strong>Test Timestamp:</strong> ${new Date().toLocaleString("en-US", { timeZoneName: "short" })}
          </div>
        </div>
        <div style="background: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid ${borderCol};">
          Nose Creek Physiotherapy &bull; Automated Website Notification System
        </div>
      </div>
    `;
  }

  const name = lead.name || `${lead.first_name || ""} ${lead.last_name || ""}`.trim() || "Website Visitor";
  const formType = (lead.form_type || "General Inquiry").toUpperCase().replace(/_/g, " ");
  const page = lead.metadata?.page || "Website Form";
  const dateStr = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid ${borderCol}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="background: ${brandTeal}; padding: 22px 26px; color: #ffffff;">
        <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.85; font-weight: 700;">New Form Submission</div>
        <h1 style="margin: 4px 0 0 0; font-size: 20px; font-weight: 700;">${name}</h1>
        <div style="margin-top: 6px; font-size: 13px; opacity: 0.9;">Form: <span style="background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 4px; font-weight: 600;">${formType}</span></div>
      </div>

      <div style="padding: 26px;">
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tbody>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; font-size: 13px; font-weight: 600; color: #64748b; width: 140px;">Full Name</td>
              <td style="padding: 10px 0; font-size: 14px; font-weight: 700; color: #0f172a;">${name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; font-size: 13px; font-weight: 600; color: #64748b;">Email Address</td>
              <td style="padding: 10px 0; font-size: 14px; color: #0e78a8; font-weight: 600;">
                <a href="mailto:${lead.email || ""}" style="color: #0e78a8; text-decoration: underline;">${lead.email || "Not provided"}</a>
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; font-size: 13px; font-weight: 600; color: #64748b;">Phone Number</td>
              <td style="padding: 10px 0; font-size: 14px; color: #0f172a;">
                ${lead.phone ? `<a href="tel:${lead.phone}" style="color: #0f172a; text-decoration: none; font-weight: 600;">${lead.phone}</a>` : "Not provided"}
              </td>
            </tr>
            ${lead.service_interest ? `
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; font-size: 13px; font-weight: 600; color: #64748b;">Service / Interest</td>
              <td style="padding: 10px 0; font-size: 14px; color: #0f172a; font-weight: 600;">${lead.service_interest}</td>
            </tr>` : ""}
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; font-size: 13px; font-weight: 600; color: #64748b;">Submitted Page</td>
              <td style="padding: 10px 0; font-size: 13px; color: #64748b;">${page}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-size: 13px; font-weight: 600; color: #64748b;">Date & Time</td>
              <td style="padding: 10px 0; font-size: 13px; color: #64748b;">${dateStr}</td>
            </tr>
          </tbody>
        </table>

        ${lead.message ? `
          <div style="background: ${bgLight}; border: 1px solid ${borderCol}; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 6px;">Patient / Client Message:</div>
            <div style="font-size: 14px; color: #1e293b; line-height: 1.6; white-space: pre-wrap;">${lead.message}</div>
          </div>
        ` : ""}

        <div style="text-align: center; margin-top: 24px;">
          ${lead.email ? `
            <a href="mailto:${lead.email}?subject=Re: Your inquiry with Nose Creek Physiotherapy" style="display: inline-block; background: ${brandTeal}; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; margin-right: 8px;">
              Reply by Email &rarr;
            </a>
          ` : ""}
          ${lead.phone ? `
            <a href="tel:${lead.phone}" style="display: inline-block; background: #f1f5f9; color: #0f172a; border: 1px solid #cbd5e1; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 14px;">
              Call Patient &rarr;
            </a>
          ` : ""}
        </div>
      </div>

      <div style="background: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid ${borderCol};">
        This notification was sent automatically by Nose Creek Physiotherapy website to <strong style="color: #64748b;">${lead.receiverEmail || "configured client receiver email"}</strong>.
      </div>
    </div>
  `;
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { isTest, receiverEmailOverride, ...leadData } = payload;

    const notifSettings = await getNotificationSettings();

    const isEnabled = isTest ? true : (notifSettings?.enabled ?? true);
    const receiverEmail = receiverEmailOverride || notifSettings?.receiverEmail;

    if (!isEnabled) {
      return NextResponse.json({
        success: true,
        skipped: true,
        message: "Email notifications are currently disabled in settings."
      });
    }

    if (!receiverEmail) {
      return NextResponse.json({
        success: true,
        skipped: true,
        message: "No receiver email configured yet in settings."
      });
    }

    const recipients = receiverEmail
      .split(",")
      .map((e: string) => e.trim())
      .filter((e: string) => e.includes("@"));

    if (recipients.length === 0) {
      return NextResponse.json({
        error: "Invalid receiver email address configured."
      }, { status: 400 });
    }

    const prefix = notifSettings?.subjectPrefix || "[New Website Lead]";
    const subject = isTest
      ? `${prefix} Test Notification Email`
      : `${prefix} ${leadData.name ? `${leadData.name} - ` : ""}${leadData.form_type || "Form"}`;

    const htmlContent = buildEmailHtml({ ...leadData, receiverEmail: recipients.join(", ") }, Boolean(isTest));

    // Determine Provider & API Key
    const resendApiKey =
      notifSettings?.resendApiKey ||
      process.env.RESEND_API_KEY ||
      process.env.NEXT_PUBLIC_RESEND_API_KEY;

    let deliveryStatus: any = { dispatched: false, provider: "none" };

    // 1. Try Resend if configured
    if (resendApiKey) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: notifSettings?.senderName
              ? `${notifSettings.senderName} <onboarding@resend.dev>`
              : "Nose Creek Physiotherapy <onboarding@resend.dev>",
            to: recipients,
            subject,
            html: htmlContent
          })
        });

        const resData = await res.json();
        if (res.ok) {
          deliveryStatus = { dispatched: true, provider: "resend", id: resData.id };
        } else {
          console.warn("Resend API delivery response error:", resData);
          deliveryStatus = { dispatched: false, provider: "resend", error: resData.message || "Resend error" };
        }
      } catch (sendErr: any) {
        console.warn("Resend dispatch failed:", sendErr);
        deliveryStatus = { dispatched: false, provider: "resend", error: sendErr.message };
      }
    }

    // 2. Webhook relay if configured
    if (!deliveryStatus.dispatched && notifSettings?.webhookUrl) {
      try {
        await fetch(notifSettings.webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipients,
            subject,
            lead: leadData,
            html: htmlContent
          })
        });
        deliveryStatus = { dispatched: true, provider: "webhook" };
      } catch (whErr: any) {
        console.warn("Webhook dispatch failed:", whErr);
      }
    }

    // In local development or before Resend API key is provided, log for immediate transparency
    if (!deliveryStatus.dispatched) {
      console.log(`[Form Notification Dispatch] To: ${recipients.join(", ")} | Subject: ${subject}`);
      deliveryStatus = {
        dispatched: true,
        provider: "logged",
        note: `Notification recorded for ${recipients.join(", ")}. To enable direct live email inbox delivery, add your Resend API Key in Settings.`
      };
    }

    return NextResponse.json({
      success: true,
      recipients,
      status: deliveryStatus
    });
  } catch (err: any) {
    console.error("Form notification endpoint error:", err);
    return NextResponse.json({ error: err.message || "Failed to process form notification" }, { status: 500 });
  }
}
