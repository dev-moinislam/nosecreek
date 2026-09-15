"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import defaultServicesData from "@/data/services.json";
import defaultConditionsData from "@/data/conditions.json";
import defaultSettingsData from "@/data/settings.json";
import { Service, Condition, SiteSettings } from "@/types/content";

interface FooterProps {
  initialSettings?: SiteSettings;
  initialServices?: Service[];
  initialConditions?: Condition[];
}

export default function Footer({
  initialSettings,
  initialServices,
  initialConditions
}: FooterProps = {}) {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(initialSettings || (defaultSettingsData as SiteSettings));
  const [services, setServices] = useState<Service[]>(initialServices || (defaultServicesData as Service[]));
  const [conditions, setConditions] = useState<Condition[]>(initialConditions || (defaultConditionsData as Condition[]));

  useEffect(() => {
    async function fetchFreshSettings() {
      try {
        const res = await fetch("/api/content?type=settings", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data && (data.clinicName || data.navigation || data.contact)) {
            setSiteSettings((prev) => ({ ...prev, ...data }));
          }
        }
      } catch {}
    }

    function sync() {
      try {
        let deletedSlugs: string[] = [];
        const dRaw = localStorage.getItem("adm_deleted_slugs");
        if (dRaw) {
          try {
            deletedSlugs = JSON.parse(dRaw);
          } catch {}
        }

        const savedSettings = localStorage.getItem("adm_settings");
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          const s = parsed.settings || parsed;
          if (s && (s.contact || s.clinicName || s.bookingUrl || s.socialLinks || s.footerContent || s.navigation)) {
            setSiteSettings((prev) => ({ ...prev, ...s }));
          }
        }
        const savedServices = localStorage.getItem("adm_services");
        if (savedServices) {
          const parsed = JSON.parse(savedServices);
          if (Array.isArray(parsed)) {
            setServices(parsed.filter((svc: Service) => !deletedSlugs.includes(svc.slug)));
          }
        }
        const savedConditions = localStorage.getItem("adm_conditions");
        if (savedConditions) {
          const parsed = JSON.parse(savedConditions);
          if (Array.isArray(parsed)) {
            setConditions(parsed.filter((cond: Condition) => !deletedSlugs.includes(cond.slug)));
          }
        }
      } catch {}
    }
    sync();

    // Fast immediate background fetch
    fetchFreshSettings();

    window.addEventListener("settingsUpdated", sync);
    window.addEventListener("servicesUpdated", sync);
    window.addEventListener("conditionsUpdated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("settingsUpdated", sync);
      window.removeEventListener("servicesUpdated", sync);
      window.removeEventListener("conditionsUpdated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const fallbackClinicLinks = [
    { label: "About Us",          href: "/about" },
    { label: "Meet the Team",     href: "/team" },
    { label: "Patient Reviews",   href: "/reviews" },
    { label: "Locations & Hours", href: "/locations" },
    { label: "Workshops",         href: "/workshops" },
    { label: "Clinical Blog",     href: "/blog" },
  ];

  const fallbackConditionLinks = [
    { label: "Back Pain & Sciatica",      href: "/conditions/back-pain" },
    { label: "Neck Pain & Whiplash",      href: "/conditions/neck-shoulder-pain" },
    { label: "Shoulder Pain & Impingement",href: "/conditions/shoulder-pain" },
    { label: "Knee & Hip Pain",           href: "/conditions/knee-hip-pain" },
    { label: "Sports Injuries & Sprains", href: "/conditions/sports-injuries" },
    { label: "Motor Vehicle Accidents",   href: "/conditions/motor-vehicle-accident" },
  ];

  const fallbackGetStartedLinks = [
    {
      label: "Book Assessment Online",
      href: siteSettings.bookingUrl || "https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington",
      highlight: true,
      external: true
    },
    { label: "Free Discovery Session", href: "/contact", highlight: false },
    { label: "Free Phone Consultation",href: "/contact", highlight: false },
    { label: "Clinic Contact & Map",   href: "/contact", highlight: false },
    { label: "Patient Reviews (5-Star)",href: "/reviews", highlight: false },
  ];

  const colStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 9, fontSize: 13.5 };
  const headStyle: React.CSSProperties = { fontFamily: "'Poppins',sans-serif", fontWeight: 700, color: "#fff", fontSize: 14, marginBottom: 14 };

  const navFooter = siteSettings.navigation?.footer;
  const phoneText = navFooter?.contactPhone || siteSettings.contact?.phone || "403.295.8590";
  const addressText = navFooter?.contactAddress || siteSettings.contact?.address || "#22, 8120 Beddington Blvd NW\nCalgary, AB T3K 2A8, Canada";
  const addressLines = addressText.includes("\n") ? addressText.split("\n") : [addressText];

  const customColumns = navFooter?.columns && navFooter.columns.length > 0 ? navFooter.columns : null;

  return (
    <footer style={{ background: "var(--dark, #0d2530)", color: "#a9c1cd", paddingTop: "clamp(44px,5vw,64px)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 32 }}>
        {/* Column 1: Clinic Identity */}
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <Link href="/">
            <img
              src="/images/logo/nose-creek-logo.webp"
              alt="Nose Creek Physiotherapy Calgary"
              width={248}
              height={48}
              loading="lazy"
              decoding="async"
              style={{ height: 48, width: "auto", aspectRatio: "372/72", filter: "brightness(0) invert(1)", opacity: 0.95, marginBottom: 16 }}
            />
          </Link>
          <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "#94a3b8" }}>
            {addressLines.map((line, idx) => (
              <React.Fragment key={idx}>
                {line}
                {idx < addressLines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
          <a
            href={`tel:${phoneText.replace(/[^0-9+]/g, "")}`}
            style={{ display: "inline-block", marginTop: 8, color: "var(--accent, #8cc63f)", fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 15, textDecoration: "none" }}
          >
            {phoneText}
          </a>
          <div style={{ marginTop: 14 }}>
            <Link href="/contact#map" style={{ color: "var(--primary, #38bdf8)", fontSize: 13, textDecoration: "underline", textUnderlineOffset: 3 }}>
              View Interactive Map &rarr;
            </Link>
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 18 }}>
            <a
              href={siteSettings.socialLinks?.facebook || "https://www.facebook.com/nosecreekphysio"}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--primary, #38bdf8)", fontSize: 13, textDecoration: "none" }}
            >
              Facebook
            </a>
            <span style={{ color: "#475569" }}>·</span>
            <a
              href={siteSettings.socialLinks?.instagram || "https://www.instagram.com/nosecreekphysio"}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--primary, #38bdf8)", fontSize: 13, textDecoration: "none" }}
            >
              Instagram
            </a>
            {siteSettings.socialLinks?.youtube && (
              <>
                <span style={{ color: "#475569" }}>·</span>
                <a
                  href={siteSettings.socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--primary, #38bdf8)", fontSize: 13, textDecoration: "none" }}
                >
                  YouTube
                </a>
              </>
            )}
          </div>
        </div>

        {/* Dynamic or Fallback Columns */}
        {(() => {
          let deletedSlugs: string[] = [];
          if (typeof window !== "undefined") {
            try {
              const dRaw = localStorage.getItem("adm_deleted_slugs");
              if (dRaw) deletedSlugs = JSON.parse(dRaw);
            } catch {}
          }
          const stDeleted = (siteSettings.marketing as any)?.deleted_slugs;
          if (Array.isArray(stDeleted)) {
            stDeleted.forEach((s: string) => {
              if (!deletedSlugs.includes(s)) deletedSlugs.push(s);
            });
          }

          const isLinkDeleted = (href?: string): boolean => {
            if (!href) return false;
            return deletedSlugs.some((d) => 
              href === `/conditions/${d}` || href === `/services/${d}` || href.endsWith(`/${d}`)
            );
          };

          const renderedColumns = (customColumns || []).map((col) => {
            // Augment Clinical Services column with dynamic services
            if (col.id === "ft-col-services" || col.title?.toLowerCase().includes("service")) {
              const mergedLinks = (col.links || []).filter((l: any) => !isLinkDeleted(l.href));
              services.filter((s) => !s.parentSlug && !deletedSlugs.includes(s.slug)).forEach((s) => {
                const href = `/services/${s.slug}`;
                if (!mergedLinks.some((l) => l.href === href || l.href.endsWith(`/${s.slug}`))) {
                  mergedLinks.push({ label: s.title, href });
                }
              });
              return { ...col, links: mergedLinks };
            }
            // Augment Conditions column with dynamic conditions
            if (col.id === "ft-col-conditions" || col.title?.toLowerCase().includes("treat") || col.title?.toLowerCase().includes("condition")) {
              const mergedLinks = (col.links || []).filter((l: any) => !isLinkDeleted(l.href));
              conditions.filter((c) => !c.parentSlug && !deletedSlugs.includes(c.slug)).forEach((c) => {
                const href = `/conditions/${c.slug}`;
                if (!mergedLinks.some((l) => l.href === href || l.href.endsWith(`/${c.slug}`))) {
                  mergedLinks.push({ label: c.name, href });
                }
              });
              return { ...col, links: mergedLinks };
            }
            return {
              ...col,
              links: (col.links || []).filter((l: any) => !isLinkDeleted(l.href))
            };
          });

          if (renderedColumns.length > 0) {
            return renderedColumns.map((col) => (
              <div key={col.id || col.title}>
                <div style={headStyle}>{col.title}</div>
                <div style={colStyle}>
                  {col.links.map((link, idx) => {
                    const isExternal = link.external || link.href.startsWith("http") || link.href.startsWith("tel:");
                    if (isExternal) {
                      return (
                        <a
                          key={idx}
                          href={link.href}
                          target={link.href.startsWith("tel:") ? undefined : "_blank"}
                          rel="noopener noreferrer"
                          style={{
                            color: link.highlight ? "var(--accent, #8cc63f)" : "#a9c1cd",
                            fontWeight: link.highlight ? 700 : 400,
                            textDecoration: "none",
                            transition: "color 0.15s",
                          }}
                        >
                          {link.label}
                        </a>
                      );
                    }
                    return (
                      <Link
                        key={idx}
                        href={link.href}
                        style={{
                          color: link.highlight ? "var(--accent, #8cc63f)" : "#a9c1cd",
                          fontWeight: link.highlight ? 700 : 400,
                          textDecoration: "none",
                          transition: "color 0.15s",
                        }}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ));
          }

          return (
            <>
              {/* Fallback Column 2: Clinical Services */}
              <div>
                <div style={headStyle}>Clinical Services</div>
              <div style={colStyle}>
                {services.slice(0, 6).map((s) => (
                  <Link key={s.slug || s.id} href={`/services/${s.slug}`} style={{ color: "#a9c1cd", textDecoration: "none", transition: "color 0.15s" }}>
                    {s.title}
                  </Link>
                ))}
                <Link href="/services" style={{ color: "var(--accent, #8cc63f)", fontWeight: 700, textDecoration: "none", fontSize: 13, marginTop: 4 }}>
                  View All Services &rarr;
                </Link>
              </div>
            </div>

            {/* Fallback Column 3: What We Treat (Conditions) */}
            <div>
              <div style={headStyle}>What We Treat</div>
              <div style={colStyle}>
                {fallbackConditionLinks.map((c) => (
                  <Link key={c.href} href={c.href} style={{ color: "#a9c1cd", textDecoration: "none" }}>
                    {c.label}
                  </Link>
                ))}
                <Link href="/conditions" style={{ color: "var(--accent, #8cc63f)", fontWeight: 700, textDecoration: "none", fontSize: 13, marginTop: 4 }}>
                  View All Conditions &rarr;
                </Link>
              </div>
            </div>

            {/* Fallback Column 4: Clinic Info */}
            <div>
              <div style={headStyle}>Clinic</div>
              <div style={colStyle}>
                {fallbackClinicLinks.map((l) => (
                  <Link key={l.label} href={l.href} style={{ color: "#a9c1cd", textDecoration: "none" }}>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Fallback Column 5: Appointments & Consultations */}
            <div>
              <div style={headStyle}>Get Started</div>
              <div style={colStyle}>
                {fallbackGetStartedLinks.map((l) => (
                  l.external ? (
                    <a
                      key={l.label}
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: l.highlight ? "var(--accent, #8cc63f)" : "#a9c1cd", fontWeight: l.highlight ? 700 : 400, textDecoration: "none" }}
                    >
                      {l.label}
                    </a>
                  ) : (
                    <Link
                      key={l.label}
                      href={l.href}
                      style={{ color: l.highlight ? "var(--accent, #8cc63f)" : "#a9c1cd", fontWeight: l.highlight ? 700 : 400, textDecoration: "none" }}
                    >
                      {l.label}
                    </Link>
                  )
                ))}
              </div>
            </div>
          </>
          );
        })()}
      </div>

      {/* Disclaimer Notice if present */}
      {navFooter?.disclaimerText && (
        <div style={{ maxWidth: 1200, margin: "24px auto 0", padding: "0 24px" }}>
          <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6, borderTop: "1px solid #162f3c", paddingTop: 16 }}>
            {navFooter.disclaimerText}
          </p>
        </div>
      )}

      {/* Bottom Bar */}
      <div style={{ borderTop: "1px solid #1c3a47", marginTop: navFooter?.disclaimerText ? 16 : 44 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 24px", display: "flex", flexWrap: "wrap", gap: "10px 24px", justifyContent: "space-between", fontSize: 13, color: "#7b95a2" }}>
          <span>
            {navFooter?.copyrightText || siteSettings.footerContent || `© 2001–${new Date().getFullYear()} ${siteSettings.clinicName || "Nose Creek Physiotherapy"}. All rights reserved. Calgary, Alberta.`}
          </span>
          <div style={{ display: "flex", gap: 20 }}>
            <Link href="/" style={{ color: "#7b95a2", textDecoration: "none" }}>Home</Link>
            <Link href="/services" style={{ color: "#7b95a2", textDecoration: "none" }}>Services</Link>
            <Link href="/conditions" style={{ color: "#7b95a2", textDecoration: "none" }}>Conditions</Link>
            <Link href="/contact" style={{ color: "#7b95a2", textDecoration: "none" }}>Contact</Link>
            <Link href="/client-login" style={{ color: "#7b95a2", textDecoration: "none" }}>Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
