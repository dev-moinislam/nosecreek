"use client";
import React, { useRef } from "react";
import Link from "next/link";
import { TeamMember } from "@/types/content";
import defaultTeamData from "@/data/team.json";

interface TeamCarouselProps {
  members?: TeamMember[];
}

export default function TeamCarousel({ members }: TeamCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // If members prop is provided, use it; otherwise fallback to defaultTeamData
  const displayMembers: TeamMember[] =
    members && members.length > 0
      ? members
      : (defaultTeamData as TeamMember[]);

  const scroll = (dir: number) => {
    const el = scrollRef.current;
    if (el) el.scrollBy({ left: dir * Math.min(690, el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <section style={{ padding: "clamp(48px,6vw,84px) 0", background: "#fff" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        {/* Header row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, color: "#1c9fd8", letterSpacing: "1.5px", fontSize: 13, textTransform: "uppercase", marginBottom: 12 }}>
              Meet the team
            </div>
            <h2 style={{ fontSize: "clamp(26px,3.6vw,42px)", fontWeight: 800, letterSpacing: "-0.5px" }}>
              The rest of the Nose Creek team
            </h2>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {[{ dir: -1, label: "Previous", sym: "‹" }, { dir: 1, label: "Next", sym: "›" }].map((b) => (
              <button
                key={b.dir}
                onClick={() => scroll(b.dir)}
                aria-label={`${b.label} team members`}
                style={{
                  width: 46, height: 46, borderRadius: "50%",
                  border: "1px solid #d7e6ef", background: "#fff",
                  color: "#0e78a8", fontSize: 22, lineHeight: 1,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                {b.sym}
              </button>
            ))}
          </div>
        </div>

        {/* Scroll track */}
        <div
          ref={scrollRef}
          style={{
            display: "flex", gap: 20,
            overflowX: "auto", scrollSnapType: "x mandatory",
            padding: "4px 4px 12px",
            msOverflowStyle: "none", scrollbarWidth: "none",
          }}
        >
          {displayMembers.map((m) => (
            <Link
              key={m.id || m.slug || m.name}
              href={`/team/${m.slug}`}
              style={{ flex: "0 0 230px", scrollSnapAlign: "start", textDecoration: "none" }}
            >
              <div style={{
                borderRadius: 14, overflow: "hidden", background: "#fff",
                border: "1px solid #e7edf1",
                boxShadow: "0 8px 24px rgba(18,60,80,0.08)",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s ease, box-shadow 0.2s ease"
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.profileImage}
                  alt={m.name}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", objectPosition: "top", background: "#eef3f6", display: "block" }}
                />
                <div style={{ padding: "16px 12px", textAlign: "center", flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 17, color: "#1d2b34" }}>{m.name}</div>
                  <div style={{ fontSize: 13, color: "#5a6570", marginTop: 4, lineHeight: 1.35 }}>{m.role}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 26 }}>
          <Link
            href="/team"
            style={{
              display: "inline-block",
              background: "#1c9fd8", color: "#fff",
              fontFamily: "'Poppins',sans-serif", fontWeight: 700,
              padding: "13px 26px", borderRadius: 9,
              textDecoration: "none"
            }}
          >
            View the full team →
          </Link>
        </div>
      </div>
    </section>
  );
}
