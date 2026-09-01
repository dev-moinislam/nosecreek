import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Lead } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== "https://your-project.supabase.co"
);

// Initialize Supabase client
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : (null as unknown as SupabaseClient);

/**
 * Submit a lead or form inquiry to Supabase
 */
export async function submitLead(lead: Omit<Lead, "id" | "created_at" | "updated_at">): Promise<{ success: boolean; data?: any; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    // If Supabase is not yet configured, save locally in browser storage for demo & inspection
    try {
      if (typeof window !== "undefined") {
        const localLeads = JSON.parse(localStorage.getItem("demo_leads") || "[]");
        const newLead = {
          ...lead,
          id: "local_" + Date.now(),
          created_at: new Date().toISOString(),
          status: lead.status || "new",
          reply_history: lead.reply_history || []
        };
        localLeads.unshift(newLead);
        localStorage.setItem("demo_leads", JSON.stringify(localLeads));
      }
      return { success: true, data: { demo: true } };
    } catch {
      return { success: true };
    }
  }

  try {
    const { data, error } = await supabase.from("form_submissions").insert([
      {
        form_type: lead.form_type,
        name: lead.name || `${lead.first_name || ""} ${lead.last_name || ""}`.trim(),
        first_name: lead.first_name,
        last_name: lead.last_name,
        email: lead.email,
        phone: lead.phone,
        service_interest: lead.service_interest,
        message: lead.message,
        metadata: lead.metadata || {},
        status: lead.status || "new",
        notes: lead.notes || "",
        reply_history: lead.reply_history || []
      }
    ]).select().single();

    if (error) {
      console.error("Supabase submitLead error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("submitLead exception:", err);
    return { success: false, error: err.message || "Failed to submit inquiry" };
  }
}
