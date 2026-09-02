"use client";

import React, { useState, useEffect } from "react";
import defaultLocations from "@/data/locations.json";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

interface VisitUsSectionProps {
  customEyebrow?: string;
  customTitle?: string;
}

function getEmbedMapUrl(rawUrl?: string, address?: string, name?: string): string {
  const defaultPinUrl = `https://www.google.com/maps?q=${encodeURIComponent(
    (name || "Nose Creek Physiotherapy") + " " + (address ? address.replace(/\n/g, ", ") : "8220 Centre St NE #153, Calgary, AB T3K 1J7")
  )}&output=embed`;

  if (!rawUrl || rawUrl.trim() === "") {
    return defaultPinUrl;
  }

  let url = rawUrl.trim();

  // 1. If user pasted iframe HTML: <iframe src="..."></iframe>
  const iframeMatch = url.match(/src=["']([^"']+)["']/i);
  if (iframeMatch && iframeMatch[1]) {
    url = iframeMatch[1];
  }

  // 2. If it is old area polygon pb embed that didn't have clinic pin
  if (url.includes("0x7d6f51be0e6f6630") || (url.includes("pb=") && !url.toLowerCase().includes("physiotherapy"))) {
    return defaultPinUrl;
  }

  // 3. If it is already a valid Google Maps embed URL with output=embed or /embed?pb=
  if (url.includes("output=embed") || url.includes("/embed?pb=") || url.includes("/maps/embed")) {
    return url;
  }

  // 4. If user pasted a place link like: https://www.google.com/maps/place/...
  if (url.includes("google.com/maps/place/")) {
    const placeMatch = url.match(/google\.com\/maps\/place\/([^/@?]+)/);
    if (placeMatch && placeMatch[1]) {
      const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
      const cleanAddress = address ? address.replace(/\n/g, ", ") : "";
      return `https://www.google.com/maps?q=${encodeURIComponent(placeName + (cleanAddress ? " " + cleanAddress : ""))}&output=embed`;
    }
  }

  // 5. If user pasted search link: https://www.google.com/maps/search/... or https://maps.google.com/?q=...
  if (url.includes("google.com/maps") && (url.includes("q=") || url.includes("query="))) {
    const qMatch = url.match(/[?&](?:q|query)=([^&]+)/);
    if (qMatch && qMatch[1]) {
      return `https://www.google.com/maps?q=${qMatch[1]}&output=embed`;
    }
  }

  // 6. If it's a search term or custom text
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://www.google.com/maps?q=${encodeURIComponent(url)}&output=embed`;
  }

  return defaultPinUrl;
}

