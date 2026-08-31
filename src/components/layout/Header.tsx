"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [conditionsDropdownOpen, setConditionsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileConditionsOpen, setMobileConditionsOpen] = useState(false);
  const [currentHash, setCurrentHash] = useState("");

  const aboutRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const conditionsRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Track window hash for anchor links (e.g. #why-choose-us)
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentHash(window.location.hash);
      const handleHashChange = () => setCurrentHash(window.location.hash);
      window.addEventListener("hashchange", handleHashChange);
      return () => window.removeEventListener("hashchange", handleHashChange);
    }
  }, [pathname]);

  // Precise active check for each submenu item
  const isItemActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.includes("#")) {
      const [path, hash] = href.split("#");
      return pathname === path && currentHash === `#${hash}`;
    }
    if (href === "/about") {
      return pathname === "/about" && (!currentHash || currentHash === "");
    }
    return pathname === href;
  };

  // close on route change and auto-open relevant mobile accordion
  useEffect(() => {
    setAboutDropdownOpen(false);
    setServicesDropdownOpen(false);
    setConditionsDropdownOpen(false);
    setMobileMenuOpen(false);

    if (pathname.startsWith("/about") || pathname === "/team") {
      setMobileAboutOpen(true);
    } else if (pathname.startsWith("/services")) {
      setMobileServicesOpen(true);
    } else if (pathname.startsWith("/conditions")) {
      setMobileConditionsOpen(true);
    }
  }, [pathname]);

  // close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (aboutRef.current && !aboutRef.current.contains(event.target as Node)) {
        setAboutDropdownOpen(false);
      }
      if (servicesRef.current && !servicesRef.current.contains(event.target as Node)) {
        setServicesDropdownOpen(false);
      }
      if (conditionsRef.current && !conditionsRef.current.contains(event.target as Node)) {
        setConditionsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLinkClick = (href: string) => {
    setAboutDropdownOpen(false);
    setServicesDropdownOpen(false);
    setConditionsDropdownOpen(false);
    setMobileMenuOpen(false);

    if (href.includes("#")) {
      const [path, hash] = href.split("#");
      setCurrentHash(`#${hash}`);

      // If already on this page, immediately smooth scroll to the target section
      if (pathname === path || (path === "/about" && pathname.startsWith("/about"))) {
        setTimeout(() => {
          const el = document.getElementById(hash);
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          }
        }, 50);
      }
    } else {
      setCurrentHash("");
    }
  };

  const aboutSubMenuItems = [
    { label: "About Us",       href: "/about" },
    { label: "Meet the Team",  href: "/team" },
    { label: "Why Choose Us",  href: "/about#why-choose-us" },
    { label: "Client Reviews", href: "/about#client-reviews" },
    { label: "Areas We Serve", href: "/about#areas-we-serve" },
  ];

  const servicesSubMenuItems = [
    { label: "All Clinical Services", href: "/services" },
    { label: "Physiotherapy",         href: "/services/physiotherapy" },
    { label: "Massage Therapy",       href: "/services/massage-therapy" },
    { label: "Shockwave Therapy",     href: "/services/shockwave-therapy" },
    { label: "Acupuncture & TCM",     href: "/services/acupuncture" },
    { label: "Custom Orthotics",      href: "/services/custom-orthotics" },
    { label: "Knee Bracing",          href: "/services/knee-bracing" },
    { label: "Pelvic Floor Health",   href: "/services/pelvic-health" },
  ];

  const conditionsSubMenuItems = [
    { label: "All Conditions Treated",            href: "/conditions", spanFull: true },
    { label: "Back Pain",                         href: "/conditions/back-pain" },
    { label: "Neck & Shoulder Pain",              href: "/conditions/neck-shoulder-pain" },
    { label: "Knee Pain",                         href: "/conditions/knee-pain" },
    { label: "Foot Pain & Plantar Fasciitis",     href: "/conditions/foot-pain" },
    { label: "Sports Injuries",                   href: "/conditions/sports-injury" },
    { label: "Shoulder Conditions",               href: "/conditions/shoulder-conditions" },
    { label: "Sciatica & Pinched Nerve",          href: "/conditions/sciatica" },
    { label: "Hip Pain",                          href: "/conditions/hip-pain" },
    { label: "Headaches & Migraines",             href: "/conditions/headaches" },
    { label: "Balance & Falls",                   href: "/conditions/balance-falls" },
    { label: "Motor Vehicle Accidents (MVA)",     href: "/conditions/motor-vehicle-accidents" },
    { label: "Workplace Injuries (WCB)",          href: "/conditions/workplace-injuries" },
  ];

  const isAboutActive = pathname.startsWith("/about") || pathname === "/team";
  const isServicesActive = pathname.startsWith("/services");
  const isConditionsActive = pathname.startsWith("/conditions");

  return (
    <>
      {/* ── Utility Top Bar ── */}
      <div style={{
        background: "#12303d",
        color: "#e8f2f7",
        fontSize: "13.5px",
        fontWeight: 600,
        fontFamily: "'Open Sans',system-ui,sans-serif",
      }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto", padding: "8px 24px",
          display: "flex", flexWrap: "wrap", gap: "8px 20px",
          alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#f6c945", letterSpacing: 1 }}>★★★★★</span>
            <span>Rated 4.9 / 5 from 545 Google reviews</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px 22px" }}>
            <span>Direct billing available · Open 6:45am–7:15pm</span>
            <a href="tel:+14032958590" style={{ color: "#8cc63f", fontWeight: 700, textDecoration: "none" }}>403.295.8590</a>
          </div>
        </div>
      </div>

      {/* ── Main Sticky Header ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(255,255,255,0.98)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid #e7edf1",
        boxShadow: "0 2px 14px rgba(20,60,80,0.06)",
      }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto", padding: "10px 24px",
          display: "flex", alignItems: "center", gap: 18,
          justifyContent: "space-between",
        }}>
          {/* Logo */}
          <Link href="/" onClick={() => handleLinkClick("/")} style={{ display: "flex", alignItems: "center", flex: "0 0 auto" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo/nose-creek-logo.webp"
              alt="Nose Creek Physiotherapy"
              style={{ height: 50, width: "auto" }}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="desktop-nav" style={{
            display: "flex", alignItems: "center",
            gap: "6px 18px",
            fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 14.5,
          }}>
            <Link
              href="/"
              onClick={() => handleLinkClick("/")}
              style={{
                color: pathname === "/" ? "#0e78a8" : "#1d2b34",
                fontWeight: pathname === "/" ? 700 : 600,
                textDecoration: "none",
                padding: "6px 0"
              }}
            >
              Home
            </Link>

            {/* About Dropdown */}
            <div
              ref={aboutRef}
              style={{ position: "relative", display: "inline-block" }}
              onMouseEnter={() => setAboutDropdownOpen(true)}
              onMouseLeave={() => setAboutDropdownOpen(false)}
            >
              <button
                onClick={() => setAboutDropdownOpen(!aboutDropdownOpen)}
                style={{
                  background: "none",
                  border: "none",
                  padding: "6px 0",
                  fontFamily: "'Poppins',sans-serif",
                  fontWeight: isAboutActive ? 700 : 600,
                  fontSize: 14.5,
                  color: isAboutActive ? "#0e78a8" : "#1d2b34",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4
                }}
              >
                <span>About</span>
                <span className={`arrow-rotatable ${aboutDropdownOpen ? "rotated" : ""}`} style={{ fontSize: 10 }}>
                  ▼
                </span>
              </button>

              {aboutDropdownOpen && (
                <div
                  className="dropdown-anim"
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    width: 220,
                    background: "#ffffff",
                    borderRadius: 12,
                    boxShadow: "0 14px 40px rgba(18,60,80,0.14)",
                    border: "1px solid #e7edf1",
                    padding: "8px 6px",
                    zIndex: 110,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  {aboutSubMenuItems.map((sub) => {
                    const active = isItemActive(sub.href);
                    return (
                      <Link
                        key={sub.label}
                        href={sub.href}
                        onClick={() => handleLinkClick(sub.href)}
                        style={{
                          padding: "8px 12px",
                          borderRadius: 7,
                          textDecoration: "none",
                          color: active ? "#0e78a8" : "#1d2b34",
                          background: active ? "rgba(28, 159, 216, 0.12)" : "transparent",
                          borderLeft: active ? "3px solid #1c9fd8" : "3px solid transparent",
                          fontSize: 13.5,
                          fontWeight: active ? 700 : 600,
                          transition: "background 0.15s ease, color 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!active) {
                            e.currentTarget.style.background = "#f2f8fb";
                            e.currentTarget.style.color = "#0e78a8";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!active) {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "#1d2b34";
                          }
                        }}
                      >
                        {sub.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Services Dropdown */}
            <div
              ref={servicesRef}
              style={{ position: "relative", display: "inline-block" }}
              onMouseEnter={() => setServicesDropdownOpen(true)}
              onMouseLeave={() => setServicesDropdownOpen(false)}
            >
              <button
                onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                style={{
                  background: "none",
                  border: "none",
                  padding: "6px 0",
                  fontFamily: "'Poppins',sans-serif",
                  fontWeight: isServicesActive ? 700 : 600,
                  fontSize: 14.5,
                  color: isServicesActive ? "#0e78a8" : "#1d2b34",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4
                }}
              >
                <span>Services</span>
                <span className={`arrow-rotatable ${servicesDropdownOpen ? "rotated" : ""}`} style={{ fontSize: 10 }}>
                  ▼
                </span>
              </button>

              {servicesDropdownOpen && (
                <div
                  className="dropdown-anim"
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    width: 240,
                    background: "#ffffff",
                    borderRadius: 12,
                    boxShadow: "0 14px 40px rgba(18,60,80,0.14)",
                    border: "1px solid #e7edf1",
                    padding: "8px 6px",
                    zIndex: 110,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  {servicesSubMenuItems.map((sub) => {
                    const active = isItemActive(sub.href);
                    return (
                      <Link
                        key={sub.label}
                        href={sub.href}
                        onClick={() => handleLinkClick(sub.href)}
                        style={{
                          padding: "8px 12px",
                          borderRadius: 7,
                          textDecoration: "none",
                          color: active ? "#0e78a8" : "#1d2b34",
                          background: active ? "rgba(28, 159, 216, 0.12)" : "transparent",
                          borderLeft: active ? "3px solid #1c9fd8" : "3px solid transparent",
                          fontWeight: active ? 700 : 600,
                          fontSize: 13.5,
                          transition: "background 0.15s ease, color 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!active) {
                            e.currentTarget.style.background = "#f2f8fb";
                            e.currentTarget.style.color = "#0e78a8";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!active) {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "#1d2b34";
                          }
                        }}
                      >
                        {sub.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* What We Treat (Conditions) Dropdown */}
            <div
              ref={conditionsRef}
              style={{ position: "relative", display: "inline-block" }}
              onMouseEnter={() => setConditionsDropdownOpen(true)}
              onMouseLeave={() => setConditionsDropdownOpen(false)}
            >
              <button
                onClick={() => setConditionsDropdownOpen(!conditionsDropdownOpen)}
                style={{
                  background: "none",
                  border: "none",
                  padding: "6px 0",
                  fontFamily: "'Poppins',sans-serif",
                  fontWeight: isConditionsActive ? 700 : 600,
                  fontSize: 14.5,
                  color: isConditionsActive ? "#0e78a8" : "#1d2b34",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4
                }}
              >
                <span>What We Treat</span>
                <span className={`arrow-rotatable ${conditionsDropdownOpen ? "rotated" : ""}`} style={{ fontSize: 10 }}>
                  ▼
                </span>
              </button>

              {conditionsDropdownOpen && (
                <div
                  className="dropdown-anim"
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: -80,
                    width: 500,
                    background: "#ffffff",
                    borderRadius: 14,
                    boxShadow: "0 16px 44px rgba(18,60,80,0.16)",
                    border: "1px solid #e7edf1",
                    padding: "10px 10px",
                    zIndex: 110,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "2px 6px",
                  }}
                >
                  {conditionsSubMenuItems.map((sub) => {
                    const active = isItemActive(sub.href);
                    return (
                      <Link
                        key={sub.label}
                        href={sub.href}
                        onClick={() => handleLinkClick(sub.href)}
                        style={{
                          padding: "8px 12px",
                          borderRadius: 7,
                          textDecoration: "none",
                          color: active ? "#0e78a8" : "#1d2b34",
                          background: active ? "rgba(28, 159, 216, 0.12)" : "transparent",
                          borderLeft: active ? "3px solid #1c9fd8" : "3px solid transparent",
                          fontWeight: active ? 700 : 600,
                          fontSize: 13.5,
                          gridColumn: sub.spanFull ? "1 / -1" : "auto",
                          marginBottom: sub.spanFull ? 4 : 0,
                          transition: "background 0.15s ease, color 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!active) {
                            e.currentTarget.style.background = "#f2f8fb";
                            e.currentTarget.style.color = "#0e78a8";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!active) {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "#1d2b34";
                          }
                        }}
                      >
                        {sub.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <Link
              href="/workshops"
              onClick={() => handleLinkClick("/workshops")}
              style={{
                color: pathname === "/workshops" ? "#0e78a8" : "#1d2b34",
                fontWeight: pathname === "/workshops" ? 700 : 600,
                textDecoration: "none",
                padding: "6px 0"
              }}
            >
              Workshops
            </Link>

            <Link
              href="/blog"
              onClick={() => handleLinkClick("/blog")}
              style={{
                color: pathname.startsWith("/blog") ? "#0e78a8" : "#1d2b34",
                fontWeight: pathname.startsWith("/blog") ? 700 : 600,
                textDecoration: "none",
                padding: "6px 0"
              }}
            >
              Blog
            </Link>

            <Link
              href="/contact"
              onClick={() => handleLinkClick("/contact")}
              style={{
                color: pathname === "/contact" ? "#0e78a8" : "#1d2b34",
                fontWeight: pathname === "/contact" ? 700 : 600,
                textDecoration: "none",
                padding: "6px 0"
              }}
            >
              Contact
            </Link>
          </nav>

          {/* Book CTA & Mobile Burger */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flex: "0 0 auto" }}>
            <a
              href="https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington"
              target="_blank"
              rel="noopener noreferrer"
              className="header-book-btn"
              style={{
                display: "inline-block",
                background: "#6faf1c", color: "#fff",
                fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 14.5,
                padding: "10px 18px", borderRadius: 8,
                boxShadow: "0 6px 16px rgba(111,175,28,0.32)",
                textDecoration: "none"
              }}
            >
              Book Online
            </a>

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-burger-btn"
              aria-label="Toggle navigation menu"
              style={{
                display: "none",
                background: "#f2f8fb",
                border: "1px solid #d7e6ef",
                borderRadius: 8,
                padding: "8px 12px",
                color: "#1d2b34",
                fontSize: 20,
                cursor: "pointer",
                lineHeight: 1,
                transition: "background 0.2s ease"
              }}
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* ── Mobile Navigation Drawer ── */}
        {mobileMenuOpen && (
          <div
            className="drawer-anim"
            style={{
              background: "#ffffff",
              borderTop: "1px solid #e7edf1",
              padding: "16px 20px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              fontFamily: "'Poppins',sans-serif",
            }}
          >
            <Link
              href="/"
              onClick={() => handleLinkClick("/")}
              style={{
                fontSize: 15,
                fontWeight: pathname === "/" ? 700 : 600,
                color: pathname === "/" ? "#0e78a8" : "#1d2b34",
                padding: "8px 12px",
                background: pathname === "/" ? "rgba(28, 159, 216, 0.12)" : "transparent",
                borderLeft: pathname === "/" ? "3px solid #1c9fd8" : "3px solid transparent",
                borderRadius: 6,
                textDecoration: "none"
              }}
            >
              Home
            </Link>

            {/* Mobile About Accordion */}
            <div>
              <button
                onClick={() => setMobileAboutOpen(!mobileAboutOpen)}
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 15,
                  fontWeight: isAboutActive ? 700 : 600,
                  color: isAboutActive ? "#0e78a8" : "#1d2b34",
                  padding: "8px 12px",
                  cursor: "pointer"
                }}
              >
                <span>About</span>
                <span className={`arrow-rotatable ${mobileAboutOpen ? "rotated" : ""}`} style={{ fontSize: 11, color: isAboutActive ? "#0e78a8" : "#7a8793" }}>
                  ▼
                </span>
              </button>
              <div className={`accordion-collapse ${mobileAboutOpen ? "open" : ""}`} style={{ display: "flex", flexDirection: "column", gap: 4, paddingLeft: 12 }}>
                {aboutSubMenuItems.map(sub => {
                  const active = isItemActive(sub.href);
                  return (
                    <Link
                      key={sub.label}
                      href={sub.href}
                      onClick={() => handleLinkClick(sub.href)}
                      style={{
                        fontSize: 14,
                        color: active ? "#0e78a8" : "#5a6570",
                        fontWeight: active ? 700 : 500,
                        background: active ? "rgba(28, 159, 216, 0.12)" : "transparent",
                        borderLeft: active ? "3px solid #1c9fd8" : "3px solid transparent",
                        padding: "6px 10px",
                        borderRadius: 6,
                        textDecoration: "none"
                      }}
                    >
                      {sub.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Mobile Services Accordion */}
            <div>
              <button
                onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 15,
                  fontWeight: isServicesActive ? 700 : 600,
                  color: isServicesActive ? "#0e78a8" : "#1d2b34",
                  padding: "8px 12px",
                  cursor: "pointer"
                }}
              >
                <span>Services</span>
                <span className={`arrow-rotatable ${mobileServicesOpen ? "rotated" : ""}`} style={{ fontSize: 11, color: isServicesActive ? "#0e78a8" : "#7a8793" }}>
                  ▼
                </span>
              </button>
              <div className={`accordion-collapse ${mobileServicesOpen ? "open" : ""}`} style={{ display: "flex", flexDirection: "column", gap: 4, paddingLeft: 12 }}>
                {servicesSubMenuItems.map(sub => {
                  const active = isItemActive(sub.href);
                  return (
                    <Link
                      key={sub.label}
                      href={sub.href}
                      onClick={() => handleLinkClick(sub.href)}
                      style={{
                        fontSize: 14,
                        color: active ? "#0e78a8" : "#5a6570",
                        fontWeight: active ? 700 : 500,
                        background: active ? "rgba(28, 159, 216, 0.12)" : "transparent",
                        borderLeft: active ? "3px solid #1c9fd8" : "3px solid transparent",
                        padding: "6px 10px",
                        borderRadius: 6,
                        textDecoration: "none"
                      }}
                    >
                      {sub.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Mobile Conditions Accordion */}
            <div>
              <button
                onClick={() => setMobileConditionsOpen(!mobileConditionsOpen)}
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 15,
                  fontWeight: isConditionsActive ? 700 : 600,
                  color: isConditionsActive ? "#0e78a8" : "#1d2b34",
                  padding: "8px 12px",
                  cursor: "pointer"
                }}
              >
                <span>What We Treat</span>
                <span className={`arrow-rotatable ${mobileConditionsOpen ? "rotated" : ""}`} style={{ fontSize: 11, color: isConditionsActive ? "#0e78a8" : "#7a8793" }}>
                  ▼
                </span>
              </button>
              <div className={`accordion-collapse ${mobileConditionsOpen ? "open" : ""}`} style={{ display: "flex", flexDirection: "column", gap: 4, paddingLeft: 12 }}>
                {conditionsSubMenuItems.map(sub => {
                  const active = isItemActive(sub.href);
                  return (
                    <Link
                      key={sub.label}
                      href={sub.href}
                      onClick={() => handleLinkClick(sub.href)}
                      style={{
                        fontSize: 14,
                        color: active ? "#0e78a8" : "#5a6570",
                        fontWeight: active ? 700 : 500,
                        background: active ? "rgba(28, 159, 216, 0.12)" : "transparent",
                        borderLeft: active ? "3px solid #1c9fd8" : "3px solid transparent",
                        padding: "6px 10px",
                        borderRadius: 6,
                        textDecoration: "none"
                      }}
                    >
                      {sub.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            <Link
              href="/workshops"
              onClick={() => handleLinkClick("/workshops")}
              style={{
                fontSize: 15,
                fontWeight: pathname === "/workshops" ? 700 : 600,
                color: pathname === "/workshops" ? "#0e78a8" : "#1d2b34",
                padding: "8px 12px",
                background: pathname === "/workshops" ? "rgba(28, 159, 216, 0.12)" : "transparent",
                borderLeft: pathname === "/workshops" ? "3px solid #1c9fd8" : "3px solid transparent",
                borderRadius: 6,
                textDecoration: "none"
              }}
            >
              Workshops
            </Link>

            <Link
              href="/blog"
              onClick={() => handleLinkClick("/blog")}
              style={{
                fontSize: 15,
                fontWeight: pathname.startsWith("/blog") ? 700 : 600,
                color: pathname.startsWith("/blog") ? "#0e78a8" : "#1d2b34",
                padding: "8px 12px",
                background: pathname.startsWith("/blog") ? "rgba(28, 159, 216, 0.12)" : "transparent",
                borderLeft: pathname.startsWith("/blog") ? "3px solid #1c9fd8" : "3px solid transparent",
                borderRadius: 6,
                textDecoration: "none"
              }}
            >
              Blog
            </Link>

            <Link
              href="/contact"
              onClick={() => handleLinkClick("/contact")}
              style={{
                fontSize: 15,
                fontWeight: pathname === "/contact" ? 700 : 600,
                color: pathname === "/contact" ? "#0e78a8" : "#1d2b34",
                padding: "8px 12px",
                background: pathname === "/contact" ? "rgba(28, 159, 216, 0.12)" : "transparent",
                borderLeft: pathname === "/contact" ? "3px solid #1c9fd8" : "3px solid transparent",
                borderRadius: 6,
                textDecoration: "none"
              }}
            >
              Contact
            </Link>

            <a
              href="https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                marginTop: 8,
                textAlign: "center",
                background: "#6faf1c", color: "#fff",
                fontWeight: 700, fontSize: 15,
                padding: "12px 18px", borderRadius: 8,
                boxShadow: "0 6px 16px rgba(111,175,28,0.32)",
                textDecoration: "none"
              }}
            >
              Book Your Appointment Online
            </a>
          </div>
        )}
      </header>

      {/* ─── MOBILE STICKY BOTTOM ACTION BAR ─── */}
      <div className="mobile-bottom-bar">
        <a href="tel:403-295-8590" className="call-btn" aria-label="Call Nose Creek Physiotherapy">
          Call
        </a>
        <a
          href="https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington"
          target="_blank"
          rel="noopener noreferrer"
          className="book-btn"
          aria-label="Book appointment online"
        >
          Book Online
        </a>
      </div>
    </>
  );
}

