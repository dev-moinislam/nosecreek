"use client";

import React, { useState, useEffect } from "react";
import { useRole } from "@/components/admin/RoleGuard";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { NavMenuItem, FooterColumnItem, HeaderFooterNavigation, Service, Condition } from "@/types/content";
import defaultSettings from "@/data/settings.json";
import defaultServices from "@/data/services.json";
import defaultConditions from "@/data/conditions.json";

interface EditingItemState {
  item: NavMenuItem;
  level: 1 | 2 | 3;
  parentLevel1Id?: string;
  parentLevel2Id?: string;
  isNew: boolean;
}

export default function AdminNavigationPage() {
  const { isAdmin } = useRole();
  const [activeTab, setActiveTab] = useState<"header" | "footer" | "topbar">("header");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Core navigation state
  const [navData, setNavData] = useState<HeaderFooterNavigation>(() => {
    return (defaultSettings as any).navigation || {
      header: {
        topBarEnabled: true,
        phone: "403-295-8590",
        ctaButtonText: "Book Online",
        ctaButtonUrl: "https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington",
        menu: []
      },
      footer: {
        columns: [],
        contactPhone: "403-295-8590",
        contactEmail: "info@nosecreekphysiotherapy.com",
        contactAddress: "#22, 8120 Beddington Blvd NW, Calgary, AB T3K 2A8",
        copyrightText: "© 2026 Nose Creek Physiotherapy. All rights reserved.",
        disclaimerText: "The information on this website is for educational purposes only and is not medical advice."
      }
    };
  });

  // Services and conditions for autocomplete quick-add
  const [servicesList, setServicesList] = useState<Service[]>(defaultServices as Service[]);
  const [conditionsList, setConditionsList] = useState<Condition[]>(defaultConditions as Condition[]);

  // Expanded parent IDs for tree view
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  // Item editor modal state
  const [editingItem, setEditingItem] = useState<EditingItemState | null>(null);

  // Footer column editor state
  const [editingColumn, setEditingColumn] = useState<{ id: string; title: string; isNew: boolean } | null>(null);
  const [editingFooterLink, setEditingFooterLink] = useState<{ colId: string; index: number; label: string; href: string; isNew: boolean } | null>(null);

  // Load live settings on mount
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/content?type=settings");
        if (res.ok) {
          const s = await res.json();
          if (s.navigation) {
            setNavData(s.navigation);
          }
        }
      } catch {}

      try {
        const [srvRes, condRes] = await Promise.all([
          fetch("/api/content?type=services"),
          fetch("/api/content?type=conditions")
        ]);
        if (srvRes.ok) {
          const s = await srvRes.json();
          if (Array.isArray(s)) setServicesList(s);
        }
        if (condRes.ok) {
          const c = await condRes.json();
          if (Array.isArray(c)) setConditionsList(c);
        }
      } catch {}

      setLoading(false);
    }

    loadData();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // ── HEADER MENU TREE ACTIONS ──
  const handleOpenAdd = (level: 1 | 2 | 3, parentLevel1Id?: string, parentLevel2Id?: string) => {
    const newItem: NavMenuItem = {
      id: `nav-${Date.now()}`,
      label: "",
      href: "/",
      target: "_self",
      enabled: true,
      children: []
    };
    setEditingItem({
      item: newItem,
      level,
      parentLevel1Id,
      parentLevel2Id,
      isNew: true
    });
  };

  const handleOpenEdit = (item: NavMenuItem, level: 1 | 2 | 3, parentLevel1Id?: string, parentLevel2Id?: string) => {
    setEditingItem({
      item: { ...item },
      level,
      parentLevel1Id,
      parentLevel2Id,
      isNew: false
    });
  };

  const handleSaveItem = () => {
    if (!editingItem) return;
    const { item, level, parentLevel1Id, parentLevel2Id, isNew } = editingItem;
    if (!item.label.trim()) {
      alert("Menu item label cannot be empty.");
      return;
    }

    setNavData((prev) => {
      const menu = [...(prev.header?.menu || [])];

      if (level === 1) {
        if (isNew) {
          menu.push(item);
        } else {
          const idx = menu.findIndex((m) => m.id === item.id);
          if (idx !== -1) menu[idx] = { ...menu[idx], ...item };
        }
      } else if (level === 2 && parentLevel1Id) {
        const p1 = menu.find((m) => m.id === parentLevel1Id);
        if (p1) {
          p1.children = p1.children ? [...p1.children] : [];
          if (isNew) {
            p1.children.push(item);
          } else {
            const idx = p1.children.findIndex((c) => c.id === item.id);
            if (idx !== -1) p1.children[idx] = { ...p1.children[idx], ...item };
          }
        }
      } else if (level === 3 && parentLevel1Id && parentLevel2Id) {
        const p1 = menu.find((m) => m.id === parentLevel1Id);
        if (p1 && p1.children) {
          const p2 = p1.children.find((c) => c.id === parentLevel2Id);
          if (p2) {
            p2.children = p2.children ? [...p2.children] : [];
            if (isNew) {
              p2.children.push(item);
            } else {
              const idx = p2.children.findIndex((c) => c.id === item.id);
              if (idx !== -1) p2.children[idx] = { ...p2.children[idx], ...item };
            }
          }
        }
      }

      return {
        ...prev,
        header: {
          ...(prev.header || {}),
          menu
        }
      };
    });

    if (parentLevel1Id) setExpandedIds((prev) => ({ ...prev, [parentLevel1Id]: true }));
    if (parentLevel2Id) setExpandedIds((prev) => ({ ...prev, [parentLevel2Id]: true }));
    setEditingItem(null);
  };

  const handleDeleteItem = (id: string, level: 1 | 2 | 3, parentLevel1Id?: string, parentLevel2Id?: string) => {
    if (!confirm("Are you sure you want to delete this menu item and any of its nested submenus?")) return;

    setNavData((prev) => {
      let menu = [...(prev.header?.menu || [])];

      if (level === 1) {
        menu = menu.filter((m) => m.id !== id);
      } else if (level === 2 && parentLevel1Id) {
        const p1 = menu.find((m) => m.id === parentLevel1Id);
        if (p1 && p1.children) {
          p1.children = p1.children.filter((c) => c.id !== id);
        }
      } else if (level === 3 && parentLevel1Id && parentLevel2Id) {
        const p1 = menu.find((m) => m.id === parentLevel1Id);
        if (p1 && p1.children) {
          const p2 = p1.children.find((c) => c.id === parentLevel2Id);
          if (p2 && p2.children) {
            p2.children = p2.children.filter((c) => c.id !== id);
          }
        }
      }

      return {
        ...prev,
        header: {
          ...(prev.header || {}),
          menu
        }
      };
    });
  };

  const handleMoveItem = (index: number, direction: "up" | "down", level: 1 | 2 | 3, parentLevel1Id?: string, parentLevel2Id?: string) => {
    setNavData((prev) => {
      const menu = [...(prev.header?.menu || [])];

      let targetArray: NavMenuItem[] | undefined;
      if (level === 1) {
        targetArray = menu;
      } else if (level === 2 && parentLevel1Id) {
        const p1 = menu.find((m) => m.id === parentLevel1Id);
        if (p1) targetArray = p1.children;
      } else if (level === 3 && parentLevel1Id && parentLevel2Id) {
        const p1 = menu.find((m) => m.id === parentLevel1Id);
        const p2 = p1?.children?.find((c) => c.id === parentLevel2Id);
        if (p2) targetArray = p2.children;
      }

      if (!targetArray) return prev;
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= targetArray.length) return prev;

      const temp = targetArray[index];
      targetArray[index] = targetArray[newIndex];
      targetArray[newIndex] = temp;

      return {
        ...prev,
        header: {
          ...(prev.header || {}),
          menu
        }
      };
    });
  };

  // ── SAVE TO DISK & SUPABASE ──
  const handleSaveAll = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    try {
      // 0. Auto-instantiate pages for any new /conditions/* or /services/* nested menu items
      const collectItems = (items: NavMenuItem[]): NavMenuItem[] => {
        let res: NavMenuItem[] = [];
        for (const item of items) {
          res.push(item);
          if (item.children && item.children.length > 0) {
            res = res.concat(collectItems(item.children));
          }
        }
        return res;
      };

      const allNavItems = collectItems(navData.header?.menu || []);
      const newConditionsToAdd: Condition[] = [];
      const newServicesToAdd: Service[] = [];

      allNavItems.forEach((item) => {
        if (!item.href || typeof item.href !== "string") return;
        const cleanHref = item.href.trim().split("?")[0].split("#")[0];

        // Match /conditions/...
        if (cleanHref.startsWith("/conditions/")) {
          const parts = cleanHref.replace("/conditions/", "").split("/").filter(Boolean);
          if (parts.length > 0) {
            const slug = parts[parts.length - 1];
            const parentSlug = parts.length > 1 ? parts[0] : undefined;

            const existing = conditionsList.find((c) => c.slug === slug);
            if (!existing && !newConditionsToAdd.some((c) => c.slug === slug)) {
              newConditionsToAdd.push({
                id: `cond-${slug}`,
                slug,
                name: item.label || slug,
                parentSlug,
                category: parentSlug ? "specialized" : "general",
                shortDescription: `Targeted clinical rehabilitation and evidence-based treatment for ${(item.label || slug).toLowerCase()} in Calgary.`,
                description: `Comprehensive diagnostic assessment, manual therapy, and active rehabilitation plans tailored for ${(item.label || slug).toLowerCase()} at Nose Creek Physiotherapy.`,
                heroImage: "/images/conditions/back-hero.webp",
                cardImage: "/images/conditions/back-hero.webp",
                benefits: [
                  "Rapid symptom relief and reduced inflammation",
                  "Targeted manual therapy and joint mobilization",
                  "Customized home exercise and recurrence prevention program"
                ],
                symptoms: [
                  "Persistent ache, stiffness, or localized discomfort",
                  "Reduced mobility during routine work or physical recreation",
                  "Radiating nerve sensations or muscular tension"
                ],
                treatmentApproach: [
                  "In-depth physical assessment and root-cause movement analysis",
                  "Hands-on joint mobilization, soft tissue release, and dry needling",
                  "Personalized progressive strengthening and ergonomic retraining"
                ],
                faqs: [
                  {
                    question: `What should I expect during my assessment for ${(item.label || slug).toLowerCase()}?`,
                    answer: "Your physiotherapist will conduct a comprehensive biomechanical evaluation, identify root causes, begin initial therapy, and establish a clear customized recovery roadmap."
                  }
                ],
                ctaText: "Book Assessment Online",
                ctaMuted: false,
                sectionOrder: ["hero", "clinical_overview", "symptoms", "treatment_approach", "faqs", "bottom_cta"],
                seo: {
                  title: `${item.label || slug} Treatment Calgary | Nose Creek Physiotherapy`,
                  description: `Specialized physiotherapy, manual therapy, and rehabilitation for ${(item.label || slug).toLowerCase()} at Nose Creek Physiotherapy in Calgary NW & NE.`,
                  heroImageAlt: `${item.label || slug} treatment at Nose Creek Physiotherapy`,
                  cardImageAlt: `${item.label || slug} rehabilitation clinic Calgary`
                }
              });
            }
          }
        }

        // Match /services/...
        if (cleanHref.startsWith("/services/")) {
          const parts = cleanHref.replace("/services/", "").split("/").filter(Boolean);
          if (parts.length > 0) {
            const slug = parts[parts.length - 1];
            const parentSlug = parts.length > 1 ? parts[0] : undefined;

            const existing = servicesList.find((s) => s.slug === slug);
            if (!existing && !newServicesToAdd.some((s) => s.slug === slug)) {
              newServicesToAdd.push({
                id: `srv-${slug}`,
                slug,
                title: item.label || slug,
                parentSlug,
                shortDescription: `Professional ${(item.label || slug).toLowerCase()} services delivered by registered clinicians in Calgary.`,
                description: `Specialized ${(item.label || slug).toLowerCase()} treatments designed to restore mobility, accelerate healing, and optimize physical performance.`,
                heroImage: "/images/services/physio-hero.webp",
                cardImage: "/images/services/physio-hero.webp",
                iconType: "stethoscope",
                iconBg: "#e9f5fb",
                iconColor: "#1c9fd8",
                benefits: [
                  "Accelerated tissue healing and restored functional movement",
                  "One-on-one treatment sessions with experienced clinicians",
                  "Direct billing to major health insurance providers"
                ],
                symptoms: [
                  "Acute pain following sports injury or daily strain",
                  "Chronic muscle stiffness and limited range of motion",
                  "Post-operative weakness or balance difficulties"
                ],
                treatmentApproach: [
                  "Comprehensive diagnostic evaluation",
                  "Targeted manual therapy and therapeutic modalities",
                  "Supervised functional exercise and rehabilitation"
                ],
                faqs: [
                  {
                    question: `Do I need a doctor's referral for ${(item.label || slug).toLowerCase()}?`,
                    answer: "In Alberta, you do not need a physician referral to see a registered physiotherapist, although some private insurance plans may request one for reimbursement."
                  }
                ],
                ctaText: "Book Online",
                ctaMuted: false,
                sectionOrder: ["hero", "clinical_overview", "symptoms", "treatment_approach", "faqs", "bottom_cta"],
                seo: {
                  title: `${item.label || slug} Calgary North | Nose Creek Physiotherapy`,
                  description: `Comprehensive ${(item.label || slug).toLowerCase()} treatments at Nose Creek Physiotherapy Beddington. Direct billing available.`,
                  heroImageAlt: `${item.label || slug} at Nose Creek Physiotherapy`,
                  cardImageAlt: `${item.label || slug} Calgary North clinic`
                }
              });
            }
          }
        }
      });

      // If new conditions auto-created, save them
      if (newConditionsToAdd.length > 0) {
        const updatedConds = [...conditionsList, ...newConditionsToAdd];
        setConditionsList(updatedConds);
        if (typeof window !== "undefined") {
          localStorage.setItem("adm_conditions", JSON.stringify(updatedConds));
          window.dispatchEvent(new Event("conditionsUpdated"));
        }
        await fetch("/api/admin/save-content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "conditions", data: updatedConds })
        }).catch(() => {});
      }

      // If new services auto-created, save them
      if (newServicesToAdd.length > 0) {
        const updatedSrvs = [...servicesList, ...newServicesToAdd];
        setServicesList(updatedSrvs);
        if (typeof window !== "undefined") {
          localStorage.setItem("adm_services", JSON.stringify(updatedSrvs));
          window.dispatchEvent(new Event("servicesUpdated"));
        }
        await fetch("/api/admin/save-content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "services", data: updatedSrvs })
        }).catch(() => {});
      }

      // 1. LocalStorage preview sync
      if (typeof window !== "undefined") {
        const local = localStorage.getItem("adm_settings");
        let parsed = local ? JSON.parse(local) : {};
        parsed.navigation = navData;
        if (!parsed.marketing) parsed.marketing = {};
        parsed.marketing.navigation = navData;
        localStorage.setItem("adm_settings", JSON.stringify(parsed));
      }

      // 2. Base settings payload
      const baseData = { ...(defaultSettings as any) };
      if (typeof window !== "undefined") {
        const local = localStorage.getItem("adm_settings");
        if (local) {
          try {
            const parsed = JSON.parse(local);
            Object.assign(baseData, parsed.settings || {}, parsed);
          } catch {}
        }
      }
      baseData.navigation = navData;
      if (!baseData.marketing) baseData.marketing = {};
      baseData.marketing.navigation = navData;

      const saveRes = await fetch("/api/admin/save-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "settings",
          data: baseData
        })
      });

      if (!saveRes.ok) {
        const errJson = await saveRes.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to persist navigation to server");
      }

      // 3. Client Supabase sync if configured
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: cur } = await supabase.from("site_settings").select("marketing").eq("id", "main").maybeSingle();
          const updatedMarketing = {
            ...(cur?.marketing || {}),
            navigation: navData
          };
          await supabase
            .from("site_settings")
            .update({ marketing: updatedMarketing })
            .eq("id", "main");
        } catch {}
      }

      // 4. Dispatch event for instant website update
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("settingsUpdated"));
      }

      const addedCount = newConditionsToAdd.length + newServicesToAdd.length;
      if (addedCount > 0) {
        setSaveStatus(`✓ Saved! Auto-created ${newConditionsToAdd.length} Condition(s) and ${newServicesToAdd.length} Service(s) as editable pages in admin!`);
      } else {
        setSaveStatus("✓ Header & Footer Navigation saved and live across website!");
      }
      setTimeout(() => setSaveStatus(null), 5000);
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>
        Loading Navigation Manager...
      </div>
    );
  }

  const menu = navData.header?.menu || [];
  const footerColumns = navData.footer?.columns || [];

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "24px 20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#64748b", marginBottom: 6 }}>
            <span>Admin</span>
            <span>/</span>
            <span style={{ color: "#0f172a", fontWeight: 600 }}>Header &amp; Footer Manager</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: "#0f172a" }}>
            🧭 Header &amp; Footer Navigation Manager
          </h1>
          <p style={{ margin: "6px 0 0 0", fontSize: 14, color: "#64748b" }}>
            Manage the top navigation bar with 3-level submenus, top announcement bar, and footer columns.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          disabled={isSaving}
          className="adm-btn adm-btn-primary"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", fontSize: 14, fontWeight: 700 }}
        >
          {isSaving ? "Saving..." : "Save Navigation"}
        </button>
      </div>

      {saveStatus && (
        <div style={{ marginBottom: 20, padding: "12px 18px", borderRadius: 10, background: "#dcfce7", color: "#15803d", border: "1px solid #86efac", fontWeight: 600, fontSize: 14 }}>
          {saveStatus}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid #e2e8f0", marginBottom: 24 }}>
        <button
          type="button"
          onClick={() => setActiveTab("header")}
          style={{
            padding: "10px 18px",
            border: "none",
            background: "none",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            color: activeTab === "header" ? "var(--adm-primary, #0284c7)" : "#64748b",
            borderBottom: activeTab === "header" ? "2px solid var(--adm-primary, #0284c7)" : "2px solid transparent"
          }}
        >
          Header Navigation (3-Level Menu)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("footer")}
          style={{
            padding: "10px 18px",
            border: "none",
            background: "none",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            color: activeTab === "footer" ? "var(--adm-primary, #0284c7)" : "#64748b",
            borderBottom: activeTab === "footer" ? "2px solid var(--adm-primary, #0284c7)" : "2px solid transparent"
          }}
        >
          Footer Columns &amp; Links
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("topbar")}
          style={{
            padding: "10px 18px",
            border: "none",
            background: "none",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            color: activeTab === "topbar" ? "var(--adm-primary, #0284c7)" : "#64748b",
            borderBottom: activeTab === "topbar" ? "2px solid var(--adm-primary, #0284c7)" : "2px solid transparent"
          }}
        >
          Header CTAs &amp; Phone
        </button>
      </div>

      {/* ── TAB 1: HEADER NAVIGATION BUILDER ── */}
      {activeTab === "header" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "14px 18px", borderRadius: 12, border: "1px solid #e2e8f0" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1e293b" }}>Main Navbar Menu Tree</h3>
              <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#64748b" }}>
                Add Level 1 root items, drop-down submenus (Level 2), and nested sub-submenus (Level 3).
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenAdd(1)}
              className="adm-btn adm-btn-secondary"
              style={{ fontSize: 13.5, fontWeight: 600, padding: "8px 16px" }}
            >
              + Add Root Menu Item
            </button>
          </div>

          {menu.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center", background: "#fff", borderRadius: 12, border: "1px dashed #cbd5e1" }}>
              <p style={{ color: "#64748b", margin: "0 0 16px 0" }}>No menu items added yet.</p>
              <button
                type="button"
                onClick={() => handleOpenAdd(1)}
                className="adm-btn adm-btn-primary"
                style={{ fontSize: 13.5 }}
              >
                + Add First Menu Item
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {menu.map((l1, idx1) => {
                const isL1Expanded = expandedIds[l1.id] ?? true;
                const l1Children = l1.children || [];

                return (
                  <div
                    key={l1.id}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: 12,
                      overflow: "hidden",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
                    }}
                  >
                    {/* Level 1 Item Row */}
                    <div
                      style={{
                        padding: "14px 18px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "#ffffff",
                        borderBottom: l1Children.length > 0 && isL1Expanded ? "1px solid #f1f5f9" : "none"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {l1Children.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => toggleExpand(l1.id)}
                            style={{ border: "none", background: "none", cursor: "pointer", fontSize: 12, color: "#64748b", padding: 4 }}
                          >
                            {isL1Expanded ? "▼" : "▶"}
                          </button>
                        ) : (
                          <span style={{ width: 16, display: "inline-block" }} />
                        )}

                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>{l1.label}</span>
                            <span style={{ fontSize: 12, color: "#64748b", background: "#f1f5f9", padding: "2px 8px", borderRadius: 6 }}>
                              {l1.href}
                            </span>
                            {l1.badge && (
                              <span style={{ fontSize: 11, fontWeight: 700, background: "#e0f2fe", color: "#0284c7", padding: "2px 6px", borderRadius: 4 }}>
                                {l1.badge}
                              </span>
                            )}
                            {!l1.enabled && (
                              <span style={{ fontSize: 11, fontWeight: 600, background: "#fee2e2", color: "#dc2626", padding: "2px 6px", borderRadius: 4 }}>
                                Hidden
                              </span>
                            )}
                          </div>
                          {l1Children.length > 0 && (
                            <span style={{ fontSize: 12, color: "#94a3b8" }}>
                              {l1Children.length} Submenu Item{l1Children.length > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Controls */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => handleMoveItem(idx1, "up", 1)}
                          disabled={idx1 === 0}
                          className="adm-btn adm-btn-secondary"
                          style={{ padding: "4px 8px", fontSize: 12 }}
                          title="Move Up"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveItem(idx1, "down", 1)}
                          disabled={idx1 === menu.length - 1}
                          className="adm-btn adm-btn-secondary"
                          style={{ padding: "4px 8px", fontSize: 12 }}
                          title="Move Down"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenAdd(2, l1.id)}
                          className="adm-btn adm-btn-secondary"
                          style={{ padding: "5px 10px", fontSize: 12, fontWeight: 600, color: "#0284c7" }}
                        >
                          + Add Submenu
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(l1, 1)}
                          className="adm-btn adm-btn-secondary"
                          style={{ padding: "5px 10px", fontSize: 12 }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(l1.id, 1)}
                          className="adm-btn adm-btn-secondary"
                          style={{ padding: "5px 10px", fontSize: 12, color: "#ef4444" }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Level 2 Submenus */}
                    {l1Children.length > 0 && isL1Expanded && (
                      <div style={{ background: "#f8fafc", padding: "12px 18px 12px 38px", display: "flex", flexDirection: "column", gap: 8 }}>
                        {l1Children.map((l2, idx2) => {
                          const isL2Expanded = expandedIds[l2.id] ?? true;
                          const l2Children = l2.children || [];

                          return (
                            <div
                              key={l2.id}
                              style={{
                                background: "#ffffff",
                                border: "1px solid #e2e8f0",
                                borderRadius: 8,
                                overflow: "hidden"
                              }}
                            >
                              {/* Level 2 Item Row */}
                              <div
                                style={{
                                  padding: "10px 14px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  borderBottom: l2Children.length > 0 && isL2Expanded ? "1px solid #f1f5f9" : "none"
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  {l2Children.length > 0 ? (
                                    <button
                                      type="button"
                                      onClick={() => toggleExpand(l2.id)}
                                      style={{ border: "none", background: "none", cursor: "pointer", fontSize: 11, color: "#64748b", padding: 2 }}
                                    >
                                      {isL2Expanded ? "▼" : "▶"}
                                    </button>
                                  ) : (
                                    <span style={{ width: 14, display: "inline-block" }} />
                                  )}

                                  <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                      <span style={{ fontWeight: 600, fontSize: 14, color: "#1e293b" }}>{l2.label}</span>
                                      <span style={{ fontSize: 11.5, color: "#64748b", background: "#f1f5f9", padding: "1px 6px", borderRadius: 4 }}>
                                        {l2.href}
                                      </span>
                                      {l2.badge && (
                                        <span style={{ fontSize: 10, fontWeight: 700, background: "#e0f2fe", color: "#0284c7", padding: "1px 5px", borderRadius: 4 }}>
                                          {l2.badge}
                                        </span>
                                      )}
                                      {!l2.enabled && (
                                        <span style={{ fontSize: 10, fontWeight: 600, background: "#fee2e2", color: "#dc2626", padding: "1px 5px", borderRadius: 4 }}>
                                          Hidden
                                        </span>
                                      )}
                                    </div>
                                    {l2Children.length > 0 && (
                                      <span style={{ fontSize: 11, color: "#94a3b8" }}>
                                        {l2Children.length} Nested Sub-item{l2Children.length > 1 ? "s" : ""}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveItem(idx2, "up", 2, l1.id)}
                                    disabled={idx2 === 0}
                                    className="adm-btn adm-btn-secondary"
                                    style={{ padding: "3px 6px", fontSize: 11 }}
                                    title="Move Up"
                                  >
                                    ↑
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveItem(idx2, "down", 2, l1.id)}
                                    disabled={idx2 === l1Children.length - 1}
                                    className="adm-btn adm-btn-secondary"
                                    style={{ padding: "3px 6px", fontSize: 11 }}
                                    title="Move Down"
                                  >
                                    ↓
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenAdd(3, l1.id, l2.id)}
                                    className="adm-btn adm-btn-secondary"
                                    style={{ padding: "4px 8px", fontSize: 11, fontWeight: 600, color: "#0284c7" }}
                                    title="Add Level 3 nested sub-item under this condition/service"
                                  >
                                    + Add Nested Submenu
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEdit(l2, 2, l1.id)}
                                    className="adm-btn adm-btn-secondary"
                                    style={{ padding: "4px 8px", fontSize: 11 }}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteItem(l2.id, 2, l1.id)}
                                    className="adm-btn adm-btn-secondary"
                                    style={{ padding: "4px 8px", fontSize: 11, color: "#ef4444" }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>

                              {/* Level 3 Nested Sub-Submenus */}
                              {l2Children.length > 0 && isL2Expanded && (
                                <div style={{ background: "#f1f5f9", padding: "8px 12px 8px 28px", display: "flex", flexDirection: "column", gap: 6 }}>
                                  {l2Children.map((l3, idx3) => (
                                    <div
                                      key={l3.id}
                                      style={{
                                        background: "#ffffff",
                                        border: "1px solid #cbd5e1",
                                        borderRadius: 6,
                                        padding: "8px 12px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between"
                                      }}
                                    >
                                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <span style={{ color: "#94a3b8", fontSize: 12 }}>↳</span>
                                        <span style={{ fontWeight: 600, fontSize: 13, color: "#334155" }}>{l3.label}</span>
                                        <span style={{ fontSize: 11, color: "#64748b", background: "#f8fafc", padding: "1px 5px", borderRadius: 4 }}>
                                          {l3.href}
                                        </span>
                                        {l3.badge && (
                                          <span style={{ fontSize: 10, fontWeight: 700, background: "#e0f2fe", color: "#0284c7", padding: "1px 4px", borderRadius: 3 }}>
                                            {l3.badge}
                                          </span>
                                        )}
                                      </div>

                                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                        <button
                                          type="button"
                                          onClick={() => handleMoveItem(idx3, "up", 3, l1.id, l2.id)}
                                          disabled={idx3 === 0}
                                          className="adm-btn adm-btn-secondary"
                                          style={{ padding: "2px 5px", fontSize: 10 }}
                                        >
                                          ↑
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleMoveItem(idx3, "down", 3, l1.id, l2.id)}
                                          disabled={idx3 === l2Children.length - 1}
                                          className="adm-btn adm-btn-secondary"
                                          style={{ padding: "2px 5px", fontSize: 10 }}
                                        >
                                          ↓
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleOpenEdit(l3, 3, l1.id, l2.id)}
                                          className="adm-btn adm-btn-secondary"
                                          style={{ padding: "3px 6px", fontSize: 11 }}
                                        >
                                          Edit
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteItem(l3.id, 3, l1.id, l2.id)}
                                          className="adm-btn adm-btn-secondary"
                                          style={{ padding: "3px 6px", fontSize: 11, color: "#ef4444" }}
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                  ))}
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
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: FOOTER COLUMNS & LINKS BUILDER ── */}
      {activeTab === "footer" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "14px 18px", borderRadius: 12, border: "1px solid #e2e8f0" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1e293b" }}>Footer Link Columns</h3>
              <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#64748b" }}>
                Add and customize columns of navigation links displayed in the website footer.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEditingColumn({ id: `ft-col-${Date.now()}`, title: "", isNew: true })}
              className="adm-btn adm-btn-secondary"
              style={{ fontSize: 13.5, fontWeight: 600, padding: "8px 16px" }}
            >
              + Add Footer Column
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {footerColumns.map((col) => (
              <div
                key={col.id}
                style={{
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid #f1f5f9" }}>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{col.title}</h4>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button
                      type="button"
                      onClick={() => setEditingColumn({ id: col.id, title: col.title, isNew: false })}
                      style={{ border: "none", background: "none", cursor: "pointer", color: "#64748b", fontSize: 12 }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete footer column "${col.title}"?`)) {
                          setNavData((prev) => ({
                            ...prev,
                            footer: {
                              ...(prev.footer || {}),
                              columns: (prev.footer?.columns || []).filter((c) => c.id !== col.id)
                            }
                          }));
                        }
                      }}
                      style={{ border: "none", background: "none", cursor: "pointer", color: "#ef4444", fontSize: 12 }}
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6, flexGrow: 1 }}>
                  {(col.links || []).map((link, lIdx) => (
                    <div
                      key={lIdx}
                      style={{
                        padding: "6px 10px",
                        background: "#f8fafc",
                        borderRadius: 6,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: 12.5
                      }}
                    >
                      <span style={{ fontWeight: 600, color: "#334155" }}>{link.label}</span>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => setEditingFooterLink({ colId: col.id, index: lIdx, label: link.label, href: link.href, isNew: false })}
                          style={{ border: "none", background: "none", cursor: "pointer", color: "#64748b", fontSize: 11 }}
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNavData((prev) => {
                              const cols = [...(prev.footer?.columns || [])];
                              const targetCol = cols.find((c) => c.id === col.id);
                              if (targetCol) {
                                targetCol.links = targetCol.links.filter((_, idx) => idx !== lIdx);
                              }
                              return { ...prev, footer: { ...(prev.footer || {}), columns: cols } };
                            });
                          }}
                          style={{ border: "none", background: "none", cursor: "pointer", color: "#ef4444", fontSize: 11 }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setEditingFooterLink({ colId: col.id, index: -1, label: "", href: "/", isNew: true })}
                  className="adm-btn adm-btn-secondary"
                  style={{ marginTop: 12, fontSize: 12, padding: "6px 10px", width: "100%" }}
                >
                  + Add Link
                </button>
              </div>
            ))}
          </div>

          {/* Footer Contact & Copyright Meta */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
            <h4 style={{ margin: "0 0 16px 0", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Footer Bottom Text &amp; Disclaimer</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="adm-form-group" style={{ margin: 0 }}>
                <label className="adm-form-label">Copyright Notice</label>
                <input
                  type="text"
                  className="adm-input"
                  value={navData.footer?.copyrightText || ""}
                  onChange={(e) =>
                    setNavData((prev) => ({
                      ...prev,
                      footer: {
                        ...(prev.footer || {}),
                        copyrightText: e.target.value
                      }
                    }))
                  }
                  placeholder="© 2026 Nose Creek Physiotherapy. All rights reserved."
                />
              </div>

              <div className="adm-form-group" style={{ margin: 0 }}>
                <label className="adm-form-label">Medical Disclaimer Text</label>
                <input
                  type="text"
                  className="adm-input"
                  value={navData.footer?.disclaimerText || ""}
                  onChange={(e) =>
                    setNavData((prev) => ({
                      ...prev,
                      footer: {
                        ...(prev.footer || {}),
                        disclaimerText: e.target.value
                      }
                    }))
                  }
                  placeholder="The information provided on this website is for educational purposes only..."
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: HEADER CTAS & TOP BAR ── */}
      {activeTab === "topbar" && (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 24 }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
            Header Call to Action &amp; Direct Phone
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <div className="adm-form-group" style={{ margin: 0 }}>
              <label className="adm-form-label">Header Phone Number</label>
              <input
                type="text"
                className="adm-input"
                value={navData.header?.phone || ""}
                onChange={(e) =>
                  setNavData((prev) => ({
                    ...prev,
                    header: {
                      ...(prev.header || {}),
                      phone: e.target.value
                    }
                  }))
                }
                placeholder="403-295-8590"
              />
            </div>

            <div className="adm-form-group" style={{ margin: 0 }}>
              <label className="adm-form-label">Top Bar Enabled</label>
              <select
                className="adm-input"
                value={navData.header?.topBarEnabled ? "yes" : "no"}
                onChange={(e) =>
                  setNavData((prev) => ({
                    ...prev,
                    header: {
                      ...(prev.header || {}),
                      topBarEnabled: e.target.value === "yes"
                    }
                  }))
                }
              >
                <option value="yes">Yes — Display top header info bar</option>
                <option value="no">No — Hide top bar</option>
              </select>
            </div>

            <div className="adm-form-group" style={{ margin: 0 }}>
              <label className="adm-form-label">Primary CTA Button Label</label>
              <input
                type="text"
                className="adm-input"
                value={navData.header?.ctaButtonText || ""}
                onChange={(e) =>
                  setNavData((prev) => ({
                    ...prev,
                    header: {
                      ...(prev.header || {}),
                      ctaButtonText: e.target.value
                    }
                  }))
                }
                placeholder="Book Online"
              />
            </div>

            <div className="adm-form-group" style={{ margin: 0 }}>
              <label className="adm-form-label">Primary CTA Destination URL</label>
              <input
                type="text"
                className="adm-input"
                value={navData.header?.ctaButtonUrl || ""}
                onChange={(e) =>
                  setNavData((prev) => ({
                    ...prev,
                    header: {
                      ...(prev.header || {}),
                      ctaButtonUrl: e.target.value
                    }
                  }))
                }
                placeholder="https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT NAV MENU ITEM ── */}
      {editingItem && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 20
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 14,
              width: "100%",
              maxWidth: 520,
              padding: 24,
              boxShadow: "0 20px 48px rgba(0,0,0,0.2)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#0f172a" }}>
                {editingItem.isNew ? "Add" : "Edit"} Level {editingItem.level} Menu Item
              </h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                style={{ border: "none", background: "none", fontSize: 18, cursor: "pointer", color: "#64748b" }}
              >
                ✕
              </button>
            </div>

            {/* Quick Autocomplete dropdown */}
            <div className="adm-form-group" style={{ marginBottom: 14 }}>
              <label className="adm-form-label">Auto-populate from existing pages</label>
              <select
                className="adm-input"
                defaultValue=""
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) return;
                  if (val.startsWith("service:")) {
                    const slug = val.replace("service:", "");
                    const s = servicesList.find((srv) => srv.slug === slug || srv.id === slug);
                    if (s) {
                      setEditingItem({
                        ...editingItem,
                        item: { ...editingItem.item, label: s.title, href: `/services/${s.slug}` }
                      });
                    }
                  } else if (val.startsWith("condition:")) {
                    const slug = val.replace("condition:", "");
                    const c = conditionsList.find((cnd) => cnd.slug === slug || cnd.id === slug);
                    if (c) {
                      setEditingItem({
                        ...editingItem,
                        item: { ...editingItem.item, label: c.name, href: `/conditions/${c.slug}` }
                      });
                    }
                  } else if (val.startsWith("page:")) {
                    const [pLabel, pHref] = val.replace("page:", "").split("|");
                    setEditingItem({
                      ...editingItem,
                      item: { ...editingItem.item, label: pLabel, href: pHref }
                    });
                  }
                }}
              >
                <option value="">-- Choose to auto-fill title and URL --</option>
                <optgroup label="Standard Pages">
                  <option value="page:Homepage|/">Homepage (/)</option>
                  <option value="page:About Us|/about">About Us (/about)</option>
                  <option value="page:Meet the Team|/team">Meet the Team (/team)</option>
                  <option value="page:Google Reviews|/reviews">Google Reviews (/reviews)</option>
                  <option value="page:Services Directory|/services">Services Directory (/services)</option>
                  <option value="page:What We Treat Directory|/conditions">What We Treat (/conditions)</option>
                  <option value="page:Locations & Hours|/locations">Locations &amp; Hours (/locations)</option>
                  <option value="page:Workshops & Events|/workshops">Workshops (/workshops)</option>
                  <option value="page:Clinical Blog|/blog">Blog (/blog)</option>
                  <option value="page:Contact Us|/contact">Contact (/contact)</option>
                </optgroup>
                <optgroup label="Services">
                  {servicesList.map((s) => (
                    <option key={s.slug} value={`service:${s.slug}`}>
                      Service: {s.title}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Conditions">
                  {conditionsList.map((c) => (
                    <option key={c.slug} value={`condition:${c.slug}`}>
                      Condition: {c.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="adm-form-group" style={{ marginBottom: 14 }}>
              <label className="adm-form-label">
                Menu Item Label <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                className="adm-input"
                value={editingItem.item.label}
                onChange={(e) =>
                  setEditingItem({
                    ...editingItem,
                    item: { ...editingItem.item, label: e.target.value }
                  })
                }
                placeholder="e.g., Back Pain Relief"
                required
              />
            </div>

            <div className="adm-form-group" style={{ marginBottom: 14 }}>
              <label className="adm-form-label">
                Destination URL <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                className="adm-input"
                value={editingItem.item.href}
                onChange={(e) =>
                  setEditingItem({
                    ...editingItem,
                    item: { ...editingItem.item, href: e.target.value }
                  })
                }
                placeholder="e.g. /conditions/back-pain or /services/physiotherapy/sports-rehab"
                required
              />
              <div style={{ fontSize: 12, color: "#0369a1", marginTop: 6, background: "#f0f9ff", border: "1px solid #bae6fd", padding: "6px 10px", borderRadius: 6, lineHeight: 1.4 }}>
                💡 <strong>Auto-Page Creation:</strong> If this URL points to a new service or condition sub-page (e.g. <code>/services/...</code> or <code>/conditions/...</code>), saving will automatically create an independent, fully editable clinical page for it in the Services or Conditions manager!
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
              <div className="adm-form-group" style={{ margin: 0 }}>
                <label className="adm-form-label">Badge Tag (Optional)</label>
                <input
                  type="text"
                  className="adm-input"
                  value={editingItem.item.badge || ""}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      item: { ...editingItem.item, badge: e.target.value }
                    })
                  }
                  placeholder="e.g., Popular, New, 4.9 ★"
                />
              </div>

              <div className="adm-form-group" style={{ margin: 0 }}>
                <label className="adm-form-label">Visibility Status</label>
                <select
                  className="adm-input"
                  value={editingItem.item.enabled !== false ? "enabled" : "disabled"}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      item: { ...editingItem.item, enabled: e.target.value === "enabled" }
                    })
                  }
                >
                  <option value="enabled">Active / Visible</option>
                  <option value="disabled">Hidden / Draft</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="adm-btn adm-btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveItem}
                className="adm-btn adm-btn-primary"
              >
                Save Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT FOOTER COLUMN ── */}
      {editingColumn && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 20
          }}
        >
          <div style={{ background: "#ffffff", borderRadius: 14, width: "100%", maxWidth: 440, padding: 24 }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: 17, fontWeight: 700, color: "#0f172a" }}>
              {editingColumn.isNew ? "Add" : "Edit"} Footer Column
            </h3>
            <div className="adm-form-group" style={{ marginBottom: 18 }}>
              <label className="adm-form-label">Column Title</label>
              <input
                type="text"
                className="adm-input"
                value={editingColumn.title}
                onChange={(e) => setEditingColumn({ ...editingColumn, title: e.target.value })}
                placeholder="e.g., Clinical Services"
                required
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                onClick={() => setEditingColumn(null)}
                className="adm-btn adm-btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!editingColumn.title.trim()) return;
                  setNavData((prev) => {
                    const cols = [...(prev.footer?.columns || [])];
                    if (editingColumn.isNew) {
                      cols.push({ id: editingColumn.id, title: editingColumn.title, links: [] });
                    } else {
                      const c = cols.find((item) => item.id === editingColumn.id);
                      if (c) c.title = editingColumn.title;
                    }
                    return { ...prev, footer: { ...(prev.footer || {}), columns: cols } };
                  });
                  setEditingColumn(null);
                }}
                className="adm-btn adm-btn-primary"
              >
                Save Column
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT FOOTER LINK ── */}
      {editingFooterLink && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 20
          }}
        >
          <div style={{ background: "#ffffff", borderRadius: 14, width: "100%", maxWidth: 440, padding: 24 }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: 17, fontWeight: 700, color: "#0f172a" }}>
              {editingFooterLink.isNew ? "Add" : "Edit"} Footer Link
            </h3>

            <div className="adm-form-group" style={{ marginBottom: 14 }}>
              <label className="adm-form-label">Link Label</label>
              <input
                type="text"
                className="adm-input"
                value={editingFooterLink.label}
                onChange={(e) => setEditingFooterLink({ ...editingFooterLink, label: e.target.value })}
                placeholder="e.g., Physiotherapy Rehabilitation"
                required
              />
            </div>

            <div className="adm-form-group" style={{ marginBottom: 18 }}>
              <label className="adm-form-label">Destination URL</label>
              <input
                type="text"
                className="adm-input"
                value={editingFooterLink.href}
                onChange={(e) => setEditingFooterLink({ ...editingFooterLink, href: e.target.value })}
                placeholder="e.g., /services/physiotherapy"
                required
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                onClick={() => setEditingFooterLink(null)}
                className="adm-btn adm-btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!editingFooterLink.label.trim()) return;
                  setNavData((prev) => {
                    const cols = [...(prev.footer?.columns || [])];
                    const col = cols.find((c) => c.id === editingFooterLink.colId);
                    if (col) {
                      col.links = col.links ? [...col.links] : [];
                      if (editingFooterLink.isNew) {
                        col.links.push({ label: editingFooterLink.label, href: editingFooterLink.href });
                      } else {
                        col.links[editingFooterLink.index] = { label: editingFooterLink.label, href: editingFooterLink.href };
                      }
                    }
                    return { ...prev, footer: { ...(prev.footer || {}), columns: cols } };
                  });
                  setEditingFooterLink(null);
                }}
                className="adm-btn adm-btn-primary"
              >
                Save Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
