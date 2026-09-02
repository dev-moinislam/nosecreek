import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import defaultTestimonialsData from "@/data/testimonials.json";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 86400;

const CACHE_FILE = path.join(process.cwd(), "public", "uploads", "google_reviews_cache.json");

interface CachedData {
  lastSync: number; // timestamp
  rating: string;
  totalReviews: string;
  reviews: any[];
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const forceRefresh = searchParams.get("force") === "true";

    // 1. Check local / database 24-hour cache
    let cachedData: CachedData | null = null;
    try {
      if (fs.existsSync(CACHE_FILE)) {
        const fileContent = fs.readFileSync(CACHE_FILE, "utf-8");
        cachedData = JSON.parse(fileContent);
      }
    } catch {}

    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    // If cache is less than 24 hours old and not forced, return cached data immediately
    if (!forceRefresh && cachedData && now - cachedData.lastSync < twentyFourHours) {
      return NextResponse.json({
        success: true,
        source: "cache",
        cachedAt: new Date(cachedData.lastSync).toISOString(),
        nextSyncInHours: Math.round((twentyFourHours - (now - cachedData.lastSync)) / (1000 * 60 * 60)),
        rating: cachedData.rating,
        totalReviews: cachedData.totalReviews,
        reviews: cachedData.reviews,
      });
    }

    // 2. Fetch configuration (Place ID & API Key) from Supabase or environment
    let placeId = process.env.GOOGLE_PLACE_ID || process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID || "";
    let apiKey = process.env.GOOGLE_PLACES_API_KEY || "";

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: settings } = await supabase
          .from("site_settings")
          .select("google_place_id, google_places_api_key, google_rating, google_review_count")
          .eq("id", "main")
          .single();

        if (settings) {
          if (settings.google_place_id) placeId = settings.google_place_id;
          if (settings.google_places_api_key) apiKey = settings.google_places_api_key;
        }
      } catch {}
    }

    let fetchedReviews = defaultTestimonialsData;
    let placeRating = "4.9";
    let placeReviewCount = "545+ Calgary Reviews";

    // 3. If Google Places API Key and Place ID exist, call Google Places Details API
    if (apiKey && placeId) {
      try {
        const googleUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
          placeId
        )}&fields=name,rating,reviews,user_ratings_total,url&key=${encodeURIComponent(apiKey)}`;

        const response = await fetch(googleUrl, { next: { revalidate: 86400 } });
        const googleData = await response.json();

        if (googleData.status === "OK" && googleData.result) {
          const result = googleData.result;
          placeRating = result.rating ? result.rating.toFixed(1) : "4.9";
          placeReviewCount = result.user_ratings_total ? `${result.user_ratings_total}+ Calgary Reviews` : "545+ Calgary Reviews";

          if (result.reviews && Array.isArray(result.reviews) && result.reviews.length > 0) {
            // Map Google reviews to standard format (filtering 4-5 stars)
            fetchedReviews = result.reviews
              .filter((r: any) => (r.rating || 5) >= 4)
              .map((r: any, idx: number) => ({
                id: `google-${r.time || idx}-${Date.now()}`,
                author: r.author_name || "Google Reviewer",
                text: r.text || "",
                rating: r.rating || 5,
                platform: "Google",
                date: r.relative_time_description || "Recent",
                avatar: r.profile_photo_url || "",
                verified: true,
              }));

            // Sync to Supabase Testimonials table
            if (isSupabaseConfigured && supabase) {
              for (const rev of fetchedReviews) {
                await supabase.from("testimonials").upsert({
                  id: rev.id,
                  author: rev.author,
                  text: rev.text,
                  rating: rev.rating,
                  platform: rev.platform,
                  date: rev.date,
                  avatar: rev.avatar || null,
                  is_published: true,
                  updated_at: new Date().toISOString(),
                });
              }

              // Update site settings
              await supabase.from("site_settings").upsert({
                id: "main",
                google_rating: placeRating,
                google_review_count: placeReviewCount,
                last_google_sync: new Date().toISOString(),
              });
            }
          }
        }
      } catch (gErr) {
        console.warn("Google Places API call notice:", gErr);
      }
    }

    // 4. Save 24-hour cache file
    const newCache: CachedData = {
      lastSync: now,
      rating: placeRating,
      totalReviews: placeReviewCount,
      reviews: fetchedReviews,
    };

    try {
      const dir = path.dirname(CACHE_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(CACHE_FILE, JSON.stringify(newCache, null, 2));
    } catch {}

    return NextResponse.json({
      success: true,
      source: apiKey && placeId ? "google_live" : "database_cache",
      cachedAt: new Date(now).toISOString(),
      nextSyncInHours: 24,
      rating: placeRating,
      totalReviews: placeReviewCount,
      reviews: fetchedReviews,
    });
  } catch (err: any) {
    console.error("Google reviews fetch error:", err);
    return NextResponse.json(
      { success: false, error: err.message, reviews: defaultTestimonialsData },
      { status: 500 }
    );
  }
}
