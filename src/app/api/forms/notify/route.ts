import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export const runtime = "nodejs";

interface AutoReplySettings {
  enabled: boolean;
  subject?: string;
  headline?: string;
  customMessage?: string;
}

interface NotificationSettings {
  enabled: boolean;
  receiverEmail: string;
  senderName?: string;
  senderEmail?: string;
  subjectPrefix?: string;
  provider?: "resend" | "smtp" | "webhook";
  resendApiKey?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  webhookUrl?: string;
  autoReply?: AutoReplySettings;
}

async function getNotificationSettings(): Promise<NotificationSettings | null> {
  // 1. Try Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase
        .from("site_settings")
        .select("marketing")
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
      if (parsed.marketing?.notifications) {
        return parsed.marketing.notifications;
      }
    }
  } catch (err) {
    console.warn("Could not read settings.json for notifications:", err);
  }

  return null;
}

/**
 * Returns human-readable label, badge color, and icon for any form type
 */
function getFormBadge(formType: string = "") {
  const normalized = (formType || "").toLowerCase().trim();

  if (normalized.includes("appointment") || normalized === "booking") {
    return {
      title: "Appointment Booking Request",
      tag: "APPOINTMENT BOOKING",
      color: "#0e78a8",
      icon: "📅"
    };
  }
  if (normalized.includes("contact") || normalized === "inquiry") {
    return {
      title: "Contact Page Inquiry",
      tag: "CONTACT INQUIRY",
      color: "#059669",
      icon: "✉️"
    };
  }
  if (normalized.includes("workshop_registration") || normalized === "workshop") {
    return {
      title: "Workshop Registration",
      tag: "WORKSHOP SIGN-UP",
      color: "#7c3aed",
      icon: "🎓"
    };
  }
  if (normalized.includes("replay")) {
    return {
      title: "Workshop Replay Request",
      tag: "WORKSHOP REPLAY",
      color: "#d97706",
      icon: "▶️"
    };
  }
  if (normalized.includes("test")) {
    return {
      title: "Verification Test Email",
      tag: "SYSTEM TEST",
      color: "#2563eb",
      icon: "🧪"
    };
  }

  // Generic / Future custom forms fallback
  const pretty = formType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    title: `${pretty || "Website Form"} Submission`,
    tag: formType.toUpperCase().replace(/_/g, " ") || "FORM SUBMISSION",
    color: "#0e78a8",
    icon: "📝"
  };
}

/**
 * Email template sent to the Clinic / Client receiver email
 */