export default function VisitUsSection({ customEyebrow, customTitle }: VisitUsSectionProps) {
  // Grab primary location config
  const initialLoc = defaultLocations[0] as any;
  const [loc, setLoc] = useState(initialLoc);

  useEffect(() => {
    async function syncLoc() {
      // 1. Fetch directly from Supabase Database
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase.from("locations").select("*").eq("is_published", true).limit(1);
          if (!error && data && data.length > 0) {
            const d = data[0];
            setLoc({
              id: d.id,
              name: d.name,
              slug: d.slug,
              address: d.address,
              phone: d.phone,
              email: d.email,
              eyebrow: d.seo?.eyebrow || "Visit us",
              title: d.seo?.title || "One clinic, ideally located in Calgary",
              directionsUrl: d.seo?.directionsUrl || "https://www.google.com/maps/dir//Nose+Creek+Physiotherapy",
              insuranceNote: d.seo?.insuranceNote || "Insurance-covered physiotherapy · Extended-health direct billing available.",
              hoursList: d.seo?.hoursList || [
                { day: "Monday – Friday", hours: "6:45 AM – 7:15 PM" },
                { day: "Saturday", hours: "8:00 AM – 2:00 PM" },
                { day: "Sunday", hours: "Closed" }
              ],
              openingHours: d.opening_hours || {},
              mapEmbedUrl: d.map_embed_url || "",
              services: d.services || [],
              teamMembers: d.team_members || [],
              testimonials: d.testimonials || [],
              description: d.description || "",
              images: d.images || [],
              bookingUrl: d.booking_url || "",
              seo: d.seo || {}
            });
            return;
          }
        } catch {}
      }

      // 2. Fallback to default locations data
      if (defaultLocations && defaultLocations.length > 0) {
        setLoc(defaultLocations[0]);
      }
    }

    syncLoc();
    window.addEventListener("locationsUpdated", syncLoc);
    return () => {
      window.removeEventListener("locationsUpdated", syncLoc);
    };
  }, []);

  const eyebrowText = customEyebrow || loc?.eyebrow || "Visit us";
  const titleText = customTitle || loc?.title || "One clinic, ideally located in Calgary";
  const clinicName = loc?.name || "Nose Creek Physiotherapy";
  const addressText = loc?.address || "8220 Centre St NE #153\nCalgary, AB T3K 1J7, Canada";
  const phoneText = loc?.phone || "403.295.8590";
  const phoneClean = phoneText.replace(/[^0-9+]/g, "");
  const mapUrl = getEmbedMapUrl(loc?.mapEmbedUrl, addressText, clinicName);
  const directionsUrl =
    loc?.directionsUrl || "https://www.google.com/maps/dir//Nose+Creek+Physiotherapy";

  const hours = loc?.hoursList || [
    { day: "Monday – Friday", hours: "6:45 AM – 7:15 PM" },
    { day: "Saturday", hours: "8:00 AM – 2:00 PM" },
    { day: "Sunday", hours: "Closed" }
  ];

  const insuranceNote =
    loc?.insuranceNote ||
    "Insurance-covered physiotherapy · Extended-health direct billing available.";

  return (
    <section id="contact" style={{ padding: "clamp(56px, 7vw, 96px) 0", background: "#fff" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
        
        {/* Section Header */}
        <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 44px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#e6f4ea",
              color: "#5c9515",
              fontFamily: "'Poppins',sans-serif",
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              padding: "5px 14px",
              borderRadius: 999,
              marginBottom: 12
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6faf1c" }} />
            {eyebrowText}
          </div>

          <h2
            style={{
              fontFamily: "'Poppins',sans-serif",
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 800,
              color: "#1d2b34",
              letterSpacing: "-0.5px",
              margin: 0
            }}
          >
            {titleText}
          </h2>
        </div>

        {/* 2-Column Grid: Map & Info Card */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 28,
            alignItems: "stretch"
          }}
        >
          {/* Map Box */}
          <div
            style={{
              borderRadius: 18,
              overflow: "hidden",
              boxShadow: "0 10px 30px rgba(18,60,80,0.1)",
              minHeight: 340,
              backgroundColor: "#eef3f6"
            }}
          >
            <iframe
              title={`Map to ${clinicName}`}
              src={mapUrl}
              style={{ width: "100%", height: "100%", minHeight: 340, border: 0, display: "block" }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Info Card */}
          <div
            style={{
              background: "#12303d",
              color: "#eaf3f8",
              borderRadius: 18,
              padding: "clamp(26px, 3vw, 38px)",
              display: "flex",
              flexDirection: "column",
              gap: 18
            }}
          >
            <div>
              <h3 style={{ color: "#fff", fontSize: 22, fontWeight: 700, fontFamily: "'Poppins',sans-serif", margin: 0 }}>
                {clinicName}
              </h3>
              <p style={{ marginTop: 8, fontSize: 15, color: "#cbdbe4", lineHeight: 1.6, whiteSpace: "pre-line", margin: "8px 0 0" }}>
                {addressText}
              </p>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <a
                href={`tel:${phoneClean}`}
                style={{
                  background: "#8cc63f",
                  color: "#12303d",
                  fontFamily: "'Poppins',sans-serif",
                  fontWeight: 700,
                  padding: "12px 20px",
                  borderRadius: 9,
                  textDecoration: "none"
                }}
              >
                Call {phoneText}
              </a>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  border: "1px solid #3d5b68",
                  color: "#eaf3f8",
                  fontFamily: "'Poppins',sans-serif",
                  fontWeight: 700,
                  padding: "12px 20px",
                  borderRadius: 9,
                  textDecoration: "none"
                }}
              >
                Get directions
              </a>
            </div>

            <div style={{ borderTop: "1px solid #244452", paddingTop: 16 }}>
              <div
                style={{
                  fontFamily: "'Poppins',sans-serif",
                  fontWeight: 700,
                  color: "#8cc63f",
                  fontSize: 13,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  marginBottom: 12
                }}
              >
                Opening hours
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7, fontSize: 14.5 }}>
                {hours.map((row: any) => (
                  <div key={row.day} style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                    <span style={{ color: "#b9cdd8" }}>{row.day}</span>
                    <span style={{ color: "#fff", fontWeight: 600 }}>{row.hours}</span>
                  </div>
                ))}
              </div>
            </div>

            {insuranceNote && (
              <p style={{ fontSize: 13, color: "#9fc9d9", margin: "2px 0 0", lineHeight: 1.5 }}>
                {insuranceNote}
              </p>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
