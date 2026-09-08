import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, data } = body; // type: 'services' | 'conditions' | 'team' | 'locations' | 'settings'

    if (!type || !data) {
      return NextResponse.json({ error: "Missing type or data" }, { status: 400 });
    }

    const filePath = path.resolve(process.cwd(), `src/data/${type}.json`);
    if (fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");

      // Backend Supabase sync for team data
      if (type === "team" && isSupabaseConfigured && supabase && Array.isArray(data)) {
        try {
          const rows = data.map((member: any) => ({
            id: member.slug,
            slug: member.slug,
            name: member.name,
            role: member.role,
            title: member.title || null,
            short_bio: member.shortBio || null,
            full_bio: member.fullBio || null,
            profile_image: member.profileImage || null,
            specialties: member.specialties || [],
            credentials: member.credentials || [],
            education: member.education || [],
            certifications: member.certifications || [],
            experience: member.experience || null,
            locations: member.locations || [],
            services: member.services || [],
            languages: member.languages || [],
            email: member.email || null,
            phone: member.phone || null,
            booking_url: member.bookingUrl || null,
            social_links: {
              ...(member.socialLinks || {}),
              bookingCtaText: member.bookingCtaText || null
            },
            featured: member.featured || false,
            is_director: member.isDirector || false,
            sort_order: member.order || 99,
            is_published: true,
            updated_at: new Date().toISOString()
          }));
          await supabase.from("team_members").upsert(rows, { onConflict: "slug" });
        } catch (sErr) {
          console.warn("Backend Supabase sync warning:", sErr);
        }
      }

      // Instant cache purge across all affected routes
      try {
        if (type === "team") {
          revalidatePath("/team");
          revalidatePath("/team/[slug]", "page");
          revalidatePath("/", "layout");
        } else if (type === "services") {
          revalidatePath("/services");
          revalidatePath("/services/[slug]", "page");
          revalidatePath("/", "layout");
        } else if (type === "conditions") {
          revalidatePath("/conditions");
          revalidatePath("/conditions/[slug]", "page");
          revalidatePath("/", "layout");
        } else if (type === "locations") {
          revalidatePath("/locations");
          revalidatePath("/locations/[slug]", "page");
          revalidatePath("/", "layout");
        } else {
          revalidatePath("/", "layout");
        }
      } catch (e) {
        console.warn("revalidatePath warning:", e);
      }

      return NextResponse.json({ success: true, message: `Updated ${type}.json successfully` });
    }

    return NextResponse.json({ error: `File src/data/${type}.json not found` }, { status: 404 });
  } catch (err: any) {
    console.error("API save-content error:", err);
    return NextResponse.json({ error: err.message || "Failed to save content" }, { status: 500 });
  }
}