function buildClinicNotificationHtml(lead: any, isTest = false): string {
  const brandTeal = "#0e78a8";
  const bgLight = "#f8fafc";
  const borderCol = "#e2e8f0";

  const formInfo = getFormBadge(lead.form_type || lead.formType || "Inquiry");
  const dateStr = new Date().toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "America/Edmonton"
  });

  const submittedPage = lead.metadata?.page || lead.metadata?.requested_service || lead.page || null;

  if (isTest) {
    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid ${borderCol}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06);">
        <div style="background: ${brandTeal}; padding: 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 20px; font-weight: 700;">Nose Creek Physiotherapy</h1>
          <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">Form Notification Email System Test</p>
        </div>

        <div style="padding: 28px;">
          <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px; margin-bottom: 20px; color: #065f46;">
            <div style="font-size: 16px; font-weight: 800; margin-bottom: 4px;">✓ Email Connection Verified!</div>
            <div style="font-size: 13.5px; line-height: 1.5;">
              Your email forwarding is active. When patients fill out any form on your website, you will receive full details immediately in this inbox.
            </div>
          </div>

          <div style="background: #e0f2fe; border: 1px solid #bae6fd; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
            <div style="font-size: 11px; font-weight: 800; color: #0284c7; text-transform: uppercase; letter-spacing: 0.5px;">FORM IDENTIFICATION</div>
            <div style="font-size: 13px; color: #0369a1; margin-top: 4px; line-height: 1.5;">
              Every incoming email clearly states the form name (e.g. <strong>[Appointment Booking Request]</strong> or <strong>[Contact Page Inquiry]</strong>) in the subject line and header.
            </div>
          </div>

          <div style="background: ${bgLight}; border-radius: 8px; padding: 14px; border: 1px solid ${borderCol}; font-size: 13px; color: #64748b;">
            <div><strong>Recipient:</strong> ${lead.receiverEmail}</div>
            <div style="margin-top: 4px;"><strong>Test Timestamp:</strong> ${dateStr}</div>
          </div>
        </div>

        <div style="background: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid ${borderCol};">
          Nose Creek Physiotherapy &bull; Automated Website Notification System
        </div>
      </div>
    `;
  }

  const name = lead.name || `${lead.first_name || ""} ${lead.last_name || ""}`.trim() || "Website Visitor";

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid ${borderCol}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06);">
      
      <!-- Top Clinic Banner -->
      <div style="background: ${brandTeal}; padding: 22px 26px; color: #ffffff;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.9; font-weight: 700;">Nose Creek Physiotherapy</span>
          <span style="background: rgba(255,255,255,0.2); padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px;">NEW PATIENT LEAD</span>
        </div>
        <h1 style="margin: 0; font-size: 22px; font-weight: 800;">${name}</h1>
      </div>

      <div style="padding: 26px;">
        
        <!-- PROMINENT FORM TYPE HIGHLIGHT BANNER -->
        <div style="background: #f0f9ff; border: 2px solid ${brandTeal}; border-radius: 10px; padding: 14px 18px; margin-bottom: 22px;">
          <div style="font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: #0284c7;">
            SUBMITTED FORM TYPE
          </div>
          <div style="font-size: 19px; font-weight: 800; color: #0c4a6e; margin-top: 4px; display: flex; align-items: center; gap: 8px;">
            <span>${formInfo.icon}</span>
            <span>${formInfo.title}</span>
          </div>
          ${submittedPage ? `
            <div style="font-size: 12.5px; color: #64748b; margin-top: 6px; border-top: 1px dashed #cbd5e1; padding-top: 6px;">
              Submitted from: <span style="font-family: monospace; color: #0369a1; font-weight: 600;">${submittedPage}</span>
            </div>
          ` : ""}
        </div>

        <!-- Details Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 22px;">
          <tbody>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; font-size: 13px; font-weight: 600; color: #64748b; width: 140px;">Patient Name</td>
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
                ${lead.phone ? `<a href="tel:${lead.phone}" style="color: #0f172a; text-decoration: none; font-weight: 700;">${lead.phone}</a>` : "Not provided"}
              </td>
            </tr>
            ${lead.service_interest ? `
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; font-size: 13px; font-weight: 600; color: #64748b;">Service / Interest</td>
              <td style="padding: 10px 0; font-size: 14px; color: #0f172a; font-weight: 600;">${lead.service_interest}</td>
            </tr>` : ""}
            ${lead.preferredLocation ? `
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; font-size: 13px; font-weight: 600; color: #64748b;">Preferred Location</td>
              <td style="padding: 10px 0; font-size: 14px; color: #0f172a; font-weight: 600;">${lead.preferredLocation}</td>
            </tr>` : ""}
            <tr>
              <td style="padding: 10px 0; font-size: 13px; font-weight: 600; color: #64748b;">Date & Time</td>
              <td style="padding: 10px 0; font-size: 13px; color: #64748b;">${dateStr}</td>
            </tr>
          </tbody>
        </table>

        <!-- Message Box -->
        ${lead.message ? `
          <div style="background: ${bgLight}; border: 1px solid ${borderCol}; border-radius: 8px; padding: 16px; margin-bottom: 22px;">
            <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 6px; letter-spacing: 0.5px;">Inquiry / Patient Note:</div>
            <div style="font-size: 14px; color: #1e293b; line-height: 1.6; white-space: pre-wrap;">${lead.message}</div>
          </div>
        ` : ""}

        <!-- Quick Action Buttons for Clinic Staff -->
        <div style="text-align: center; margin-top: 24px;">
          ${lead.email ? `
            <a href="mailto:${lead.email}?subject=Re: Your ${formInfo.title} - Nose Creek Physiotherapy" style="display: inline-block; background: ${brandTeal}; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; margin-right: 8px;">
              ✉️ Reply by Email &rarr;
            </a>
          ` : ""}
          ${lead.phone ? `
            <a href="tel:${lead.phone}" style="display: inline-block; background: #f1f5f9; color: #0f172a; border: 1px solid #cbd5e1; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 14px;">
              📞 Call Patient &rarr;
            </a>
          ` : ""}
        </div>
      </div>

      <div style="background: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid ${borderCol};">
        Dispatched automatically to client receiver inbox: <strong style="color: #64748b;">${lead.receiverEmail || "configured client receiver email"}</strong>
      </div>
    </div>
  `;
}

