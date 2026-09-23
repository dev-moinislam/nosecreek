import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/serverAuth";
import { supabaseServer, isSupabaseServerConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET: Fetch leads or unread count (Admin / Client authenticated only)
export async function GET(req: NextRequest) {
  const { user, errorResponse } = await requireAuth(req);
  if (!user || errorResponse) return errorResponse;

  if (!isSupabaseServerConfigured || !supabaseServer) {
    return NextResponse.json({ success: true, leads: [], count: 0 });
  }

  const { searchParams } = new URL(req.url);
  const countOnly = searchParams.get("countOnly") === "true";
  const status = searchParams.get("status");
  const formType = searchParams.get("form_type");

  try {
    if (countOnly) {
      const { count, error } = await supabaseServer
        .from("form_submissions")
        .select("*", { count: "exact", head: true })
        .eq("status", "new");

      if (error) throw error;
      return NextResponse.json({ success: true, count: count || 0 });
    }

    let query = supabaseServer
      .from("form_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }
    if (formType && formType !== "all") {
      query = query.eq("form_type", formType);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, leads: data || [] });
  } catch (err: any) {
    console.error("[Leads API Error]", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to fetch leads." },
      { status: 500 }
    );
  }
}

// PATCH: Update lead status or reply history (Admin / Client authenticated only)
export async function PATCH(req: NextRequest) {
  const { user, errorResponse } = await requireAuth(req);
  if (!user || errorResponse) return errorResponse;

  if (!isSupabaseServerConfigured || !supabaseServer) {
    return NextResponse.json({ success: false, error: "Database not configured." }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { id, status, reply_history, notes } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Lead ID is required." }, { status: 400 });
    }

    const updates: Record<string, any> = {};
    if (status !== undefined) updates.status = status;
    if (reply_history !== undefined) updates.reply_history = reply_history;
    if (notes !== undefined) updates.notes = notes;

    const { data, error } = await supabaseServer
      .from("form_submissions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, lead: data });
  } catch (err: any) {
    console.error("[Leads PATCH Error]", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to update lead." },
      { status: 500 }
    );
  }
}

// DELETE: Delete lead (Master Admin only)
export async function DELETE(req: NextRequest) {
  const { user, errorResponse } = await requireAuth(req, "admin");
  if (!user || errorResponse) return errorResponse;

  if (!isSupabaseServerConfigured || !supabaseServer) {
    return NextResponse.json({ success: false, error: "Database not configured." }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Lead ID is required." }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from("form_submissions")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Lead deleted successfully." });
  } catch (err: any) {
    console.error("[Leads DELETE Error]", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to delete lead." },
      { status: 500 }
    );
  }
}
