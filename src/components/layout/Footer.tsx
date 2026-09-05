"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import defaultServicesData from "@/data/services.json";
import { Service } from "@/types/content";
import { getServices } from "@/lib/api";

export default function Footer() {
  const [services, setServices] = useState<Service[]>(defaultServicesData as Service[]);

  useEffect(() => {
    function sync() {
      try {
        const saved = localStorage.getItem("adm_services");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) setServices(parsed);
        }
      } catch {}
    }
    window.addEventListener("servicesUpdated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("servicesUpdated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const clinicLinks = [
    { label: "About Us",          href: "/about" },
    { label: "Meet the Team",     href: "/team" },
    { label: "Patient Reviews",   href: "/reviews" },
    { label: "Locations & Hours", href: "/locations" },
    { label: "Workshops",         href: "/workshops" },
    { label: "Clinical Blog",     href: "/blog" },
  ];

  const conditionLinks = [
    { label: "Back Pain & Sciatica",      href: "/conditions/back-pain-relief" },
    { label: "Neck Pain & Whiplash",      href: "/conditions/neck-pain-relief" },
    { label: "Shoulder Pain & Impingement",href: "/conditions/shoulder-pain" },
    { label: "Knee & Hip Pain",           href: "/conditions/knee-hip-pain" },
    { label: "Sports Injuries & Sprains", href: "/conditions/sports-injuries" },
    { label: "Motor Vehicle Accidents",   href: "/conditions/motor-vehicle-accident" },
  ];

  const getStartedLinks = [
    { label: "Book Assessment Online", href: "https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington", highlight: true, external: true },
    { label: "Free Discovery Session", href: "/contact?consult=discovery", highlight: false },
    { label: "Free Phone Consultation",href: "/contact?consult=phone", highlight: false },
    { label: "Clinic Contact & Map",   href: "/contact", highlight: false },
    { label: "Patient Reviews (5-Star)",href: "/reviews", highlight: false },
  ];

  const colStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 9, fontSize: 13.5 };
  const headStyle: React.CSSProperties = { fontFamily: "'Poppins',sans-serif", fontWeight: 700, color: "#fff", fontSize: 14, marginBottom: 14 };

  return (
    <footer style={{ background: "#0d2530", color: "#a9c1cd", paddingTop: "clamp(44px,5vw,64px)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 32 }}>
        {/* Column 1: Clinic Identity */}
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <Link href="/">
            <img
              src="/images/logo/nose-creek-logo.webp"
              alt="Nose Creek Physiotherapy Calgary"
              style={{ height: 48, width: "auto", filter: "brightness(0) invert(1)", opacity: 0.95, marginBottom: 16 }}
            />
          </Link>
          <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "#94a3b8" }}>
            #22, 8120 Beddington Blvd NW<br />Calgary, AB T3K 2A8, Canada
          </p>
          <a href="tel:+14032958590" style={{ display: "inline-block", marginTop: 8, color: "#8cc63f", fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
            403.295.8590
          </a>
          <div style={{ marginTop: 14 }}>
            <Link href="/contact#map" style={{ color: "#38bdf8", fontSize: 13, textDecoration: "underline", textUnderlineOffset: 3 }}>
              View Interactive Map &rarr;
            </Link>
          </div>
        </div>

        {/* Column 2: Clinical Services */}
        <div>
          <div style={headStyle}>Clinical Services</div>
          <div style={colStyle}>
            {services.slice(0, 6).map((s) => (
              <Link key={s.slug || s.id} href={`/services/${s.slug}`} style={{ color: "#a9c1cd", textDecoration: "none", transition: "color 0.15s" }}>
                {s.title}
              </Link>
            ))}
            <Link href="/services" style={{ color: "#8cc63f", fontWeight: 700, textDecoration: "none", fontSize: 13, marginTop: 4 }}>
              View All Services &rarr;
            </Link>
          </div>
        </div>

        {/* Column 3: What We Treat (Conditions) */}
        <div>
          <div style={headStyle}>What We Treat</div>
          <div style={colStyle}>
            {conditionLinks.map((c) => (
              <Link key={c.href} href={c.href} style={{ color: "#a9c1cd", textDecoration: "none" }}>
                {c.label}
              </Link>
            ))}
            <Link href="/conditions" style={{ color: "#8cc63f", fontWeight: 700, textDecoration: "none", fontSize: 13, marginTop: 4 }}>
              View All Conditions &rarr;
            </Link>
          </div>
        </div>

        {/* Column 4: Clinic Info */}
        <div>
          <div style={headStyle}>Clinic</div>
          <div style={colStyle}>
            {clinicLinks.map((l) => (
              <Link key={l.label} href={l.href} style={{ color: "#a9c1cd", textDecoration: "none" }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Column 5: Appointments & Consultations */}
        <div>
          <div style={headStyle}>Get Started</div>
          <div style={colStyle}>
            {getStartedLinks.map((l) => (
              l.external ? (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: l.highlight ? "#8cc63f" : "#a9c1cd", fontWeight: l.highlight ? 700 : 400, textDecoration: "none" }}
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  key={l.label}
                  href={l.href}
                  style={{ color: l.highlight ? "#8cc63f" : "#a9c1cd", fontWeight: l.highlight ? 700 : 400, textDecoration: "none" }}
                >
                  {l.label}
                </Link>
              )
            ))}
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 18 }}>
            <a href="https://www.facebook.com/nosecreekphysio" target="_blank" rel="noopener noreferrer" style={{ color: "#38bdf8", fontSize: 13, textDecoration: "none" }}>Facebook</a>
            <span style={{ color: "#475569" }}>·</span>
            <a href="https://www.instagram.com/nosecreekphysio" target="_blank" rel="noopener noreferrer" style={{ color: "#38bdf8", fontSize: 13, textDecoration: "none" }}>Instagram</a>
          </div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid #1c3a47", marginTop: 44 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 24px", display: "flex", flexWrap: "wrap", gap: "10px 24px", justifyContent: "space-between", fontSize: 13, color: "#7b95a2" }}>
          <span>© 2001–2026 Nose Creek Physiotherapy. All rights reserved. Calgary, Alberta.</span>
          <div style={{ display: "flex", gap: 20 }}>
            <Link href="/" style={{ color: "#7b95a2", textDecoration: "none" }}>Home</Link>
            <Link href="/services" style={{ color: "#7b95a2", textDecoration: "none" }}>Services</Link>
            <Link href="/conditions" style={{ color: "#7b95a2", textDecoration: "none" }}>Conditions</Link>
            <Link href="/contact" style={{ color: "#7b95a2", textDecoration: "none" }}>Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
