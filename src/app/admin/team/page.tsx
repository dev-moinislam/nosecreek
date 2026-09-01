"use client";

import React, { useState, useEffect } from "react";
import { useRole } from "@/components/admin/RoleGuard";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { TeamMember } from "@/types/content";
import teamData from "@/data/team.json";
import LivePreviewPane from "@/components/admin/LivePreviewPane";
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

  const fetchTeam = async () => {
    setLoading(true);
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
              socialLinks: d.social_links || {},
              featured: d.featured,
              isDirector: d.is_director,
              order: d.sort_order,
              seo: d.seo || {}
            }))
          );
        } else {
          setTeam(teamData as TeamMember[]);
        }
      } catch {
        setTeam(teamData as TeamMember[]);
      }
    } else if (typeof window !== "undefined") {
      const local = localStorage.getItem("adm_team");
      if (local) {
        setTeam(JSON.parse(local));
      } else {
        setTeam(teamData as TeamMember[]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleSave = async (member: TeamMember) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from("team_members").upsert({
        id: member.id || `team-${member.slug}`,
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
        social_links: member.socialLinks || {},
        featured: member.featured || false,
        is_director: member.isDirector || false,
        sort_order: member.order || 99,
        is_published: true,
        updated_at: new Date().toISOString()
      });
    }
    const all = team.map((t) => (t.slug === member.slug ? member : t));
    if (!all.find((t) => t.slug === member.slug)) all.push(member);
    setTeam(all);
    if (typeof window !== "undefined") {
      localStorage.setItem("adm_team", JSON.stringify(all));
    }
    alert("✓ Team member saved!");
    setEditingMember(null);
    fetchTeam();
  };

  const handleDelete = async (slug: string) => {
    if (!canDelete) {
      alert("In Client Mode, deleting team members is disabled.");
      return;
    }
    if (!confirm(`Are you sure you want to delete ${slug}?`)) return;
    if (isSupabaseConfigured && supabase) {
      await supabase.from("team_members").delete().eq("slug", slug);
    }
    const all = team.filter((t) => t.slug !== slug);
    setTeam(all);
    if (typeof window !== "undefined") {
      localStorage.setItem("adm_team", JSON.stringify(all));
    }
    alert("✓ Team member deleted!");
    fetchTeam();
  };

  const filtered = team.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.role.toLowerCase().includes(search.toLowerCase()) ||
      (t.title && t.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 14 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, fontFamily: "var(--adm-font-display)" }}>
            Team & Practitioners Manager
          </h2>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: "2px 0 0 0" }}>
            Manage staff profiles, clinical certifications, biographies, and specialties
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() =>
              setEditingMember({
                id: `team-${Date.now()}`,
                slug: "new-member",
                name: "New Practitioner",
                role: "Physiotherapist",
                title: "",
                profileImage: "/images/team/default.jpg",
                specialties: [],
                credentials: []
              })
            }
            className="adm-btn adm-btn-primary"
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <PlusIcon size={16} />
            <span>Add Team Member</span>
          </button>
        )}
      </div>

      <div className="adm-card" style={{ padding: 14, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <SearchIcon size={16} style={{ color: "#64748b" }} />
          <input
            type="text"
            placeholder="Search team members by name or role..."
            className="adm-input"
            style={{ border: "none", padding: "6px 0", boxShadow: "none" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="adm-card">
        <div className="adm-table-container">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Practitioner</th>
                <th>Role / Title</th>
                <th>Specialties</th>
                <th>Order</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: 36, color: "#64748b" }}>
                    Loading team members...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: 36, color: "#64748b" }}>
                    No team members found.
                  </td>
                </tr>
              ) : (
                filtered.map((member) => (
                  <tr key={member.slug}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, maxWidth: 260 }}>
                        {member.specialties?.slice(0, 3).map((spec, i) => (
                          <span key={i} style={{ fontSize: 11, background: "#f1f5f9", padding: "2px 6px", borderRadius: 4 }}>
                            {spec}
                          </span>
                        ))}
                      </div>
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
                        onClick={() => setEditingMember(JSON.parse(JSON.stringify(member)))}
                        className="adm-btn adm-btn-primary adm-btn-sm"
                        style={{ marginRight: 6, display: "inline-flex", alignItems: "center", gap: 4 }}
                      >
                        <EditIcon size={13} />
                        <span>Edit</span>
                      </button>
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(member.slug)}
                          className="adm-btn adm-btn-secondary adm-btn-sm"
                          style={{ color: "#dc2626", display: "inline-flex", alignItems: "center", padding: "6px 8px" }}
                          title="Delete"
                        >
                          <TrashIcon size={13} />
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

