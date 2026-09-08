"use client";

import React, { useState, useEffect } from "react";
import { useRole } from "@/components/admin/RoleGuard";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { TeamMember, Service, Location } from "@/types/content";
import teamData from "@/data/team.json";
import servicesData from "@/data/services.json";
import locationsData from "@/data/locations.json";
import ServiceIcon from "@/components/ui/ServiceIcon";
import LivePreviewPane from "@/components/admin/LivePreviewPane";
import AdminToast from "@/components/admin/AdminToast";
import ConfirmDeleteModal from "@/components/admin/ConfirmDeleteModal";
import AdminImageUploader from "@/components/admin/AdminImageUploader";
import {
  SearchIcon,
  EyeIcon,
  EditIcon,
  TrashIcon,
  PlusIcon,
  CheckIcon,
  XIcon
} from "@/components/admin/AdminIcons";

export default function AdminTeamPage() {
  const { isAdmin, canDelete, canEditSlugs } = useRole();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ slug: string; name: string } | null>(null);

  // Dynamic services & locations list (synced live with /admin/services and Supabase)
  const [allServices, setAllServices] = useState<Service[]>(servicesData as Service[]);
  const [allLocations, setAllLocations] = useState<Location[]>(locationsData as Location[]);

  const fetchServicesAndLocations = async () => {
    // 1. Instant sync from local storage cache if available
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("adm_services");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAllServices(parsed);
          }
        } catch {}
      }
    }

    // 2. Fetch fresh services from API and Supabase
    try {
      let combined: Service[] = [];
      const res = await fetch("/api/content?type=services", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          combined = data;
        }
      }

      if (isSupabaseConfigured && supabase) {
        try {
          const { data: supaServices } = await supabase
            .from("services")
            .select("*")
            .order("sort_order", { ascending: true });
          if (supaServices && supaServices.length > 0) {
            const map = new Map<string, Service>();
            combined.forEach((s) => map.set(s.slug, s));
            supaServices.forEach((d: any) => {
              const existing = map.get(d.slug);
              map.set(d.slug, {
                id: d.id,
                slug: d.slug,
                title: d.title,
                shortDescription: d.short_description || existing?.shortDescription || "",
                description: d.description || existing?.description || "",
                heroImage: d.hero_image || existing?.heroImage || null,
                sideImage: d.side_image || existing?.sideImage || null,
                cardImage: d.card_image || d.cardImage || d.seo?.cardImage || existing?.cardImage || null,
                iconType: d.icon_type || existing?.iconType || "stethoscope",
                iconBg: d.icon_bg || existing?.iconBg || "#e9f5fb",
                iconColor: d.icon_color || existing?.iconColor || "#1c9fd8",
                ctaText: d.cta_text || existing?.ctaText || "Book Online",
                ctaMuted: d.cta_muted ?? existing?.ctaMuted ?? false,
                benefits: d.benefits || existing?.benefits || [],
                symptoms: d.symptoms || existing?.symptoms || [],
                treatmentApproach: d.treatment_approach || existing?.treatmentApproach || [],
                customSections: d.custom_sections || existing?.customSections || [],
                sectionsData: d.sections_data || d.seo?.sectionsData || d.sectionsData || existing?.sectionsData || {},
                faqs: d.faqs || existing?.faqs || [],
                hiddenSections: d.hidden_sections || existing?.hiddenSections || [],
                sectionOrder: d.section_order || d.sectionOrder || existing?.sectionOrder || [],
                relatedServices: d.related_services || existing?.relatedServices || [],
                relatedConditions: d.related_conditions || existing?.relatedConditions || [],
                teamMembers: d.team_members || existing?.teamMembers || [],
                locations: d.locations || existing?.locations || [],
                testimonials: d.testimonials || existing?.testimonials || [],
                seo: d.seo || existing?.seo || {}
              });
            });
            combined = Array.from(map.values());
          }
        } catch {}
      }

      if (combined.length > 0) {
        setAllServices(combined);
      }
    } catch {}

    // 3. Fetch fresh locations
    try {
      const locRes = await fetch("/api/content?type=locations", { cache: "no-store" });
      if (locRes.ok) {
        const locData = await locRes.json();
        if (Array.isArray(locData) && locData.length > 0) {
          setAllLocations(locData);
        }
      }
    } catch {}
  };

  const fetchTeam = async () => {
    setLoading(true);
    // 1. First attempt to read live from local content API (always fresh from disk)
    try {
      const res = await fetch("/api/content?type=team", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setTeam(data);
          setLoading(false);
          return;
        }
      }
    } catch {}

    // 2. Supabase fallback
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("team_members")
          .select("*")
          .order("sort_order", { ascending: true });
        if (!error && data && data.length > 0) {
          setTeam(
            data.map((d: any) => ({
              id: d.id,
              slug: d.slug,
              name: d.name,
              role: d.role,
              title: d.title || "",
              shortBio: d.short_bio || "",
              fullBio: d.full_bio || "",
              profileImage: d.profile_image || "/images/team/default.jpg",
              specialties: d.specialties || [],
              credentials: d.credentials || [],
              education: d.education || [],
              certifications: d.certifications || [],
              experience: d.experience || "",
              locations: d.locations || [],
              services: d.services || [],
              languages: d.languages || [],
              email: d.email,
              phone: d.phone,
              bookingUrl: d.booking_url,
              bookingCtaText: d.booking_cta_text || d.bookingCtaText || "",
              socialLinks: d.social_links || {},
              featured: d.featured,
              isDirector: d.is_director,
              order: d.sort_order,
              seo: d.seo || {}
            }))
          );
          setLoading(false);
          return;
        }
      } catch {}
    }

    // 3. Static fallback
    setTeam(teamData as TeamMember[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchTeam();
    fetchServicesAndLocations();

    const handleSync = () => {
      fetchServicesAndLocations();
    };
    window.addEventListener("servicesUpdated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("servicesUpdated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const handleSave = async (member: TeamMember) => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from("team_members").upsert({
          id: member.slug,
          slug: member.slug,
          name: member.name,
          role: member.role,
          title: member.title || null,
          short_bio: member.shortBio || null,
          full_bio: member.fullBio || null,
          profile_image: member.profileImage || null,
          specialties: member.specialties || [],
          credentials: member.credentials || [],
          education: member.education || [],
          certifications: member.certifications || [],
          experience: member.experience || null,
          locations: member.locations || [],
          services: member.services || [],
          languages: member.languages || [],
          email: member.email || null,
          phone: member.phone || null,
          booking_url: member.bookingUrl || null,
          booking_cta_text: member.bookingCtaText || null,
          social_links: member.socialLinks || {},
          featured: member.featured || false,
          is_director: member.isDirector || false,
          sort_order: member.order || 99,
          is_published: true,
          updated_at: new Date().toISOString()
        }, { onConflict: "slug" });
        if (error) {
          console.error("Supabase upsert error:", error);
        }
      } catch (err) {
        console.warn("Supabase upsert warning:", err);
      }
    }

    const all = team.map((t) => (t.slug === member.slug ? member : t));
    if (!all.find((t) => t.slug === member.slug)) all.push(member);
    setTeam(all);

    if (typeof window !== "undefined") {
      localStorage.setItem("adm_team", JSON.stringify(all));
    }

    try {
      await fetch("/api/admin/save-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "team", data: all })
      });
    } catch (err) {
      console.error("Failed to save to local API:", err);
    }

    setToastMessage("✓ Practitioner profile updated & live cache purged!");
    setEditingMember(null);
    fetchTeam();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const { slug } = deleteTarget;
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.from("team_members").delete().eq("slug", slug);
        await supabase.from("team_members").delete().eq("id", slug);
      }
      const all = team.filter((t) => t.slug !== slug);
      setTeam(all);
      if (typeof window !== "undefined") {
        localStorage.setItem("adm_team", JSON.stringify(all));
      }
      await fetch("/api/admin/save-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "team", data: all })
      });
      setToastMessage("✓ Team member deleted successfully.");
      setDeleteTarget(null);
    } catch {
      setToastMessage("⚠️ Failed to delete team member.");
    }
  };

  const filtered = team.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.role.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="adm-content-container">
      {toastMessage && (
        <AdminToast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          isOpen={Boolean(deleteTarget)}
          itemName={deleteTarget.name}
          itemType="Practitioner Profile"
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      <div className="adm-header">
        <div>
          <h1 className="adm-page-title">Team &amp; Practitioners Manager</h1>
          <p className="adm-page-subtitle">
            Manage single team page profiles, booking CTA buttons, education, certifications, and offered services.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            type="button"
            onClick={() => {
              fetchServicesAndLocations();
              setEditingMember({
                id: `team-${Date.now()}`,
                slug: `practitioner-${Date.now()}`,
                name: "",
                role: "Physiotherapist",
                title: "BScPT, Registered Physiotherapist",
                shortBio: "",
                fullBio: "",
                profileImage: "/images/team/default.jpg",
                specialties: [],
                credentials: [],
                education: [],
                certifications: [],
                experience: "",
                locations: ["nose-creek-clinic"],
                services: ["physiotherapy"],
                languages: ["English"],
                bookingUrl: "",
                bookingCtaText: "",
                phone: "403-295-8590",
                email: "",
                order: team.length + 1
              });
            }}
            className="adm-btn adm-btn-primary"
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <PlusIcon size={16} />
            <span>Add New Practitioner</span>
          </button>
        </div>
      </div>

      <div className="adm-card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ position: "relative", minWidth: 260, flex: 1, maxWidth: 420 }}>
            <input
              type="text"
              placeholder="Search team members by name, role, slug..."
              className="adm-input"
              style={{ paddingLeft: 34 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span style={{ position: "absolute", left: 10, top: 10, color: "#94a3b8" }}>
              <SearchIcon size={16} />
            </span>
          </div>
          <div style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>
            Total Practitioners: {team.length}
          </div>
        </div>
      </div>

      <div className="adm-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th>Practitioner</th>
                <th>Role &amp; Credentials</th>
                <th>Specialties</th>
                <th>Services</th>
                <th>Sort Order</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 36, color: "#64748b" }}>
                    Loading practitioners...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 36, color: "#64748b" }}>
                    No team members found.
                  </td>
                </tr>
              ) : (
                filtered.map((member) => (
                  <tr key={member.slug}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={member.profileImage || "/images/team/default.jpg"}
                          alt={member.name}
                          style={{ width: 42, height: 42, borderRadius: 999, objectFit: "cover", border: "1px solid #cbd5e1" }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{member.name}</div>
                          <div style={{ fontSize: 12, color: "#64748b" }}>/team/{member.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: "var(--adm-primary)" }}>{member.role}</span>
                      {member.title && <div style={{ fontSize: 12, color: "#64748b" }}>{member.title}</div>}
                    </td>
                    <td>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, maxWidth: 220 }}>
                        {member.specialties?.slice(0, 2).map((spec, i) => (
                          <span key={i} style={{ fontSize: 11, background: "#f1f5f9", padding: "2px 6px", borderRadius: 4 }}>
                            {spec}
                          </span>
                        ))}
                        {(member.specialties?.length || 0) > 2 && (
                          <span style={{ fontSize: 11, color: "#64748b" }}>+{(member.specialties?.length || 0) - 2} more</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: 999,
                          background: "#e0f2fe",
                          color: "#0369a1"
                        }}
                      >
                        {member.services?.length || 0} services
                      </span>
                    </td>
                    <td>{member.order ?? 99}</td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <button
                        onClick={() => setPreviewUrl(`/team/${member.slug}`)}
                        className="adm-btn adm-btn-secondary adm-btn-sm"
                        style={{ marginRight: 6, display: "inline-flex", alignItems: "center", gap: 4 }}
                      >
                        <EyeIcon size={13} />
                        <span>Preview</span>
                      </button>
                      <button
                        onClick={() => {
                          fetchServicesAndLocations();
                          setEditingMember(JSON.parse(JSON.stringify(member)));
                        }}
                        className="adm-btn adm-btn-primary adm-btn-sm"
                        style={{ marginRight: 6, display: "inline-flex", alignItems: "center", gap: 4 }}
                      >
                        <EditIcon size={13} />
                        <span>Edit</span>
                      </button>
                      {canDelete && (
                        <button
                          onClick={() => setDeleteTarget({ slug: member.slug, name: member.name })}
                          className="adm-btn adm-btn-secondary adm-btn-sm"
                          style={{ color: "#dc2626", display: "inline-flex", alignItems: "center", padding: "6px 8px" }}
                          title="Delete Team Member"
                        >
                          <TrashIcon size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingMember && (
        <TeamEditorModal
          member={editingMember}
          canEditSlugs={canEditSlugs}
          allServices={allServices}
          allLocations={allLocations}
          onClose={() => setEditingMember(null)}
          onSave={handleSave}
          onPreview={(slug) => setPreviewUrl(`/team/${slug}`)}
        />
      )}

      <LivePreviewPane
        url={previewUrl || "/team"}
        isOpen={Boolean(previewUrl)}
        onClose={() => setPreviewUrl(null)}
        title={`Live Preview: ${previewUrl}`}
      />
    </div>
  );
}

