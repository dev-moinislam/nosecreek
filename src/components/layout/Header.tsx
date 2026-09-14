"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import defaultServicesData from "@/data/services.json";
import defaultConditionsData from "@/data/conditions.json";
import defaultSettingsData from "@/data/settings.json";
import { Service, Condition, SiteSettings, NavMenuItem } from "@/types/content";

export default function Header() {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpandedKeys, setMobileExpandedKeys] = useState<Record<string, boolean>>({});
  const [currentHash, setCurrentHash] = useState("");

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSettingsData as SiteSettings);
  const [dynamicServices, setDynamicServices] = useState<Service[]>(defaultServicesData as Service[]);
  const [dynamicConditions, setDynamicConditions] = useState<Condition[]>(defaultConditionsData as Condition[]);

  const dropdownContainerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Dynamic sync of backend services, conditions, and site settings
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

    async function fetchFreshServices() {
      try {
        const res = await fetch("/api/content?type=services", { cache: "no-store" });
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list)) {
            setDynamicServices(list);
          }
        }
      } catch {}
    }

    async function fetchFreshConditions() {
      try {
        const res = await fetch("/api/content?type=conditions", { cache: "no-store" });
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list)) {
            setDynamicConditions(list);
          }
        }
      } catch {}
    }

    function syncContent() {
      try {
        const savedSettings = localStorage.getItem("adm_settings");
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          const s = parsed.settings || parsed;
          if (s && (s.contact || s.clinicName || s.primaryCTA || s.bookingUrl || s.navigation)) {
            setSiteSettings((prev) => ({ ...prev, ...s }));
          }
        }
        const savedServices = localStorage.getItem("adm_services");
        if (savedServices) {
          const parsed = JSON.parse(savedServices);
          if (Array.isArray(parsed)) {
            setDynamicServices(parsed);
          }
        }
        const savedConditions = localStorage.getItem("adm_conditions");
        if (savedConditions) {
          const parsed = JSON.parse(savedConditions);
          if (Array.isArray(parsed)) {
            setDynamicConditions(parsed);
          }
        }
      } catch {}
    }
    syncContent();

    // Defer background API freshness sync until after initial page render is fully complete (5s delay or idle)
    const idleTimer = setTimeout(() => {
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        (window as any).requestIdleCallback(() => {
          fetchFreshSettings();
          fetchFreshServices();
          fetchFreshConditions();
        });
      } else {
        fetchFreshSettings();
        fetchFreshServices();
        fetchFreshConditions();
      }
    }, 5000);

    window.addEventListener("settingsUpdated", syncContent);
    window.addEventListener("servicesUpdated", syncContent);
    window.addEventListener("conditionsUpdated", syncContent);
    window.addEventListener("storage", syncContent);
    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener("settingsUpdated", syncContent);
      window.removeEventListener("servicesUpdated", syncContent);
      window.removeEventListener("conditionsUpdated", syncContent);
      window.removeEventListener("storage", syncContent);
    };
  }, []);

  // Track window hash for anchor links (e.g. #why-choose-us)
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentHash(window.location.hash);
      const handleHashChange = () => setCurrentHash(window.location.hash);
      window.addEventListener("hashchange", handleHashChange);
      return () => window.removeEventListener("hashchange", handleHashChange);
    }
  }, [pathname]);

  // Precise active check for each link
  const isItemActive = (href?: string) => {
    if (!href) return false;
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

  // Check if any descendant is active
  const isBranchActive = (item: NavMenuItem): boolean => {
    if (isItemActive(item.href)) return true;
    if (item.children && item.children.length > 0) {
      return item.children.some((child) => isBranchActive(child));
    }
    return false;
  };

  // Close menus on route change
  useEffect(() => {
    setOpenDropdownId(null);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close desktop dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownContainerRef.current && !dropdownContainerRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLinkClick = (href?: string) => {
    setOpenDropdownId(null);
    setMobileMenuOpen(false);

    if (href && href.includes("#")) {
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

  const toggleMobileKey = (key: string) => {
    setMobileExpandedKeys((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Determine navigation menu items (from dynamic settings or fallback)
  const menuItems: NavMenuItem[] = (siteSettings.navigation?.header?.menu && siteSettings.navigation.header.menu.length > 0)
    ? siteSettings.navigation.header.menu.filter((m) => m.enabled !== false)
    : [
        {
          id: "nav-services",
          label: "Services",
          href: "/services",
          enabled: true,
          children: dynamicServices.map((s) => ({
            id: `srv-${s.slug}`,
            label: s.title,
            href: `/services/${s.slug}`,
            enabled: true,
          })),
        },
        {
          id: "nav-conditions",
          label: "What We Treat",
          href: "/conditions",
          enabled: true,
          children: dynamicConditions.map((c) => ({
            id: `cnd-${c.slug}`,
            label: c.name,
            href: `/conditions/${c.slug}`,
            enabled: true,
          })),
        },
        {
          id: "nav-about",
          label: "About",
          href: "/about",
          enabled: true,
          children: [
            { id: "abt-main", label: "About Us", href: "/about", enabled: true },
            { id: "abt-team", label: "Meet the Team", href: "/team", enabled: true },
            { id: "abt-why", label: "Why Choose Us", href: "/about#why-choose-us", enabled: true },
            { id: "abt-reviews", label: "Client Reviews", href: "/about#client-reviews", enabled: true },
            { id: "abt-areas", label: "Areas We Serve", href: "/about#areas-we-serve", enabled: true },
          ],
        },
        { id: "nav-workshops", label: "Workshops", href: "/workshops", enabled: true },
        { id: "nav-blog", label: "Blog", href: "/blog", enabled: true },
        { id: "nav-contact", label: "Contact", href: "/contact", enabled: true },
      ];

  const topBarPhone = siteSettings.navigation?.header?.phone || siteSettings.contact?.phone || "403.295.8590";
  const ctaButtonText = siteSettings.navigation?.header?.ctaButtonText || siteSettings.primaryCTA || "Book Online";
  const ctaButtonUrl = siteSettings.navigation?.header?.ctaButtonUrl || siteSettings.bookingUrl || "https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington";
  const showTopBar = siteSettings.navigation?.header?.topBarEnabled !== false;

  return (
    <>
      {/* ── Utility Top Bar ── */}
      {showTopBar && (
        <div style={{
          background: "var(--dark, #12303d)",
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
              <span>Direct billing available · {siteSettings.openingHours?.weekdays ? `Open ${siteSettings.openingHours.weekdays}` : "Open 6:45am–7:15pm"}</span>
              <a href={`tel:${topBarPhone.replace(/[^0-9+]/g, "")}`} style={{ color: "#8cc63f", fontWeight: 700, textDecoration: "none" }}>
                {topBarPhone}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Sticky Header ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(255,255,255,0.98)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid #e7edf1",
        boxShadow: "0 2px 14px rgba(20,60,80,0.06)",
      }}>
        <div
          ref={dropdownContainerRef}
          style={{
            maxWidth: 1200, margin: "0 auto", padding: "10px 24px",
            display: "flex", alignItems: "center", gap: 18,
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <Link href="/" onClick={() => handleLinkClick("/")} style={{ display: "flex", alignItems: "center", flex: "0 0 auto" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo/nose-creek-logo.webp"
              alt="Nose Creek Physiotherapy"
              width={258}
              height={50}
              style={{ height: 50, width: "auto", aspectRatio: "372/72" }}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="desktop-nav" style={{
            display: "flex", alignItems: "center",
            gap: "6px 18px",
            fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 14.5,
          }}>
            {menuItems.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const active = isBranchActive(item);
              const isOpen = openDropdownId === item.id;

              if (!hasChildren) {
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => handleLinkClick(item.href)}
                    style={{
                      color: active ? "#0e78a8" : "#1d2b34",
                      fontWeight: active ? 700 : 600,
                      textDecoration: "none",
                      padding: "6px 0",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 10, background: "#e0f2fe", color: "#0284c7", fontWeight: 700 }}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              }

              // Multi-level Dropdown (Level 1 with children)
              return (
                <div
                  key={item.id}
                  style={{ position: "relative", display: "inline-block" }}
                  onMouseEnter={() => setOpenDropdownId(item.id)}
                  onMouseLeave={() => setOpenDropdownId(null)}
                >
                  <button
                    onClick={() => setOpenDropdownId(isOpen ? null : item.id)}
                    style={{
                      background: "none",
                      border: "none",
                      padding: "6px 0",
                      fontFamily: "'Poppins',sans-serif",
                      fontWeight: active ? 700 : 600,
                      fontSize: 14.5,
                      color: active ? "#0e78a8" : "#1d2b34",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 10, background: "#e0f2fe", color: "#0284c7", fontWeight: 700 }}>
                        {item.badge}
                      </span>
                    )}
                    <span className={`arrow-rotatable ${isOpen ? "rotated" : ""}`} style={{ fontSize: 10 }}>
                      ▼
                    </span>
                  </button>

                  {/* Level 2 Dropdown Panel */}
                  {isOpen && (
                    <div
                      className="dropdown-anim"
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        minWidth: 240,
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
                      {item.children?.filter(sub => sub.enabled !== false).map((sub) => {
                        const subActive = isBranchActive(sub);
                        const hasSubChildren = sub.children && sub.children.length > 0;

                        if (!hasSubChildren) {
                          return (
                            <Link
                              key={sub.id}
                              href={sub.href}
                              onClick={() => handleLinkClick(sub.href)}
                              style={{
                                padding: "8px 12px",
                                borderRadius: 7,
                                textDecoration: "none",
                                color: subActive ? "#0e78a8" : "#1d2b34",
                                background: subActive ? "rgba(28, 159, 216, 0.12)" : "transparent",
                                borderLeft: subActive ? "3px solid #1c9fd8" : "3px solid transparent",
                                fontSize: 13.5,
                                fontWeight: subActive ? 700 : 600,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                transition: "background 0.15s ease, color 0.15s ease",
                              }}
                              onMouseEnter={(e) => {
                                if (!subActive) {
                                  e.currentTarget.style.background = "#f2f8fb";
                                  e.currentTarget.style.color = "#0e78a8";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!subActive) {
                                  e.currentTarget.style.background = "transparent";
                                  e.currentTarget.style.color = "#1d2b34";
                                }
                              }}
                            >
                              <span>{sub.label}</span>
                              {sub.badge && (
                                <span style={{ fontSize: 9.5, padding: "1px 5px", borderRadius: 8, background: "#ecfdf5", color: "#059669", fontWeight: 700 }}>
                                  {sub.badge}
                                </span>
                              )}
                            </Link>
                          );
                        }

                        // Level 2 item with Level 3 children -> Flyout Menu
                        return (
                          <div
                            key={sub.id}
                            className="nav-level2-item has-children"
                            style={{
                              borderRadius: 7,
                              background: subActive ? "rgba(28, 159, 216, 0.12)" : "transparent",
                              borderLeft: subActive ? "3px solid #1c9fd8" : "3px solid transparent",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "8px 12px",
                                cursor: "pointer",
                                borderRadius: 7,
                              }}
                              onMouseEnter={(e) => {
                                if (!subActive) {
                                  e.currentTarget.style.background = "#f2f8fb";
                                  const text = e.currentTarget.querySelector(".nav-sub-label") as HTMLElement;
                                  if (text) text.style.color = "#0e78a8";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!subActive) {
                                  e.currentTarget.style.background = "transparent";
                                  const text = e.currentTarget.querySelector(".nav-sub-label") as HTMLElement;
                                  if (text) text.style.color = "#1d2b34";
                                }
                              }}
                            >
                              <Link
                                href={sub.href}
                                onClick={() => handleLinkClick(sub.href)}
                                className="nav-sub-label"
                                style={{
                                  textDecoration: "none",
                                  color: subActive ? "#0e78a8" : "#1d2b34",
                                  fontSize: 13.5,
                                  fontWeight: subActive ? 700 : 600,
                                  flex: 1,
                                }}
                              >
                                {sub.label}
                              </Link>
                              <span style={{ fontSize: 13, color: "#94a3b8", marginLeft: 8, fontWeight: 700 }}>
                                ›
                              </span>
                            </div>

                            {/* Level 3 Flyout Submenu */}
                            <div className="nav-level3-flyout">
                              <div style={{ padding: "4px 10px 6px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid #f1f5f9", marginBottom: 4 }}>
                                {sub.label} Subtopics
                              </div>
                              {sub.children?.filter(nested => nested.enabled !== false).map((nested) => {
                                const nestedActive = isItemActive(nested.href);
                                return (
                                  <Link
                                    key={nested.id}
                                    href={nested.href}
                                    onClick={() => handleLinkClick(nested.href)}
                                    style={{
                                      padding: "7px 10px",
                                      borderRadius: 6,
                                      textDecoration: "none",
                                      color: nestedActive ? "#0e78a8" : "#334155",
                                      background: nestedActive ? "rgba(28, 159, 216, 0.12)" : "transparent",
                                      fontSize: 13,
                                      fontWeight: nestedActive ? 700 : 500,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      transition: "background 0.15s ease, color 0.15s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                      if (!nestedActive) {
                                        e.currentTarget.style.background = "#f2f8fb";
                                        e.currentTarget.style.color = "#0e78a8";
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (!nestedActive) {
                                        e.currentTarget.style.background = "transparent";
                                        e.currentTarget.style.color = "#334155";
                                      }
                                    }}
                                  >
                                    <span>{nested.label}</span>
                                    {nested.badge && (
                                      <span style={{ fontSize: 9, padding: "1px 4px", borderRadius: 6, background: "#ecfdf5", color: "#059669", fontWeight: 700 }}>
                                        {nested.badge}
                                      </span>
                                    )}
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Book CTA & Mobile Burger */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flex: "0 0 auto" }}>
            <a
              href={ctaButtonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="header-book-btn"
              style={{
                display: "inline-block",
                background: "var(--secondary, #6faf1c)", color: "#fff",
                fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 14.5,
                padding: "10px 18px", borderRadius: 8,
                boxShadow: "0 6px 16px rgba(111,175,28,0.32)",
                textDecoration: "none",
              }}
            >
              {ctaButtonText}
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
                transition: "background 0.2s ease",
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
              gap: 8,
              fontFamily: "'Poppins',sans-serif",
              maxHeight: "80vh",
              overflowY: "auto",
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
                textDecoration: "none",
              }}
            >
              Home
            </Link>

            {menuItems.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const active = isBranchActive(item);
              const isLevel1Open = !!mobileExpandedKeys[item.id];

              if (!hasChildren) {
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => handleLinkClick(item.href)}
                    style={{
                      fontSize: 15,
                      fontWeight: active ? 700 : 600,
                      color: active ? "#0e78a8" : "#1d2b34",
                      padding: "8px 12px",
                      background: active ? "rgba(28, 159, 216, 0.12)" : "transparent",
                      borderLeft: active ? "3px solid #1c9fd8" : "3px solid transparent",
                      borderRadius: 6,
                      textDecoration: "none",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 8, background: "#e0f2fe", color: "#0284c7" }}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              }

              return (
                <div key={item.id} style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Link
                      href={item.href}
                      onClick={() => handleLinkClick(item.href)}
                      style={{
                        fontSize: 15,
                        fontWeight: active ? 700 : 600,
                        color: active ? "#0e78a8" : "#1d2b34",
                        padding: "8px 12px",
                        textDecoration: "none",
                        flex: 1,
                      }}
                    >
                      {item.label}
                    </Link>
                    <button
                      onClick={() => toggleMobileKey(item.id)}
                      style={{
                        padding: "8px 14px",
                        fontSize: 16,
                        color: isLevel1Open ? "#0e78a8" : "#64748b",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                      aria-label={`Toggle ${item.label} sub-items`}
                    >
                      {isLevel1Open ? "−" : "+"}
                    </button>
                  </div>

                  {/* Mobile Level 2 Accordion */}
                  {isLevel1Open && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 3, paddingLeft: 12, marginTop: 4, marginBottom: 6 }}>
                      {item.children?.filter(sub => sub.enabled !== false).map((sub) => {
                        const hasSubChildren = sub.children && sub.children.length > 0;
                        const subActive = isBranchActive(sub);
                        const isLevel2Open = !!mobileExpandedKeys[sub.id];

                        if (!hasSubChildren) {
                          return (
                            <Link
                              key={sub.id}
                              href={sub.href}
                              onClick={() => handleLinkClick(sub.href)}
                              style={{
                                fontSize: 14,
                                color: subActive ? "#0e78a8" : "#475569",
                                fontWeight: subActive ? 700 : 500,
                                background: subActive ? "rgba(28, 159, 216, 0.1)" : "transparent",
                                padding: "6px 10px",
                                borderRadius: 6,
                                textDecoration: "none",
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <span>{sub.label}</span>
                              {sub.badge && (
                                <span style={{ fontSize: 9.5, padding: "1px 5px", borderRadius: 6, background: "#ecfdf5", color: "#059669" }}>
                                  {sub.badge}
                                </span>
                              )}
                            </Link>
                          );
                        }

                        // Mobile Level 2 item with Level 3 children
                        return (
                          <div key={sub.id} style={{ display: "flex", flexDirection: "column", background: "#f8fafc", borderRadius: 8, padding: "4px 6px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <Link
                                href={sub.href}
                                onClick={() => handleLinkClick(sub.href)}
                                style={{
                                  fontSize: 14,
                                  color: subActive ? "#0e78a8" : "#334155",
                                  fontWeight: subActive ? 700 : 600,
                                  textDecoration: "none",
                                  padding: "5px 6px",
                                  flex: 1,
                                }}
                              >
                                {sub.label}
                              </Link>
                              <button
                                onClick={() => toggleMobileKey(sub.id)}
                                style={{
                                  padding: "4px 8px",
                                  fontSize: 14,
                                  color: "#0e78a8",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                }}
                                aria-label={`Toggle ${sub.label} nested sub-items`}
                              >
                                {isLevel2Open ? "−" : "+"}
                              </button>
                            </div>

                            {/* Mobile Level 3 Nested Submenu */}
                            {isLevel2Open && (
                              <div style={{ display: "flex", flexDirection: "column", gap: 3, paddingLeft: 14, borderLeft: "2px solid #bae6fd", marginTop: 4, marginBottom: 4 }}>
                                {sub.children?.filter(nested => nested.enabled !== false).map((nested) => {
                                  const nestedActive = isItemActive(nested.href);
                                  return (
                                    <Link
                                      key={nested.id}
                                      href={nested.href}
                                      onClick={() => handleLinkClick(nested.href)}
                                      style={{
                                        fontSize: 13,
                                        color: nestedActive ? "#0e78a8" : "#64748b",
                                        fontWeight: nestedActive ? 700 : 500,
                                        padding: "4px 8px",
                                        textDecoration: "none",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 5,
                                      }}
                                    >
                                      <span style={{ color: "#94a3b8" }}>↳</span>
                                      <span>{nested.label}</span>
                                    </Link>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            <a
              href={ctaButtonUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                marginTop: 12,
                textAlign: "center",
                background: "var(--secondary, #6faf1c)", color: "#fff",
                fontWeight: 700, fontSize: 15,
                padding: "12px 18px", borderRadius: 8,
                boxShadow: "0 6px 16px rgba(111,175,28,0.32)",
                textDecoration: "none",
              }}
            >
              {ctaButtonText}
            </a>
          </div>
        )}
      </header>

      {/* ─── MOBILE STICKY BOTTOM ACTION BAR ─── */}
      <div className="mobile-bottom-bar">
        <a href={`tel:${topBarPhone.replace(/[^0-9+]/g, "")}`} className="call-btn" aria-label="Call Nose Creek Physiotherapy">
          Call
        </a>
        <a
          href={ctaButtonUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="book-btn"
          aria-label="Book appointment online"
        >
          {ctaButtonText}
        </a>
      </div>
    </>
  );
}
