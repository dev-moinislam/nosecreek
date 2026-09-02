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
    { label: "Client Reviews",    href: "/about#client-reviews" },
    { label: "Workshops",         href: "/workshops" },
    { label: "Blog",              href: "/blog" },
  ];
  const getStartedLinks = [
    { label: "Book Online",           href: "https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington", highlight: true },
    { label: "Cost & Availability",   href: "https://www.nosecreekphysiotherapy.com/inquire/" },
    { label: "Free Discovery Session",href: "https://www.nosecreekphysiotherapy.com/free-discovery-session/" },
    { label: "Patient Forms",         href: "https://www.nosecreekphysiotherapy.com/forms/" },
    { label: "Contact Us",            href: "/contact" },
  ];

  const colStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 9, fontSize: 14 };
  const headStyle: React.CSSProperties = { fontFamily: "'Poppins',sans-serif", fontWeight: 700, color: "#fff", fontSize: 14, marginBottom: 14 };

  return (
    <footer style={{ background: "#0d2530", color: "#a9c1cd", paddingTop: "clamp(44px,5vw,64px)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 34 }}>
        {/* Column 1 */}
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo/nose-creek-logo.webp"
            alt="Nose Creek Physiotherapy"
            style={{ height: 52, width: "auto", filter: "brightness(0) invert(1)", opacity: 0.92, marginBottom: 16 }}
          />
          <p style={{ fontSize: 14, lineHeight: 1.6 }}>8220 Centre St NE #153<br />Calgary, AB T3K 1J7, Canada</p>
          <a href="tel:+14032958590" style={{ display: "inline-block", marginTop: 10, color: "#8cc63f", fontFamily: "'Poppins',sans-serif", fontWeight: 700 }}>403.295.8590</a>
        </div>

        {/* Services */}
        <div>
          <div style={headStyle}>Services</div>
          <div style={colStyle}>
            {services.slice(0, 6).map((s) => (
              <Link key={s.slug || s.id} href={`/services/${s.slug}`} style={{ color: "#a9c1cd", textDecoration: "none" }}>
                {s.title}
              </Link>
            ))}
            {services.length > 6 && (
              <Link href="/services" style={{ color: "#8cc63f", fontWeight: 700, textDecoration: "none", fontSize: 13 }}>
                View All Services &rarr;
              </Link>
            )}
          </div>
        </div>

        {/* Clinic */}
        <div>
          <div style={headStyle}>Clinic</div>
          <div style={colStyle}>
            {clinicLinks.map(l => <a key={l.label} href={l.href} style={{ color: "#a9c1cd" }}>{l.label}</a>)}
          </div>
        </div>

        {/* Get started */}
        <div>
          <div style={headStyle}>Get started</div>
          <div style={colStyle}>
            {getStartedLinks.map(l => (
              <a key={l.label} href={l.href} target={l.href.startsWith("https://app.") ? "_blank" : undefined} rel="noopener noreferrer"
                style={{ color: l.highlight ? "#8cc63f" : "#a9c1cd", fontWeight: l.highlight ? 700 : 400 }}>
                {l.label}
              </a>
            ))}
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
            <a href="https://www.facebook.com/calgaryphysiotherapy/" style={{ color: "#a9c1cd" }}>Facebook</a>
            <a href="https://www.instagram.com/nosecreekphysiotherapy/" style={{ color: "#a9c1cd" }}>Instagram</a>
          </div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid #1c3a47", marginTop: 40 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 24px", display: "flex", flexWrap: "wrap", gap: "10px 24px", justifyContent: "space-between", fontSize: 13, color: "#7b95a2" }}>
          <span>© Nose Creek Physiotherapy 2026</span>
          <div style={{ display: "flex", gap: 20 }}>
            <a href="https://www.nosecreekphysiotherapy.com/privacy-policy/" style={{ color: "#7b95a2" }}>Privacy Policy</a>
            <a href="https://www.nosecreekphysiotherapy.com/injury-advice-disclaimer/" style={{ color: "#7b95a2" }}>Injury Advice Disclaimer</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
