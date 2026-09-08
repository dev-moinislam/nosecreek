import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // e.g. 'services' | 'conditions' | 'team' | 'locations' | 'settings'

    if (type) {
      const filePath = path.resolve(process.cwd(), `src/data/${type}.json`);
      let diskData: any[] = [];
      if (fs.existsSync(filePath)) {
        try {
          diskData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        } catch {}
      }

      if (type === "services" && isSupabaseConfigured && supabase) {
        try {
          const { data: supaServices } = await supabase
            .from("services")
            .select("*")
            .order("sort_order", { ascending: true });
          if (supaServices && supaServices.length > 0) {
            const map = new Map<string, any>();
            diskData.forEach((d) => map.set(d.slug, d));
            supaServices.forEach((s: any) => {
              const existing = map.get(s.slug);
              map.set(s.slug, {
                id: s.id,
                slug: s.slug,
                title: s.title,
                shortDescription: s.short_description || existing?.shortDescription || "",
                description: s.description || existing?.description || "",
                heroImage: s.hero_image || existing?.heroImage || null,
                sideImage: s.side_image || existing?.sideImage || null,
                cardImage: s.card_image || s.cardImage || existing?.cardImage || null,
                iconType: s.icon_type || existing?.iconType || "stethoscope",
                iconBg: s.icon_bg || existing?.iconBg || "#e9f5fb",
                iconColor: s.icon_color || existing?.iconColor || "#1c9fd8",
                ctaText: s.cta_text || existing?.ctaText || "Book Online",
                ctaMuted: s.cta_muted ?? existing?.ctaMuted ?? false,
                benefits: s.benefits || existing?.benefits || [],
                symptoms: s.symptoms || existing?.symptoms || [],
                treatmentApproach: s.treatment_approach || existing?.treatmentApproach || [],
                customSections: s.custom_sections || existing?.customSections || [],
                faqs: s.faqs || existing?.faqs || [],
                relatedServices: s.related_services || existing?.relatedServices || [],
                relatedConditions: s.related_conditions || existing?.relatedConditions || [],
                teamMembers: s.team_members || existing?.teamMembers || [],
                locations: s.locations || existing?.locations || [],
                testimonials: s.testimonials || existing?.testimonials || [],
                seo: s.seo || existing?.seo || {}
              });
            });
            return NextResponse.json(Array.from(map.values()));
          }
        } catch {}
      }

      if (diskData.length > 0) {
        return NextResponse.json(diskData);
      }
      return NextResponse.json({ error: `File ${type}.json not found` }, { status: 404 });
    }

    // Return all main content sets
    const readJson = (name: string) => {
      try {
        const p = path.resolve(process.cwd(), `src/data/${name}.json`);
        if (fs.existsSync(p)) {
          return JSON.parse(fs.readFileSync(p, "utf-8"));
        }
      } catch {}
      return [];
    };

    return NextResponse.json({
      services: readJson("services"),
      conditions: readJson("conditions"),
      team: readJson("team"),
      locations: readJson("locations"),
      settings: readJson("settings"),
      blog: readJson("blog")
    });
  } catch (err: any) {
    console.error("API /api/content error:", err);
    return NextResponse.json({ error: err.message || "Failed to load content" }, { status: 500 });
  }
}