function TeamEditorModal({
  member: initial,
  canEditSlugs,
  onClose,
  onSave,
  onPreview
}: {
  member: TeamMember;
  canEditSlugs: boolean;
  onClose: () => void;
  onSave: (m: TeamMember) => void;
  onPreview: (slug: string) => void;
}) {
  const [member, setMember] = useState<TeamMember>(initial);
  const [newSpec, setNewSpec] = useState("");

  const addSpec = () => {
    if (!newSpec.trim()) return;
    setMember((p) => ({ ...p, specialties: [...(p.specialties || []), newSpec.trim()] }));
    setNewSpec("");
  };

  const removeSpec = (i: number) => {
    setMember((p) => ({ ...p, specialties: p.specialties?.filter((_, idx) => idx !== i) }));
  };

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal wide" onClick={(e) => e.stopPropagation()}>
        <div className="adm-modal-header">
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
              Edit Practitioner: {member.name}
            </h3>
            <span style={{ fontSize: 13, color: "#64748b" }}>/team/{member.slug}</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={() => onPreview(member.slug)}
              className="adm-btn adm-btn-secondary adm-btn-sm"
            >
              👁️ Preview Live
            </button>
            <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#94a3b8" }}>
              ✕
            </button>
          </div>
        </div>

        <div className="adm-modal-body">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="adm-form-group">
              <label className="adm-form-label">Full Name</label>
              <input
                type="text"
                className="adm-input"
                value={member.name}
                onChange={(e) => setMember({ ...member, name: e.target.value })}
                required
              />
            </div>
            <div className="adm-form-group">
              <label className="adm-form-label">URL Slug {canEditSlugs ? "" : "(Guarded in Client Mode)"}</label>
              <input
                type="text"
                className="adm-input"
                value={member.slug}
                disabled={!canEditSlugs}
                onChange={(e) => setMember({ ...member, slug: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="adm-form-group">
              <label className="adm-form-label">Clinical Role</label>
              <input
                type="text"
                className="adm-input"
                value={member.role}
                onChange={(e) => setMember({ ...member, role: e.target.value })}
                required
              />
            </div>
            <div className="adm-form-group">
              <label className="adm-form-label">Credentials / Post-nominals</label>
              <input
                type="text"
                placeholder="E.g., BScPT, FCAMPT, CGIMS"
                className="adm-input"
                value={member.title || ""}
                onChange={(e) => setMember({ ...member, title: e.target.value })}
              />
            </div>
          </div>

          <div className="adm-form-group">
            <label className="adm-form-label">Profile Image Path / URL</label>
            <input
              type="text"
              className="adm-input"
              value={member.profileImage || ""}
              onChange={(e) => setMember({ ...member, profileImage: e.target.value })}
            />
          </div>

          <div className="adm-form-group">
            <label className="adm-form-label">Short Summary Bio</label>
            <textarea
              className="adm-textarea"
              style={{ minHeight: 70 }}
              value={member.shortBio || ""}
              onChange={(e) => setMember({ ...member, shortBio: e.target.value })}
            />
          </div>

          <div className="adm-form-group">
            <label className="adm-form-label">Full Clinical Biography</label>
            <textarea
              className="adm-textarea"
              style={{ minHeight: 120 }}
              value={member.fullBio || ""}
              onChange={(e) => setMember({ ...member, fullBio: e.target.value })}
            />
          </div>

          {/* Specialties */}
          <div style={{ background: "#f8fafc", padding: 16, borderRadius: 12, border: "1px solid #e2e8f0" }}>
            <label className="adm-form-label">Specialties & Techniques</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <input
                type="text"
                placeholder="E.g., Dry Needling / IMS, Vestibular Rehab"
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
              {member.specialties?.map((s, idx) => (
                <span key={idx} style={{ background: "#e0f2fe", color: "#0369a1", padding: "4px 10px", borderRadius: 999, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}>
                  {s}
                  <button type="button" onClick={() => removeSpec(idx)} style={{ background: "none", border: "none", cursor: "pointer", color: "#0284c7", fontWeight: 700 }}>✕</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="adm-modal-footer">
          <button type="button" onClick={onClose} className="adm-btn adm-btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={() => onSave(member)} className="adm-btn adm-btn-success">
            💾 Save Practitioner Profile
          </button>
        </div>
      </div>
    </div>
  );
}
