"use client";

import React, { useRef } from "react";
import { Testimonial } from "@/types/content";

interface ReviewCarouselProps {
  id?: string;
  testimonials: Testimonial[];
  title?: string;
  subtitle?: string;
}

export default function ReviewCarousel({
  id,
  testimonials,
  title = "Real 5-Star Reviews From Our Calgary Patients",
  subtitle = "See what our patients have to say about their recovery journey at Nose Creek Physiotherapy"
}: ReviewCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const cardWidth = 360;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -cardWidth : cardWidth,
        behavior: "smooth"
      });
    }
  };

  return (
    <section id={id} style={{ background: "#f8fafc", padding: "clamp(56px,7vw,96px) 0", borderTop: "1px solid #e7edf1", borderBottom: "1px solid #e7edf1", scrollMarginTop: 90 }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 24px" }}>
        
        {/* Header with Google Badge and Navigation Arrows */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 20, marginBottom: 36 }}>
          <div style={{ maxWidth: 720 }}>
            {/* Google Rating Pill */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#ffffff", border: "1px solid #dce5ec", padding: "6px 14px", borderRadius: 999, marginBottom: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              {/* Google G SVG */}
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ color: "#f59e0b", fontSize: 14 }}>★★★★★</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#1d2b34" }}>4.9 Rating</span>
                <span style={{ fontSize: 12.5, color: "#5a6570" }}>(545+ Calgary Reviews)</span>
              </div>
            </div>

            <h2 style={{ fontSize: "clamp(26px, 3.8vw, 42px)", fontWeight: 800, color: "#1d2b34", letterSpacing: "-0.5px", lineHeight: 1.18, margin: "0 0 10px" }}>
              {title}
            </h2>
            <p style={{ fontSize: 16, color: "#5a6570", lineHeight: 1.6, margin: 0 }}>
              {subtitle}
            </p>
          </div>

          {/* Carousel Arrows */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
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
        </div>

        {/* Reviews Cards Scroll Container */}
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
          {testimonials.map((review) => (
            <div
              key={review.id}
              style={{
                flex: "0 0 350px",
                scrollSnapAlign: "start",
                background: "#ffffff",
                borderRadius: 18,
                padding: "26px 24px",
                border: "1px solid #e2ebf0",
                boxShadow: "0 8px 24px rgba(18,60,80,0.05)",
                display: "flex",
                flexDirection: "column",
                position: "relative"
              }}
            >
              {/* Top Row: User Avatar, Name, Rating & Google Icon */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {/* User Avatar / Initial */}
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      overflow: "hidden",
                      background: "linear-gradient(135deg, #1c9fd8, #0e78a8)",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 16,
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
                      />
                    ) : (
                      review.author.charAt(0)
                    )}
                  </div>

                  <div>
                    <div style={{ fontSize: 15.5, fontWeight: 700, color: "#1d2b34", lineHeight: 1.2 }}>
                      {review.author}
                    </div>
                    <div style={{ fontSize: 12, color: "#5c9515", fontWeight: 600, display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                      <span>✓ Verified Patient</span>
                      {review.date && <span style={{ color: "#8a97a1" }}>· {review.date}</span>}
                    </div>
                  </div>
                </div>

                {/* Google Icon */}
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #eef3f6" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
              </div>

              {/* 5 Yellow Stars */}
              <div style={{ display: "flex", gap: 2, marginBottom: 12 }}>
                {[...Array(review.rating || 5)].map((_, idx) => (
                  <span key={idx} style={{ color: "#f59e0b", fontSize: 16 }}>★</span>
                ))}
              </div>

              {/* Review Text */}
              <p style={{ fontSize: 14.5, lineHeight: 1.65, color: "#48535c", margin: "0 0 16px", flexGrow: 1 }}>
                &ldquo;{review.text}&rdquo;
              </p>

              {/* Clinic Badge */}
              <div style={{ borderTop: "1px solid #f0f4f7", paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "#8a97a1" }}>
                <span>Nose Creek Physiotherapy</span>
                <span style={{ color: "#1c9fd8", fontWeight: 600 }}>Google Review</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Action Button directing to Reviews Page */}
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <a
            href="https://www.nosecreekphysiotherapy.com/reviews/"
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
            <span>Read All 545+ Reviews on Our Reviews Page</span>
            <span style={{ fontSize: 18 }}>→</span>
          </a>
        </div>

      </div>
    </section>
  );
}