/**
 * Professional Auto-Reply confirmation email sent directly to the Patient / Visitor
 */
function buildPatientAutoReplyHtml(lead: any, notifSettings: NotificationSettings): string {
  const brandTeal = "#0e78a8";
  const bgLight = "#f8fafc";
  const borderCol = "#e2e8f0";
  const name = lead.first_name || lead.name || "there";
  const formInfo = getFormBadge(lead.form_type || lead.formType || "Inquiry");

  const customMessage = notifSettings.autoReply?.customMessage ||
    "Thank you for contacting Nose Creek Physiotherapy! We have received your request and our clinical care team will contact you shortly to confirm your details or appointment.";

  const dateStr = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Edmonton"
  });

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid ${borderCol}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06);">
      <!-- Top Clinic Banner -->
      <div style="background: ${brandTeal}; padding: 24px 28px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">Nose Creek Physiotherapy</h1>
        <p style="margin: 6px 0 0 0; font-size: 13.5px; opacity: 0.95;">Calgary North (Beddington) &bull; Est. 2001</p>
      </div>

      <div style="padding: 28px;">
        <!-- Greeting & Confirmation -->
        <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #0f172a;">
          Hello ${name},
        </h2>

        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px; margin-bottom: 22px; color: #065f46;">
          <div style="font-size: 15px; font-weight: 700; margin-bottom: 4px;">
            ✓ We have received your ${formInfo.title}!
          </div>
          <div style="font-size: 13.5px; line-height: 1.5;">
            ${customMessage}
          </div>
        </div>

        <!-- Summary of Submission -->
        <div style="border: 1px solid ${borderCol}; border-radius: 10px; padding: 18px; margin-bottom: 24px; background: ${bgLight};">
          <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 12px; letter-spacing: 0.5px;">
            Summary of Your Submission:
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 13.5px;">
            <tbody>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px 0; color: #64748b; width: 140px;">Request Type:</td>
                <td style="padding: 8px 0; font-weight: 700; color: #0f172a;">${formInfo.title}</td>
              </tr>
              ${lead.service_interest ? `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px 0; color: #64748b;">Service / Interest:</td>
                <td style="padding: 8px 0; font-weight: 600; color: #0f172a;">${lead.service_interest}</td>
              </tr>` : ""}
              ${lead.preferredLocation ? `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px 0; color: #64748b;">Clinic Location:</td>
                <td style="padding: 8px 0; font-weight: 600; color: #0f172a;">${lead.preferredLocation}</td>
              </tr>` : ""}
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Received:</td>
                <td style="padding: 8px 0; color: #64748b;">${dateStr}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Clinic Contact & Urgent Help -->
        <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; padding: 18px; margin-bottom: 24px;">
          <div style="font-size: 13.5px; font-weight: 700; color: #0369a1; margin-bottom: 6px;">
            Need to reach us right away?
          </div>
          <div style="font-size: 13px; color: #0c4a6e; line-height: 1.5; margin-bottom: 12px;">
            If you need an immediate appointment or have an urgent question, our front desk team is ready to help you:
          </div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <a href="tel:403-295-8590" style="display: inline-block; background: ${brandTeal}; color: #ffffff; text-decoration: none; padding: 10px 18px; border-radius: 6px; font-weight: 700; font-size: 13px;">
              📞 Call: (403) 295-8590
            </a>
            <a href="https://www.nosecreekphysiotherapy.com" style="display: inline-block; background: #ffffff; color: ${brandTeal}; border: 1px solid ${brandTeal}; text-decoration: none; padding: 10px 18px; border-radius: 6px; font-weight: 700; font-size: 13px;">
              🌐 Visit Website
            </a>
          </div>
        </div>

        <!-- Clinic Hours & Address -->
        <div style="font-size: 12px; color: #64748b; line-height: 1.6; border-top: 1px solid ${borderCol}; padding-top: 16px;">
          <strong>Nose Creek Physiotherapy - Beddington Clinic</strong><br/>
          📍 #22, 8120 Beddington Blvd NW, Calgary, AB T3K 2A8<br/>
          🕒 Mon-Thu: 7:00 am – 8:00 pm | Fri: 7:00 am – 6:00 pm | Sat: 8:00 am – 1:00 pm | Sun: Closed
        </div>
      </div>

      <div style="background: #f8fafc; padding: 14px; text-align: center; font-size: 11.5px; color: #94a3b8; border-top: 1px solid ${borderCol};">
        You are receiving this confirmation email because you submitted a form on nosecreekphysiotherapy.com.
      </div>
    </div>
  `;
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { isTest, receiverEmailOverride, tempSettings, ...leadData } = payload;

    // Use in-memory tempSettings if provided (e.g. during live test in admin dashboard), or load saved settings
    const notifSettings = tempSettings || (await getNotificationSettings());

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
        success: false,
        error: "No client receiver email is configured. Please enter a receiver email in Admin > Email Notifications."
      }, { status: 400 });
    }

    const recipients = receiverEmail
      .split(",")
      .map((e: string) => e.trim())
      .filter((e: string) => e.includes("@"));

    if (recipients.length === 0) {
      return NextResponse.json({
        success: false,
        error: "Invalid receiver email address configured. Please provide a valid email."
      }, { status: 400 });
    }

    const formInfo = getFormBadge(leadData.form_type || leadData.formType || (isTest ? "test" : "inquiry"));
    const prefix = notifSettings?.subjectPrefix || "[New Website Lead]";

    // Crystal-clear subject line stating WHICH form was submitted
    const subject = isTest
      ? `${prefix} [${formInfo.title}] Email Verification Test`
      : `${prefix} [${formInfo.title}] ${leadData.name ? `${leadData.name} - ` : ""}Nose Creek Physiotherapy`;

    const htmlContent = buildClinicNotificationHtml({ ...leadData, receiverEmail: recipients.join(", ") }, Boolean(isTest));

    const provider = notifSettings?.provider || "smtp";
    let deliveryStatus: any = { dispatched: false, provider };

    // 1. SMTP Provider (Nodemailer)
    if (provider === "smtp" || (notifSettings?.smtpHost && notifSettings?.smtpUser && notifSettings?.smtpPass)) {
      if (!notifSettings.smtpHost || !notifSettings.smtpUser || !notifSettings.smtpPass) {
        return NextResponse.json({
          success: false,
          error: "SMTP is selected but SMTP Host, Username, or Password is missing. Please enter your SMTP details or switch to Resend API."
        }, { status: 400 });
      }

      try {
        const port = Number(notifSettings.smtpPort) || 465;
        const isSecure = port === 465;

        const transporter = nodemailer.createTransport({
          host: notifSettings.smtpHost,
          port,
          secure: isSecure,
          auth: {
            user: notifSettings.smtpUser,
            pass: notifSettings.smtpPass
          },
          tls: {
            rejectUnauthorized: false
          }
        });

        const senderDisplayName = notifSettings.senderName || "Nose Creek Website Forms";
        const senderAddress = notifSettings.senderEmail || notifSettings.smtpUser;

        // A. Send notification to the Clinic Staff / Receiver Email
        const info = await transporter.sendMail({
          from: `"${senderDisplayName}" <${senderAddress}>`,
          to: recipients,
          replyTo: leadData.email || senderAddress,
          subject,
          html: htmlContent
        });

        deliveryStatus = {
          dispatched: true,
          provider: "smtp",
          messageId: info.messageId
        };

        // B. Send Automatic Confirmation Reply to the Patient / Visitor (if enabled and patient email is valid)
        const isAutoReplyEnabled = notifSettings.autoReply?.enabled !== false;
        const patientEmail = leadData.email?.trim();
        const isValidPatientEmail = patientEmail && patientEmail.includes("@") && !patientEmail.includes("test@patient.com") && !patientEmail.includes("test@example.com");

        if (!isTest && isAutoReplyEnabled && isValidPatientEmail) {
          try {
            const patientSubject = notifSettings.autoReply?.subject || `Thank you for contacting Nose Creek Physiotherapy - We've received your request`;
            const patientHtml = buildPatientAutoReplyHtml(leadData, notifSettings);

            await transporter.sendMail({
              from: `"${notifSettings.senderName || "Nose Creek Physiotherapy"}" <${senderAddress}>`,
              to: patientEmail,
              replyTo: recipients[0] || senderAddress,
              subject: patientSubject,
              html: patientHtml
            });

            deliveryStatus.autoReply = { sent: true, recipient: patientEmail };
          } catch (autoErr) {
            console.warn("Patient auto-reply failed to send:", autoErr);
            deliveryStatus.autoReply = { sent: false, error: (autoErr as any)?.message };
          }
        }
      } catch (smtpErr: any) {
        console.error("SMTP delivery failed:", smtpErr);
        return NextResponse.json({
          success: false,
          error: `SMTP Error: ${smtpErr.message || "Failed to authenticate or send via SMTP"}. Please verify your SMTP Host, Port, and Password/App Password.`
        }, { status: 500 });
      }
    }

    // 2. Resend API Provider
    else if (provider === "resend") {
      const resendApiKey =
        notifSettings?.resendApiKey ||
        process.env.RESEND_API_KEY ||
        process.env.NEXT_PUBLIC_RESEND_API_KEY;

      if (!resendApiKey) {
        return NextResponse.json({
          success: false,
          error: "Resend is selected but no Resend API Key is provided. Enter your API key in Admin > Email Notifications or switch to SMTP."
        }, { status: 400 });
      }

      try {
        const sender = notifSettings?.senderEmail
          ? `${notifSettings.senderName || "Nose Creek Forms"} <${notifSettings.senderEmail}>`
          : `${notifSettings?.senderName || "Nose Creek Forms"} <onboarding@resend.dev>`;

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: sender,
            to: recipients,
            reply_to: leadData.email || undefined,
            subject,
            html: htmlContent
          })
        });

        const resData = await res.json();
        if (res.ok && resData.id) {
          deliveryStatus = { dispatched: true, provider: "resend", id: resData.id };

          // Send Patient Auto-Reply via Resend (if enabled)
          const isAutoReplyEnabled = notifSettings.autoReply?.enabled !== false;
          const patientEmail = leadData.email?.trim();
          const isValidPatientEmail = patientEmail && patientEmail.includes("@") && !patientEmail.includes("test@patient.com") && !patientEmail.includes("test@example.com");

          if (!isTest && isAutoReplyEnabled && isValidPatientEmail) {
            try {
              const patientSubject = notifSettings.autoReply?.subject || `Thank you for contacting Nose Creek Physiotherapy - We've received your request`;
              const patientHtml = buildPatientAutoReplyHtml(leadData, notifSettings);

              await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${resendApiKey}`,
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  from: sender,
                  to: [patientEmail],
                  reply_to: recipients[0] || undefined,
                  subject: patientSubject,
                  html: patientHtml
                })
              });
              deliveryStatus.autoReply = { sent: true, recipient: patientEmail };
            } catch (autoErr) {
              console.warn("Resend patient auto-reply failed:", autoErr);
            }
          }
        } else {
          console.error("Resend API response error:", resData);
          return NextResponse.json({
            success: false,
            error: `Resend API Error: ${resData.message || resData.error || "Failed to send email via Resend"}. (Note: If using unverified onboarding@resend.dev, Resend only allows sending to the email registered on your Resend account).`
          }, { status: 500 });
        }
      } catch (sendErr: any) {
        console.error("Resend dispatch exception:", sendErr);
        return NextResponse.json({
          success: false,
          error: `Resend Connection Error: ${sendErr.message || "Failed to reach Resend API"}`
        }, { status: 500 });
      }
    }

    // 3. Webhook Provider
    else if (provider === "webhook") {
      if (!notifSettings?.webhookUrl) {
        return NextResponse.json({
          success: false,
          error: "Webhook Relay is selected but no Webhook URL was provided."
        }, { status: 400 });
      }

      try {
        const whRes = await fetch(notifSettings.webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipients,
            subject,
            formType: formInfo.title,
            lead: leadData,
            html: htmlContent
          })
        });

        if (whRes.ok) {
          deliveryStatus = { dispatched: true, provider: "webhook" };
        } else {
          return NextResponse.json({
            success: false,
            error: `Webhook returned HTTP ${whRes.status}: ${whRes.statusText}`
          }, { status: 500 });
        }
      } catch (whErr: any) {
        return NextResponse.json({
          success: false,
          error: `Webhook dispatch failed: ${whErr.message}`
        }, { status: 500 });
      }
    } else {
      return NextResponse.json({
        success: false,
        error: "No email delivery provider configured. Please configure SMTP or Resend API in Admin > Email Notifications."
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      recipients,
      formType: formInfo.title,
      status: deliveryStatus
    });
  } catch (err: any) {
    console.error("Form notification endpoint error:", err);
    return NextResponse.json({ error: err.message || "Failed to process form notification" }, { status: 500 });
  }
}