// =============================================================================
// ICONS FOR PRACTITIONER EDITOR MODAL (NO EMOJIS - CRISP VECTOR SVGS)
// =============================================================================

function UserTabIcon({ size = 15, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function CalendarTabIcon({ size = 15, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

function OverviewTabIcon({ size = 15, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M9 12h6" />
      <path d="M9 16h6" />
    </svg>
  );
}

function EducationTabIcon({ size = 15, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}

function ServicesTabIcon({ size = 15, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
      <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
      <circle cx="20" cy="10" r="2" />
    </svg>
  );
}

function InfoTabIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="16" y2="12" />
      <line x1="12" x2="12.01" y1="8" y2="8" />
    </svg>
  );
}

function CheckmarkSvg({ size = 14, color = "#16a34a" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function StarSvg({ size = 14, color = "#0284c7" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

// =============================================================================
// ENHANCED TEAM EDITOR MODAL WITH COMPREHENSIVE SINGLE PAGE CONTROLS
// =============================================================================

function TeamEditorModal({
  member: initial,
  canEditSlugs,
  allServices,
  allLocations,
  onClose,
  onSave,
  onPreview
}: {
  member: TeamMember;
  canEditSlugs: boolean;
  allServices: Service[];
  allLocations: Location[];
  onClose: () => void;
  onSave: (m: TeamMember) => void;
  onPreview: (slug: string) => void;
}) {
  const [member, setMember] = useState<TeamMember>(initial);
  const [activeTab, setActiveTab] = useState<"basic" | "booking" | "overview" | "education" | "services">("basic");

  // Input states for list additions
  const [newSpec, setNewSpec] = useState("");
  const [newEdu, setNewEdu] = useState("");
  const [newCert, setNewCert] = useState("");
  const [newLang, setNewLang] = useState("");
  const [serviceSearch, setServiceSearch] = useState("");

  // Specialties
  const addSpec = () => {
    if (!newSpec.trim()) return;
    setMember((p) => ({ ...p, specialties: [...(p.specialties || []), newSpec.trim()] }));
    setNewSpec("");
  };
  const removeSpec = (i: number) => {
    setMember((p) => ({ ...p, specialties: p.specialties?.filter((_, idx) => idx !== i) }));
  };

  // Education (Academic Background)
  const addEdu = () => {
    if (!newEdu.trim()) return;
    setMember((p) => ({ ...p, education: [...(p.education || []), newEdu.trim()] }));
    setNewEdu("");
  };
  const removeEdu = (i: number) => {
    setMember((p) => ({ ...p, education: p.education?.filter((_, idx) => idx !== i) }));
  };

  // Certifications (Specialized Certifications)
  const addCert = () => {
    if (!newCert.trim()) return;
    setMember((p) => ({ ...p, certifications: [...(p.certifications || []), newCert.trim()] }));
    setNewCert("");
  };
  const removeCert = (i: number) => {
    setMember((p) => ({ ...p, certifications: p.certifications?.filter((_, idx) => idx !== i) }));
  };

  // Languages Spoken
  const addLang = (langName?: string) => {
    const target = (langName || newLang).trim();
    if (!target) return;
    if ((member.languages || []).includes(target)) {
      setNewLang("");
      return;
    }
    setMember((p) => ({ ...p, languages: [...(p.languages || []), target] }));
    setNewLang("");
  };
  const removeLang = (i: number) => {
    setMember((p) => ({ ...p, languages: p.languages?.filter((_, idx) => idx !== i) }));
  };

  // Toggle Service
  const toggleService = (serviceSlugOrId: string) => {
    const current = member.services || [];
    const isSelected = current.includes(serviceSlugOrId);
    let updated: string[];
    if (isSelected) {
      updated = current.filter((s) => s !== serviceSlugOrId);
    } else {
      updated = [...current, serviceSlugOrId];
    }
    setMember((p) => ({ ...p, services: updated }));
  };

  // Toggle Location
  const toggleLocation = (locSlug: string) => {
    const current = member.locations || [];
    const isSelected = current.includes(locSlug);
    let updated: string[];
    if (isSelected) {
      updated = current.filter((l) => l !== locSlug);
    } else {
      updated = [...current, locSlug];
    }
    setMember((p) => ({ ...p, locations: updated }));
  };

  // Select all or clear services
  const selectAllServices = () => {
    setMember((p) => ({ ...p, services: allServices.map((s) => s.slug || s.id) }));
  };
  const clearAllServices = () => {
    setMember((p) => ({ ...p, services: [] }));
  };

  const filteredServices = allServices.filter(
    (s) =>
      s.title.toLowerCase().includes(serviceSearch.toLowerCase()) ||
      (s.shortDescription && s.shortDescription.toLowerCase().includes(serviceSearch.toLowerCase()))
  );

  const firstName = member.name ? member.name.split(" ")[0] : "Practitioner";

  const tabs = [
    { id: "basic" as const, label: "Basic Info & Bio", icon: UserTabIcon },
    { id: "booking" as const, label: "Booking & CTA", icon: CalendarTabIcon },
    { id: "overview" as const, label: "Practitioner Overview", icon: OverviewTabIcon },
    { id: "education" as const, label: "Education & Certs", icon: EducationTabIcon },
    {
      id: "services" as const,
      label: "Services Offered",
      icon: ServicesTabIcon,
      badge: member.services?.length || 0
    }
  ];

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div
        className="adm-modal wide"
        style={{
          maxWidth: 900,
          width: "95%",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: 14,
          overflow: "hidden"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Responsive Modal Header */}
        <div
          className="adm-modal-header"
          style={{
            borderBottom: "1px solid #e2e8f0",
            padding: "16px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            background: "#ffffff"
          }}
        >
          <div style={{ flex: 1, minWidth: 220 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a", wordBreak: "break-word" }}>
              Edit Practitioner: {member.name || "New Profile"}
            </h3>
            <span style={{ fontSize: 12.5, color: "#64748b", display: "inline-block", marginTop: 2 }}>
              Live Route: <strong>/team/{member.slug}</strong>
            </span>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => onPreview(member.slug)}
              className="adm-btn adm-btn-secondary adm-btn-sm"
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <EyeIcon size={14} />
              <span>Preview Live Page</span>
            </button>
            <button
              onClick={onClose}
              style={{
                background: "#f1f5f9",
                border: "none",
                fontSize: 16,
                cursor: "pointer",
                color: "#64748b",
                width: 32,
                height: 32,
                borderRadius: "50%",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s ease"
              }}
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs (Responsive, Clean Pill Design, No Bottom Text Cutoff) */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            padding: "12px 24px",
            background: "#f8fafc",
            borderBottom: "1px solid #e2e8f0"
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 14px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  borderRadius: 8,
                  border: isActive ? "1px solid #0e78a8" : "1px solid #cbd5e1",
                  background: isActive ? "#0e78a8" : "#ffffff",
                  color: isActive ? "#ffffff" : "#334155",
                  boxShadow: isActive ? "0 2px 4px rgba(14, 120, 168, 0.2)" : "0 1px 2px rgba(0,0,0,0.03)",
                  transition: "all 0.15s ease",
                  lineHeight: 1.4,
                  whiteSpace: "nowrap"
                }}
              >
                <IconComponent size={15} color={isActive ? "#ffffff" : "#64748b"} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    style={{
                      background: isActive ? "rgba(255, 255, 255, 0.25)" : "#e2e8f0",
                      color: isActive ? "#ffffff" : "#334155",
                      padding: "1px 7px",
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 700,
                      lineHeight: "16px"
                    }}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Modal Body Scrollable Container */}
        <div className="adm-modal-body" style={{ overflowY: "auto", padding: "20px 24px", flex: 1 }}>
          {/* ================================================================= */}
          {/* TAB 1: BASIC INFO & BIO */}
          {/* ================================================================= */}
          {activeTab === "basic" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="adm-form-group">
                  <label className="adm-form-label">Full Name <span style={{ color: "#dc2626" }}>*</span></label>
                  <input
                    type="text"
                    className="adm-input"
                    value={member.name}
                    onChange={(e) => setMember({ ...member, name: e.target.value })}
                    placeholder="e.g. Blair Schachterle"
                    required
                  />
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">URL Slug {canEditSlugs ? "" : "(Guarded)"}</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={member.slug}
                    disabled={!canEditSlugs}
                    onChange={(e) => setMember({ ...member, slug: e.target.value })}
                    placeholder="e.g. blair-schachterle"
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="adm-form-group">
                  <label className="adm-form-label">Clinical Role <span style={{ color: "#dc2626" }}>*</span></label>
                  <input
                    type="text"
                    className="adm-input"
                    value={member.role}
                    onChange={(e) => setMember({ ...member, role: e.target.value })}
                    placeholder="e.g. President & Physiotherapist"
                    required
                  />
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Credentials / Post-nominals</label>
                  <input
                    type="text"
                    placeholder="e.g. BScPT, Dip Manip PT, FCAMPT, CGIMS"
                    className="adm-input"
                    value={member.title || ""}
                    onChange={(e) => setMember({ ...member, title: e.target.value })}
                  />
                </div>
              </div>

              <AdminImageUploader
                label="Profile Photo (Headshot)"
                value={member.profileImage || ""}
                onChange={(url) => setMember({ ...member, profileImage: url })}
                folder="team"
                placeholder="/images/team/blair-schachterle.jpg"
                aspectRatioNote="Portrait 3:4 or Square recommended"
              />

              <div className="adm-form-group">
                <label className="adm-form-label">Short Summary Bio (Displayed in Hero banner)</label>
                <textarea
                  className="adm-textarea"
                  style={{ minHeight: 70 }}
                  value={member.shortBio || ""}
                  onChange={(e) => setMember({ ...member, shortBio: e.target.value })}
                  placeholder="Concise 1-2 sentence overview for cards and hero intro..."
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">Full Clinical Biography (Background &amp; Philosophy)</label>
                <textarea
                  className="adm-textarea"
                  style={{ minHeight: 120 }}
                  value={member.fullBio || ""}
                  onChange={(e) => setMember({ ...member, fullBio: e.target.value })}
                  placeholder="Comprehensive clinical background, specialties, and patient care philosophy..."
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="adm-form-group">
                  <label className="adm-form-label">Display Sort Order</label>
                  <input
                    type="number"
                    className="adm-input"
                    value={member.order ?? 99}
                    onChange={(e) => setMember({ ...member, order: parseInt(e.target.value) || 99 })}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 24 }}>
                  <input
                    type="checkbox"
                    id="featuredMemberCheck"
                    checked={Boolean(member.featured)}
                    onChange={(e) => setMember({ ...member, featured: e.target.checked })}
                    style={{ width: 16, height: 16, cursor: "pointer" }}
                  />
                  <label htmlFor="featuredMemberCheck" style={{ fontSize: 13.5, fontWeight: 600, color: "#334155", cursor: "pointer" }}>
                    Featured on Team Directory &amp; Homepage
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: BOOKING CTA & CONTACT */}
          {/* ================================================================= */}
          {activeTab === "booking" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: 12,
                  padding: "14px 18px",
                  fontSize: 13,
                  color: "#166534",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10
                }}
              >
                <div style={{ marginTop: 2, flexShrink: 0 }}>
                  <InfoTabIcon size={16} color="#16a34a" />
                </div>
                <div style={{ lineHeight: 1.5 }}>
                  <strong>Single Team Page Booking Controls:</strong> These fields control the prominent green booking CTA buttons in the <strong>Hero Banner</strong>, the <strong>Direct Booking Sidebar Widget</strong>, and the <strong>Bottom CTA Section</strong>.
                </div>
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">Online Booking URL (Direct EMR or Clinic Portal)</label>
                <input
                  type="text"
                  className="adm-input"
                  placeholder="https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington"
                  value={member.bookingUrl || ""}
                  onChange={(e) => setMember({ ...member, bookingUrl: e.target.value })}
                />
                <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 4 }}>
                  Leave blank to use the default clinic online booking portal.
                </div>
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">Custom CTA Button Label</label>
                <input
                  type="text"
                  className="adm-input"
                  placeholder={`Default: Book With ${firstName}`}
                  value={member.bookingCtaText || ""}
                  onChange={(e) => setMember({ ...member, bookingCtaText: e.target.value })}
                />
                <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 4 }}>
                  Examples: <code>Book With {firstName}</code>, <code>Schedule With {firstName}</code>, or <code>Book Physiotherapy Assessment</code>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="adm-form-group">
                  <label className="adm-form-label">Direct Clinic Phone</label>
                  <input
                    type="text"
                    className="adm-input"
                    placeholder="403-295-8590"
                    value={member.phone || ""}
                    onChange={(e) => setMember({ ...member, phone: e.target.value })}
                  />
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Practitioner Email (Optional)</label>
                  <input
                    type="email"
                    className="adm-input"
                    placeholder="e.g. blair@nosecreekphysiotherapy.com"
                    value={member.email || ""}
                    onChange={(e) => setMember({ ...member, email: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 3: PRACTITIONER OVERVIEW */}
          {/* ================================================================= */}
          {activeTab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div
                style={{
                  background: "#f0f9ff",
                  border: "1px solid #bae6fd",
                  borderRadius: 12,
                  padding: "14px 18px",
                  fontSize: 13,
                  color: "#0369a1",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10
                }}
              >
                <div style={{ marginTop: 2, flexShrink: 0 }}>
                  <InfoTabIcon size={16} color="#0284c7" />
                </div>
                <div style={{ lineHeight: 1.5 }}>
                  <strong>Practitioner Overview Card:</strong> Appears on the right sidebar of the single team page, highlighting clinical experience, languages spoken, direct phone, and assigned clinic locations.
                </div>
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">Clinical Experience Statement</label>
                <input
                  type="text"
                  className="adm-input"
                  placeholder="e.g. 24+ Years at Nose Creek Physiotherapy"
                  value={member.experience || ""}
                  onChange={(e) => setMember({ ...member, experience: e.target.value })}
                />
              </div>

              {/* Languages Spoken */}
              <div style={{ background: "#f8fafc", padding: "16px 18px", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                <label className="adm-form-label" style={{ marginBottom: 6 }}>Languages Spoken</label>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <input
                    type="text"
                    placeholder="Type language (e.g. English, French, Tagalog, Punjabi)..."
                    className="adm-input"
                    value={newLang}
                    onChange={(e) => setNewLang(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLang(); } }}
                  />
                  <button type="button" onClick={() => addLang()} className="adm-btn adm-btn-primary adm-btn-sm">
                    Add
                  </button>
                </div>

                {/* Quick suggestions */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>Quick Add:</span>
                  {["English", "French", "Tagalog", "Punjabi", "Hindi", "Spanish", "Cantonese", "Mandarin"].map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => addLang(lang)}
                      style={{
                        fontSize: 11,
                        padding: "2px 8px",
                        borderRadius: 6,
                        background: "#ffffff",
                        border: "1px solid #cbd5e1",
                        color: "#334155",
                        cursor: "pointer"
                      }}
                    >
                      + {lang}
                    </button>
                  ))}
                </div>

                {/* Badges list */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {(member.languages || []).map((lang, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: "#f1f5f9",
                        color: "#334155",
                        border: "1px solid #cbd5e1",
                        padding: "4px 12px",
                        borderRadius: 999,
                        fontSize: 13,
                        fontWeight: 600,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8
                      }}
                    >
                      <span>{lang}</span>
                      <button
                        type="button"
                        onClick={() => removeLang(idx)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", fontWeight: 700, padding: 0, fontSize: 13 }}
                        title="Remove"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Clinic Locations */}
              <div style={{ background: "#f8fafc", padding: "16px 18px", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                <label className="adm-form-label" style={{ marginBottom: 6 }}>Practicing Clinic Locations</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {allLocations.map((loc) => {
                    const isChecked = (member.locations || []).includes(loc.slug) || (member.locations || []).includes(loc.id);
                    return (
                      <label
                        key={loc.id || loc.slug}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "8px 12px",
                          borderRadius: 8,
                          background: isChecked ? "#f0fdf4" : "#ffffff",
                          border: `1px solid ${isChecked ? "#86efac" : "#e2e8f0"}`,
                          cursor: "pointer"
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleLocation(loc.slug || loc.id)}
                          style={{ width: 16, height: 16 }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13.5, color: "#1e293b" }}>{loc.name}</div>
                          {loc.address && <div style={{ fontSize: 12, color: "#64748b" }}>{loc.address}</div>}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 4: EDUCATION & CERTIFICATIONS */}
          {/* ================================================================= */}
          {activeTab === "education" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Academic Background */}
              <div style={{ background: "#f8fafc", padding: "16px 18px", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
                      Academic Background (Degrees &amp; Universities)
                    </h4>
                    <span style={{ fontSize: 12, color: "#64748b" }}>
                      Renders under &quot;Education &amp; Certifications&quot; with verified credentials.
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <input
                    type="text"
                    placeholder="e.g. Bachelor of Science in Physical Therapy - University of Alberta (1992)"
                    className="adm-input"
                    value={newEdu}
                    onChange={(e) => setNewEdu(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addEdu(); } }}
                  />
                  <button type="button" onClick={addEdu} className="adm-btn adm-btn-primary adm-btn-sm" style={{ whiteSpace: "nowrap" }}>
                    + Add Degree
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {(member.education || []).map((edu, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                        padding: "9px 14px",
                        borderRadius: 8,
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        fontSize: 13.5,
                        color: "#334155"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <CheckmarkSvg size={14} color="#16a34a" />
                        <span>{edu}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeEdu(idx)}
                        style={{ border: "none", background: "none", color: "#dc2626", cursor: "pointer", fontWeight: 700, fontSize: 14 }}
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {(member.education || []).length === 0 && (
                    <div style={{ fontSize: 12.5, color: "#94a3b8", fontStyle: "italic", padding: 8 }}>
                      No academic degrees listed yet. Add one above.
                    </div>
                  )}
                </div>
              </div>

              {/* Specialized Certifications */}
              <div style={{ background: "#f8fafc", padding: "16px 18px", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
                      Specialized Certifications &amp; Fellowships
                    </h4>
                    <span style={{ fontSize: 12, color: "#64748b" }}>
                      Renders with specialized certification badges under qualifications.
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <input
                    type="text"
                    placeholder="e.g. Fellow of Canadian Academy of Manipulative Physiotherapy (FCAMPT)"
                    className="adm-input"
                    value={newCert}
                    onChange={(e) => setNewCert(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCert(); } }}
                  />
                  <button type="button" onClick={addCert} className="adm-btn adm-btn-primary adm-btn-sm" style={{ whiteSpace: "nowrap" }}>
                    + Add Certification
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {(member.certifications || []).map((cert, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                        padding: "9px 14px",
                        borderRadius: 8,
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        fontSize: 13.5,
                        color: "#334155"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <StarSvg size={14} color="#0284c7" />
                        <span>{cert}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCert(idx)}
                        style={{ border: "none", background: "none", color: "#dc2626", cursor: "pointer", fontWeight: 700, fontSize: 14 }}
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {(member.certifications || []).length === 0 && (
                    <div style={{ fontSize: 12.5, color: "#94a3b8", fontStyle: "italic", padding: 8 }}>
                      No specialized certifications listed yet. Add one above.
                    </div>
                  )}
                </div>
              </div>

              {/* Specialties & Focus Areas */}
              <div style={{ background: "#f8fafc", padding: "16px 18px", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                <label className="adm-form-label">Clinical Specialties &amp; Focus Areas</label>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <input
                    type="text"
                    placeholder="e.g. IMS Dry Needling, Vestibular Rehab, Spinal Manipulation..."
                    className="adm-input"
                    value={newSpec}
                    onChange={(e) => setNewSpec(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSpec(); } }}
                  />
                  <button type="button" onClick={addSpec} className="adm-btn adm-btn-primary adm-btn-sm">
                    Add
                  </button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {(member.specialties || []).map((s, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: "#e0f2fe",
                        color: "#0369a1",
                        border: "1px solid #bae6fd",
                        padding: "4px 10px",
                        borderRadius: 999,
                        fontSize: 13,
                        fontWeight: 600,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6
                      }}
                    >
                      <span>{s}</span>
                      <button
                        type="button"
                        onClick={() => removeSpec(idx)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#0284c7", fontWeight: 700 }}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 5: THERAPIES & SERVICES OFFERED BY PRACTITIONER */}
          {/* ================================================================= */}
          {activeTab === "services" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(111, 175, 28, 0.08), rgba(28, 159, 216, 0.08))",
                  border: "1px solid #bbf7d0",
                  borderRadius: 12,
                  padding: "16px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12
                }}
              >
                <div>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#166534" }}>
                    Therapies &amp; Services Offered by {firstName}
                  </h4>
                  <span style={{ fontSize: 12.5, color: "#15803d" }}>
                    Select which service cards appear under <strong>&quot;Services Offered by {firstName}&quot;</strong> on their single team profile page.
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    onClick={selectAllServices}
                    style={{
                      padding: "5px 12px",
                      borderRadius: 6,
                      background: "#ffffff",
                      border: "1px solid #cbd5e1",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#334155",
                      cursor: "pointer"
                    }}
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={clearAllServices}
                    style={{
                      padding: "5px 12px",
                      borderRadius: 6,
                      background: "#ffffff",
                      border: "1px solid #fecaca",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#dc2626",
                      cursor: "pointer"
                    }}
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Search & Selected Count Bar */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <input
                  type="text"
                  placeholder="Filter clinic services..."
                  value={serviceSearch}
                  onChange={(e) => setServiceSearch(e.target.value)}
                  className="adm-input"
                  style={{ maxWidth: 320 }}
                />
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--primary, #0e78a8)" }}>
                  {member.services?.length || 0} of {allServices.length} services selected
                </div>
              </div>

              {/* Service Cards Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
                {filteredServices.map((service) => {
                  const isChecked = (member.services || []).includes(service.slug) || (member.services || []).includes(service.id);
                  return (
                    <div
                      key={service.id || service.slug}
                      onClick={() => toggleService(service.slug || service.id)}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                        padding: "12px 14px",
                        borderRadius: 12,
                        background: isChecked ? "#f0fdf4" : "#ffffff",
                        border: `2px solid ${isChecked ? "#22c55e" : "#e2e8f0"}`,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        boxShadow: isChecked ? "0 2px 8px rgba(34, 197, 94, 0.12)" : "none"
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by parent div onClick
                        style={{ marginTop: 4, width: 16, height: 16, cursor: "pointer" }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 6,
                              background: service.iconBg || "#e9f5fb",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            <ServiceIcon type={service.iconType} color={service.iconColor || "#1c9fd8"} size={16} />
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>
                            {service.title}
                          </span>
                        </div>
                        {service.shortDescription && (
                          <div
                            style={{
                              fontSize: 11.5,
                              color: "#64748b",
                              lineHeight: 1.4,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden"
                            }}
                          >
                            {service.shortDescription}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className="adm-modal-footer"
          style={{
            borderTop: "1px solid #e2e8f0",
            padding: "16px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div style={{ fontSize: 12.5, color: "#64748b" }}>
            Ready to apply changes to <strong>/team/{member.slug}</strong>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={onClose} className="adm-btn adm-btn-secondary">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onSave(member)}
              className="adm-btn adm-btn-success"
              style={{
                background: "#16a34a",
                color: "#ffffff",
                padding: "9px 22px",
                fontWeight: 800,
                boxShadow: "0 4px 12px rgba(22, 163, 74, 0.25)"
              }}
            >
              💾 Save Practitioner Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
