"use client";

import React, { useRef, useState, useEffect } from "react";
import { Testimonial } from "@/types/content";
import defaultTestimonialsData from "@/data/testimonials.json";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export interface ReviewCarouselProps {
  id?: string;
  testimonials?: Testimonial[];
  title?: string;
  subtitle?: string;
  googleRating?: string;
  reviewCount?: string;
  reviewsLink?: string;
  layout?: "carousel" | "masonry";
  customWidgetCode?: string;
}

export const DEFAULT_MASONRY_WIDGET_CODE = `<div data-rw-masonry="26258"></div>
<script>var script = document.createElement("script");script.type = "module";script.src = "https://widgets.thereviewsplace.com/2.0/rw-widget-masonry.js";document.getElementsByTagName("head")[0].appendChild(script);</script>`;

export const GOOGLE_MAPS_REVIEWS_URL =
  "https://www.google.com/maps/place/Nose+Creek+Physiotherapy/@51.126316,-114.0695037,17z/data=!3m1!5s0x537165d72e2e9a4f:0xf87800e6f2762f39!4m8!3m7!1s0x537165d74effbead:0xbe7dc01542416295!8m2!3d51.126316!4d-114.0695037!9m1!1b1!16s%2Fg%2F1tgps902?hl=en-US";

export default function ReviewCarousel({
  id = "reviews-carousel",
  testimonials: propTestimonials,
  title = "Real 5-Star Reviews From Our Calgary Patients",
  subtitle = "See what our patients have to say about their recovery journey at Nose Creek Physiotherapy",
  googleRating = "4.9",
  reviewCount = "545+ Calgary Reviews",
  reviewsLink = GOOGLE_MAPS_REVIEWS_URL,
  layout = "carousel",
  customWidgetCode
}: ReviewCarouselProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const widgetContainerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  const [reviews, setReviews] = useState<Testimonial[]>(
    propTestimonials && propTestimonials.length > 0
      ? propTestimonials
      : (defaultTestimonialsData as Testimonial[])
  );

  const [widgetCode, setWidgetCode] = useState<string>(customWidgetCode || DEFAULT_MASONRY_WIDGET_CODE);

  const [metaInfo, setMetaInfo] = useState({
    rating: googleRating,
    count: reviewCount,
    title: title,
    subtitle: subtitle,
    link: reviewsLink
  });

  const mapUrl =
    metaInfo.link && metaInfo.link.includes("google.com")
      ? metaInfo.link
      : GOOGLE_MAPS_REVIEWS_URL;

  // Sync settings and testimonials from localStorage & Supabase
  useEffect(() => {
    const syncFromSettings = () => {
      try {
        const local = localStorage.getItem("adm_settings");
        if (local) {
          const parsed = JSON.parse(local);
          setMetaInfo((prev) => ({
            ...prev,
            rating: parsed.googleRating || prev.rating,
            count: parsed.googleReviewCount || prev.count,
            title: parsed.reviewsTitle || prev.title,
            subtitle: parsed.reviewsSubtitle || prev.subtitle,
            link: parsed.googleReviewsUrl && parsed.googleReviewsUrl.includes("google.com") ? parsed.googleReviewsUrl : GOOGLE_MAPS_REVIEWS_URL
          }));

          if (parsed.reviewsWidgetCode) {
            if (parsed.reviewsWidgetCode.includes("rw-widget-flash") && !parsed.reviewsWidgetCode.includes("rw-widget-masonry")) {
              setWidgetCode(DEFAULT_MASONRY_WIDGET_CODE);
            } else {
              setWidgetCode(parsed.reviewsWidgetCode);
            }
          }
        }
      } catch {}
    };

    syncFromSettings();
    window.addEventListener("settingsUpdated", syncFromSettings);
    window.addEventListener("storage", syncFromSettings);

    async function fetchLiveContent() {
      let liveReviews: Testimonial[] = defaultTestimonialsData as Testimonial[];

      if (isSupabaseConfigured && supabase) {
        try {
          // 1. Fetch published reviews if not passed via props
          if (!propTestimonials || propTestimonials.length === 0) {
            const { data, error } = await supabase
              .from("testimonials")
              .select("*")
              .eq("is_published", true)
              .order("created_at", { ascending: false });

            if (!error && data && data.length > 0) {
              liveReviews = data.map((d: any) => ({
                id: d.id,
                author: d.author,
                text: d.text,
                rating: Number(d.rating) || 5,
                platform: d.platform || "Google",
                date: d.date || "Verified Patient",
                avatar: d.avatar || "",
                verified: true
              }));
              setReviews(liveReviews);
            }
          }

          // 2. Fetch site settings
          const { data: settingsData } = await supabase
            .from("site_settings")
            .select("google_rating, google_review_count, reviews_title, reviews_subtitle, google_reviews_url, reviews_widget_code")
            .eq("id", "main")
            .single();

          if (settingsData) {
            setMetaInfo((prev) => ({
              ...prev,
              rating: settingsData.google_rating || prev.rating,
              count: settingsData.google_review_count || prev.count,
              title: settingsData.reviews_title || prev.title,
              subtitle: settingsData.reviews_subtitle || prev.subtitle,
              link: settingsData.google_reviews_url && settingsData.google_reviews_url.includes("google.com") ? settingsData.google_reviews_url : GOOGLE_MAPS_REVIEWS_URL
            }));

            if (settingsData.reviews_widget_code) {
              if (settingsData.reviews_widget_code.includes("rw-widget-flash") && !settingsData.reviews_widget_code.includes("rw-widget-masonry")) {
                setWidgetCode(DEFAULT_MASONRY_WIDGET_CODE);
              } else {
                setWidgetCode(settingsData.reviews_widget_code);
              }
            }
          }
        } catch (e) {
          console.warn("Using local reviews fallback:", e);
        }
      }
    }

    // Defer live reviews check until after initial paint
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      (window as any).requestIdleCallback(() => fetchLiveContent());
    } else {
      setTimeout(fetchLiveContent, 2000);
    }

    return () => {
      window.removeEventListener("settingsUpdated", syncFromSettings);
      window.removeEventListener("storage", syncFromSettings);
    };
  }, [propTestimonials]);

  // Lazy-load masonry script when layout === "masonry" and in view
  useEffect(() => {
    if (layout !== "masonry" || !sectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px 0px" }
    );

    observer.observe(sectionRef.current);

    return () => {
      observer.disconnect();
    };
  }, [layout]);

  // Inject masonry widget DOM and module script
  useEffect(() => {
    if (layout !== "masonry" || !inView || !widgetContainerRef.current) return;

    const container = widgetContainerRef.current;
    const htmlClean = widgetCode.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "").trim();

    if (htmlClean.includes("data-rw-")) {
      container.innerHTML = htmlClean;
    } else {
      container.innerHTML = `<div data-rw-masonry="26258"></div>`;
    }

    const srcMatch = widgetCode.match(/src=["']([^"']+)["']/i);
    const scriptSrc = srcMatch
      ? srcMatch[1]
      : "https://widgets.thereviewsplace.com/2.0/rw-widget-masonry.js";

    const scriptTagId = `rw-widget-script-${scriptSrc.replace(/[^a-zA-Z0-9]/g, "-")}`;
    if (!document.getElementById(scriptTagId)) {
      const script = document.createElement("script");
      script.id = scriptTagId;
      script.type = "module";
      script.src = scriptSrc;
      script.async = true;
      document.head.appendChild(script);
    } else {
      try {
        const reTrigger = document.createElement("script");
        reTrigger.type = "module";
        reTrigger.textContent = `import "${scriptSrc}";`;
        document.body.appendChild(reTrigger);
        setTimeout(() => reTrigger.remove(), 1000);
      } catch {}
    }
  }, [layout, inView, widgetCode]);

  // Scroll function for carousel
  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const cardWidth = 370;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -cardWidth : cardWidth,
        behavior: "smooth"
      });
    }
  };

  return (
    <section
      ref={sectionRef}
      id={id}
      style={{
        background: "#f8fafc",
        padding: "clamp(56px,7vw,96px) 0",
        borderTop: "1px solid #e7edf1",
        borderBottom: "1px solid #e7edf1",
        scrollMarginTop: 90
      }}
    >
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 24px" }}>
        
        {/* Header Row: Google Badge, Title, Subtitle & Arrow Controls */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 36,
            flexWrap: "wrap",
            gap: 20
          }}
        >
          <div style={{ maxWidth: 760 }}>
            {/* Google Rating Pill */}
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="View all Google Reviews on Google Maps"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#ffffff",
                border: "1px solid #dce5ec",
                padding: "6px 14px",
                borderRadius: 999,
                marginBottom: 14,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                textDecoration: "none",
                cursor: "pointer"
              }}
            >
              {/* Google G SVG */}
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ color: "#f59e0b", fontSize: 14 }}>★★★★★</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#1d2b34" }}>
                  {metaInfo.rating} Rating
                </span>
                <span style={{ fontSize: 12.5, color: "#5a6570" }}>
                  ({metaInfo.count})
                </span>
              </div>
            </a>

            <h2
              style={{
                fontSize: "clamp(26px, 3.8vw, 42px)",
                fontWeight: 800,
                color: "#1d2b34",
                letterSpacing: "-0.5px",
                lineHeight: 1.18,
                margin: "0 0 10px"
              }}
            >
              {metaInfo.title}
            </h2>
            <p style={{ fontSize: 16, color: "#5a6570", lineHeight: 1.6, margin: 0 }}>
              {metaInfo.subtitle}
            </p>
          </div>

          {/* Navigation Arrow Buttons for Carousel layout */}
          {layout === "carousel" && (
            <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => scroll("left")}
                aria-label="Previous review"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "#ffffff",
                  border: "1.5px solid #dce5ec",
                  color: "#1d2b34",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  transition: "all 0.2s ease"
                }}
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                aria-label="Next review"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "#ffffff",
                  border: "1.5px solid #dce5ec",
                  color: "#1d2b34",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  transition: "all 0.2s ease"
                }}
              >
                →
              </button>
            </div>
          )}
        </div>

        {/* 1. MASONRY LAYOUT (Used on Reviews page) */}
        {layout === "masonry" ? (
          <div
            ref={widgetContainerRef}
            style={{
              minHeight: 320,
              width: "100%",
              margin: "0 auto",
              position: "relative"
            }}
          >
            {/* Fallback skeleton while module loads */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: 20
              }}
            >
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    background: "#ffffff",
                    borderRadius: 16,
                    padding: 24,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.03)"
                  }}
                >
                  <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#e2e8f0" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ width: "60%", height: 14, background: "#e2e8f0", borderRadius: 4, marginBottom: 6 }} />
                      <div style={{ width: "40%", height: 10, background: "#f1f5f9", borderRadius: 4 }} />
                    </div>
                  </div>
                  <div style={{ width: "100%", height: 12, background: "#f1f5f9", borderRadius: 4, marginBottom: 8 }} />
                  <div style={{ width: "90%", height: 12, background: "#f1f5f9", borderRadius: 4 }} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* 2. CAROUSEL LAYOUT (Previous sleek design for Home, Services, Conditions, About) */
          <>
            <div
              ref={scrollRef}
              style={{
                display: "flex",
                gap: 20,
                overflowX: "auto",
                scrollSnapType: "x mandatory",
                scrollbarWidth: "none",
                padding: "8px 4px 20px"
              }}
            >
              {reviews.map((review) => {
                const isLong = Boolean(review.text && review.text.length > 135);
                const displayText = isLong
                  ? review.text.slice(0, 130).trim() + "…"
                  : review.text;

                return (
                  <div
                    key={review.id}
                    style={{
                      flex: "0 0 350px",
                      width: 350,
                      height: 275,
                      scrollSnapAlign: "start",
                      background: "#ffffff",
                      borderRadius: 18,
                      padding: "22px 22px 18px",
                      border: "1px solid #e2ebf0",
                      boxShadow: "0 8px 24px rgba(18,60,80,0.05)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      boxSizing: "border-box",
                      position: "relative"
                    }}
                  >
                    <div>
                      {/* Top Row: User Avatar, Name, Rating & Google Icon */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 12
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                          {/* User Avatar / Initial */}
                          <div
                            style={{
                              width: 42,
                              height: 42,
                              borderRadius: "50%",
                              overflow: "hidden",
                              background: "linear-gradient(135deg, #1c9fd8, #0e78a8)",
                              color: "#ffffff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                              fontSize: 15,
                              flexShrink: 0
                            }}
                          >
                            {review.avatar ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={review.avatar}
                                alt={review.author}
                                referrerPolicy="no-referrer"
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                onError={(e) => {
                                  const target = e.target as HTMLElement;
                                  target.style.display = "none";
                                  if (target.parentElement) {
                                    target.parentElement.innerText = review.author ? review.author.charAt(0).toUpperCase() : "P";
                                  }
                                }}
                              />
                            ) : (
                              review.author ? review.author.charAt(0).toUpperCase() : "P"
                            )}
                          </div>

                          <div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: "#1d2b34", lineHeight: 1.2 }}>
                              {review.author}
                            </div>
                            <div
                              style={{
                                fontSize: 11.5,
                                color: "#5c9515",
                                fontWeight: 600,
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                marginTop: 2
                              }}
                            >
                              <span>✓ Verified Patient</span>
                              {review.date && <span style={{ color: "#8a97a1" }}>· {review.date}</span>}
                            </div>
                          </div>
                        </div>

                        {/* Google Icon linking to Maps */}
                        <a
                          href={mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View on Google Maps"
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: "50%",
                            background: "#f8fafc",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1px solid #eef3f6",
                            textDecoration: "none"
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                          </svg>
                        </a>
                      </div>

                      {/* 5 Yellow Stars */}
                      <div style={{ display: "flex", gap: 2, marginBottom: 8 }}>
                        {[...Array(review.rating || 5)].map((_, idx) => (
                          <span key={idx} style={{ color: "#f59e0b", fontSize: 15 }}>★</span>
                        ))}
                      </div>

                      {/* Review Text with Read More */}
                      <p
                        style={{
                          fontSize: 13.5,
                          lineHeight: 1.5,
                          color: "#48535c",
                          margin: 0
                        }}
                      >
                        &ldquo;{displayText}&rdquo;
                        {isLong && (
                          <a
                            href={mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: "#0e78a8",
                              fontWeight: 600,
                              fontSize: 12.5,
                              marginLeft: 6,
                              textDecoration: "underline",
                              textUnderlineOffset: 2,
                              whiteSpace: "nowrap"
                            }}
                          >
                            Read more on Google Review ↗
                          </a>
                        )}
                      </p>
                    </div>

                    {/* Clinic Badge */}
                    <div
                      style={{
                        borderTop: "1px solid #f0f4f7",
                        paddingTop: 10,
                        marginTop: 10,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: 12,
                        color: "#8a97a1"
                      }}
                    >
                      <span>Nose Creek Physiotherapy</span>
                      <a
                        href={mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#1c9fd8",
                          fontWeight: 600,
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 3
                        }}
                      >
                        <span>Google Review</span>
                        <span style={{ fontSize: 11 }}>↗</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Action Button directing to Google Reviews */}
            <div style={{ textAlign: "center", marginTop: 24 }}>
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#ffffff",
                  color: "#0e78a8",
                  border: "2px solid #cfe6f2",
                  fontFamily: "'Poppins',sans-serif",
                  fontWeight: 700,
                  fontSize: 15,
                  padding: "13px 26px",
                  borderRadius: 10,
                  textDecoration: "none",
                  boxShadow: "0 4px 14px rgba(14,120,168,0.1)",
                  transition: "all 0.2s ease"
                }}
              >
                <span>Read All Reviews on Google / Reviews Page</span>
                <span style={{ fontSize: 18 }}>→</span>
              </a>
            </div>
          </>
        )}

      </div>
    </section>
  );
}
