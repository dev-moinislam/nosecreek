"use client";

import React, { useState, useEffect } from "react";
import { useRole } from "@/components/admin/RoleGuard";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Location } from "@/types/content";
import locationsData from "@/data/locations.json";

export default function AdminLocationsPage() {
  const { isAdmin } = useRole();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLoc, setEditingLoc] = useState<Location | null>(null);

  const fetchLocations = async () => {
    setLoading(true);
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from("locations").select("*");
        if (!error && data && data.length > 0) {
          setLocations(
            data.map((d: any) => ({
              id: d.id,
              name: d.name,
              slug: d.slug,
              address: d.address,
              phone: d.phone,
              email: d.email,
              openingHours: d.opening_hours || {},
              mapEmbedUrl: d.map_embed_url,
              services: d.services || [],
              teamMembers: d.team_members || [],
              testimonials: d.testimonials || [],
              description: d.description || "",
              images: d.images || [],
              bookingUrl: d.booking_url || "",
              seo: d.seo || {}
            }))
          );
        } else {
          setLocations(locationsData as Location[]);
        }
      } catch {
        setLocations(locationsData as Location[]);
      }
    } else if (typeof window !== "undefined") {
      const local = localStorage.getItem("adm_locations");
      if (local) {
        setLocations(JSON.parse(local));
      } else {
        setLocations(locationsData as Location[]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleSave = async (loc: Location) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from("locations").upsert({
        id: loc.id || `loc-${loc.slug}`,
        name: loc.name,
        slug: loc.slug,
        address: loc.address,
        phone: loc.phone,
        email: loc.email,
        opening_hours: loc.openingHours || {},
        map_embed_url: loc.mapEmbedUrl || null,
        services: loc.services || [],
        team_members: loc.teamMembers || [],
        testimonials: loc.testimonials || [],
        description: loc.description || null,
        images: loc.images || [],
        booking_url: loc.bookingUrl || null,
        seo: loc.seo || {},
        is_published: true
      });
    } else if (typeof window !== "undefined") {
      const updated = locations.map((l) => (l.slug === loc.slug ? loc : l));
      localStorage.setItem("adm_locations", JSON.stringify(updated));
      setLocations(updated);
    }
    fetchLocations();
    setEditingLoc(null);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, fontFamily: "var(--adm-font-display)" }}>
            Clinic Locations Manager
          </h2>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: "2px 0 0 0" }}>
            Manage physical clinic facilities, phone lines, hours, and Google Maps embeds
          </p>
        </div>
      </div>

      <div className="adm-card">
        <div className="adm-table-container">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Clinic Facility</th>
                <th>Physical Address</th>
                <th>Contact</th>
                <th>Direct Booking Link</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: 36, color: "#64748b" }}>
                    Loading locations...
                  </td>
                </tr>
              ) : (
                locations.map((loc) => (
                  <tr key={loc.slug}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{loc.name}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>/locations/{loc.slug}</div>
                    </td>
                    <td>{loc.address}</td>
                    <td>
                      <div>{loc.phone}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{loc.email}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: 12, color: "#0369a1", maxWidth: 200, display: "inline-block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {loc.bookingUrl || "Default Portal"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        onClick={() => setEditingLoc(JSON.parse(JSON.stringify(loc)))}
                        className="adm-btn adm-btn-primary adm-btn-sm"
                      >
                        ✏️ Edit Location
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingLoc && (
        <LocationEditorModal
          location={editingLoc}
          onClose={() => setEditingLoc(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function LocationEditorModal({
  location: initial,
  onClose,
  onSave
}: {
  location: Location;
  onClose: () => void;
  onSave: (l: Location) => void;
}) {
  const [loc, setLoc] = useState<Location>(initial);

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal wide" onClick={(e) => e.stopPropagation()}>
        <div className="adm-modal-header">
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
              Edit Location: {loc.name}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#94a3b8" }}>
            ✕
          </button>
        </div>

        <div className="adm-modal-body">
          <div className="adm-form-group">
            <label className="adm-form-label">Location / Clinic Facility Name</label>
            <input
              type="text"
              className="adm-input"
              value={loc.name}
              onChange={(e) => setLoc({ ...loc, name: e.target.value })}
              required
            />
          </div>

          <div className="adm-form-group">
            <label className="adm-form-label">Physical Address</label>
            <input
              type="text"
              className="adm-input"
              value={loc.address}
              onChange={(e) => setLoc({ ...loc, address: e.target.value })}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="adm-form-group">
              <label className="adm-form-label">Clinic Phone Number</label>
              <input
                type="text"
                className="adm-input"
                value={loc.phone}
                onChange={(e) => setLoc({ ...loc, phone: e.target.value })}
                required
              />
            </div>
            <div className="adm-form-group">
              <label className="adm-form-label">Reception Email</label>
              <input
                type="email"
                className="adm-input"
                value={loc.email}
                onChange={(e) => setLoc({ ...loc, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="adm-form-group">
            <label className="adm-form-label">Direct PracticePerfect Booking URL</label>
            <input
              type="text"
              className="adm-input"
              value={loc.bookingUrl || ""}
              onChange={(e) => setLoc({ ...loc, bookingUrl: e.target.value })}
            />
          </div>

          <div className="adm-form-group">
            <label className="adm-form-label">Google Maps Embed URL</label>
            <input
              type="text"
              className="adm-input"
              value={loc.mapEmbedUrl || ""}
              onChange={(e) => setLoc({ ...loc, mapEmbedUrl: e.target.value })}
            />
          </div>

          <div className="adm-form-group">
            <label className="adm-form-label">Clinic Description</label>
            <textarea
              className="adm-textarea"
              style={{ minHeight: 90 }}
              value={loc.description || ""}
              onChange={(e) => setLoc({ ...loc, description: e.target.value })}
            />
          </div>
        </div>

        <div className="adm-modal-footer">
          <button type="button" onClick={onClose} className="adm-btn adm-btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={() => onSave(loc)} className="adm-btn adm-btn-success">
            💾 Save Location Details
          </button>
        </div>
      </div>
    </div>
  );
}
