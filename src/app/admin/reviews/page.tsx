"use client";

import React, { useState, useEffect } from "react";
import { useRole } from "@/components/admin/RoleGuard";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Testimonial } from "@/types/content";
import defaultTestimonialsData from "@/data/testimonials.json";
import AdminToast from "@/components/admin/AdminToast";
import ConfirmDeleteModal from "@/components/admin/ConfirmDeleteModal";
import AdminImageUploader from "@/components/admin/AdminImageUploader";
import {
  StarIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  CheckIcon,
  XIcon,
  SearchIcon,
  SparklesIcon,
  GlobeIcon
} from "@/components/admin/AdminIcons";

export default function AdminReviewsPage() {
  const { isAdmin, canDelete } = useRole();
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Global Review Bar Metadata
  const [metaInfo, setMetaInfo] = useState({
    rating: "4.9",
    count: "545+ Calgary Reviews",
    title: "Real 5-Star Reviews From Our Calgary Patients",
    subtitle: "See what our patients have to say about their recovery journey at Nose Creek Physiotherapy",
    link: "https://www.nosecreekphysiotherapy.com/reviews/"
  });
  const [savingMeta, setSavingMeta] = useState(false);

  // Edit / Add Modal State
  const [editingReview, setEditingReview] = useState<Testimonial | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; author: string } | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    let currentReviews = defaultTestimonialsData as Testimonial[];

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("testimonials")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          currentReviews = data.map((d: any) => ({
            id: d.id,
            author: d.author,
            text: d.text,
            rating: Number(d.rating) || 5,
            platform: d.platform || "Google",
            date: d.date || "Verified Patient",
            avatar: d.avatar || "",
            verified: true
          }));
        }

        const { data: settingsData } = await supabase
          .from("site_settings")
          .select("google_rating, google_review_count, reviews_title, reviews_subtitle, google_reviews_url")
          .eq("id", "main")
          .single();

        if (settingsData) {
          setMetaInfo({
            rating: settingsData.google_rating || "4.9",
            count: settingsData.google_review_count || "545+ Calgary Reviews",
            title: settingsData.reviews_title || "Real 5-Star Reviews From Our Calgary Patients",
            subtitle: settingsData.reviews_subtitle || "See what our patients have to say about their recovery journey at Nose Creek Physiotherapy",
            link: settingsData.google_reviews_url || "https://www.nosecreekphysiotherapy.com/reviews/"
          });
        }
      } catch (e) {
        console.warn("Supabase fetch error, using local fallback", e);
      }
    }

    setReviews(currentReviews);
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSaveMeta = async () => {
    setSavingMeta(true);
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("site_settings").upsert({
          id: "main",
          google_rating: metaInfo.rating,
          google_review_count: metaInfo.count,
          reviews_title: metaInfo.title,
          reviews_subtitle: metaInfo.subtitle,
          google_reviews_url: metaInfo.link,
          updated_at: new Date().toISOString()
        });
      } catch (e) {
        console.warn("Saving meta failed:", e);
      }
    }

    setToastMessage("Google Review global header settings saved successfully!");
    setSavingMeta(false);
  };

  const handleSaveReview = async (review: Testimonial) => {
    let updated: Testimonial[];
    if (isCreating) {
      updated = [review, ...reviews];
    } else {
      updated = reviews.map((r) => (r.id === review.id ? review : r));
    }

    setReviews(updated);
    setEditingReview(null);
    setIsCreating(false);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("testimonials").upsert({
          id: review.id,
          author: review.author,
          text: review.text,
          rating: review.rating,
          platform: review.platform || "Google",
          date: review.date,
          avatar: review.avatar || null,
          is_published: true,
          updated_at: new Date().toISOString()
        });
      } catch (e) {
        console.warn("Supabase review upsert error:", e);
      }
    }

    setToastMessage(isCreating ? `Review from "${review.author}" added!` : `Review from "${review.author}" updated!`);
  };

  const handleDelete = async (id: string) => {
    setReviews(reviews.filter((r) => r.id !== id));
    setDeleteTarget(null);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("testimonials").delete().eq("id", id);
      } catch (e) {
        console.warn("Supabase review delete error:", e);
      }
    }

    setToastMessage("Review removed successfully.");
  };

  const handleSeedDefaults = async () => {
    if (!isAdmin) {
      alert("Only Master Admin can seed default reviews.");
      return;
    }

    if (isSupabaseConfigured && supabase) {
      for (const rev of defaultTestimonialsData) {
        await supabase.from("testimonials").upsert({
          id: rev.id,
          author: rev.author,
          text: rev.text,
          rating: rev.rating,
          platform: rev.platform || "Google",
          date: rev.date,
          avatar: rev.avatar || null,
          is_published: true,
          updated_at: new Date().toISOString()
        });
      }
    }

    setReviews(defaultTestimonialsData as Testimonial[]);
    setToastMessage("Standard 5-Star Calgary Reviews synced to Supabase database!");
  };

  const filteredReviews = reviews.filter(
    (r) =>
      r.author.toLowerCase().includes(search.toLowerCase()) ||
      r.text.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="adm-page" style={{ padding: "28px 32px", maxWidth: 1300, margin: "0 auto" }}>
      <AdminToast message={toastMessage} onClose={() => setToastMessage(null)} />

      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        itemName={deleteTarget?.author || "Review"}
        itemType="Review"
        onConfirm={() => {
          if (deleteTarget) handleDelete(deleteTarget.id);
        }}
        onClose={() => setDeleteTarget(null)}
      />

      {/* Header Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "#f59e0b" }}>⭐</span>
            <span>Real 5-Star Reviews &amp; Testimonials</span>
          </h1>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: 0 }}>
            Manage Google Maps reviews and patient testimonials displayed across the website in the global carousel.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={handleSeedDefaults}
            className="adm-btn adm-btn-secondary"
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}
            title="Restore default verified Google reviews"
          >
            <SparklesIcon size={14} style={{ color: "#0284c7" }} />
            <span>Sync Google Seed Data</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingReview({
                id: `review-${Date.now()}`,
                author: "",
                text: "",
                rating: 5,
                platform: "Google",
                date: "Recent Patient",
                avatar: "",
                verified: true
              });
              setIsCreating(true);
            }}
            className="adm-btn adm-btn-primary"
            style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 700 }}
          >
            <PlusIcon size={16} />
            <span>Add Patient Review</span>
          </button>
        </div>
      </div>

      {/* Card 1: Google Rating & Global Banner Settings */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 22, marginBottom: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", margin: "0 0 14px 0", display: "flex", alignItems: "center", gap: 8 }}>
          <GlobeIcon size={16} style={{ color: "var(--adm-primary)" }} />
          <span>Global Review Carousel Header &amp; Google Badge</span>
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 14 }}>
          <div className="adm-form-group" style={{ margin: 0 }}>
            <label className="adm-form-label">Google Rating Badge Score</label>
            <input
              type="text"
              className="adm-input"
              value={metaInfo.rating}
              onChange={(e) => setMetaInfo({ ...metaInfo, rating: e.target.value })}
              placeholder="4.9"
            />
          </div>

          <div className="adm-form-group" style={{ margin: 0 }}>
            <label className="adm-form-label">Review Count Display</label>
            <input
              type="text"
              className="adm-input"
              value={metaInfo.count}
              onChange={(e) => setMetaInfo({ ...metaInfo, count: e.target.value })}
              placeholder="545+ Calgary Reviews"
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 14 }}>
          <div className="adm-form-group" style={{ margin: 0 }}>
            <label className="adm-form-label">Section H2 Headline</label>
            <input
              type="text"
              className="adm-input"
              value={metaInfo.title}
              onChange={(e) => setMetaInfo({ ...metaInfo, title: e.target.value })}
              placeholder="Real 5-Star Reviews From Our Calgary Patients"
            />
          </div>

          <div className="adm-form-group" style={{ margin: 0 }}>
            <label className="adm-form-label">Google Reviews Full URL</label>
            <input
              type="text"
              className="adm-input"
              value={metaInfo.link}
              onChange={(e) => setMetaInfo({ ...metaInfo, link: e.target.value })}
              placeholder="https://www.nosecreekphysiotherapy.com/reviews/"
            />
          </div>
        </div>

        <div className="adm-form-group" style={{ margin: "0 0 16px 0" }}>
          <label className="adm-form-label">Section Subtitle / Narrative</label>
          <input
            type="text"
            className="adm-input"
            value={metaInfo.subtitle}
            onChange={(e) => setMetaInfo({ ...metaInfo, subtitle: e.target.value })}
            placeholder="See what our patients have to say about their recovery journey at Nose Creek Physiotherapy"
          />
        </div>

        <button
          type="button"
          onClick={handleSaveMeta}
          disabled={savingMeta}
          className="adm-btn adm-btn-primary adm-btn-sm"
          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <CheckIcon size={14} />
          <span>{savingMeta ? "Saving..." : "Save Global Header"}</span>
        </button>
      </div>

      {/* Card 2: Reviews List Table */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
              Published Patient Reviews ({reviews.length})
            </h3>
          </div>

          <div style={{ position: "relative", minWidth: 260 }}>
            <SearchIcon size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by author or review text..."
              style={{
                width: "100%",
                padding: "7px 12px 7px 34px",
                borderRadius: 8,
                border: "1px solid #cbd5e1",
                fontSize: 13,
                outline: "none"
              }}
            />
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="adm-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#64748b" }}>
                <th style={{ padding: "12px 18px" }}>Patient / Author</th>
                <th style={{ padding: "12px 18px" }}>Rating</th>
                <th style={{ padding: "12px 18px" }}>Date &amp; Source</th>
                <th style={{ padding: "12px 18px", width: "45%" }}>Review Quote</th>
                <th style={{ padding: "12px 18px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: 36, color: "#64748b" }}>
                    Loading patient reviews...
                  </td>
                </tr>
              ) : filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: 36, color: "#64748b" }}>
                    No reviews found.
                  </td>
                </tr>
              ) : (
                filteredReviews.map((rev) => (
                  <tr key={rev.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            overflow: "hidden",
                            background: "linear-gradient(135deg, #1c9fd8, #0e78a8)",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: 14,
                            flexShrink: 0
                          }}
                        >
                          {rev.avatar ? (
                            <img src={rev.avatar} alt={rev.author} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            rev.author.charAt(0)
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13.5, color: "#0f172a" }}>{rev.author}</div>
                          <span style={{ fontSize: 11.5, color: "#16a34a", fontWeight: 600 }}>✓ Verified</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", gap: 2, color: "#f59e0b", fontSize: 14 }}>
                        {[...Array(rev.rating || 5)].map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ fontSize: 12.5, color: "#334155", fontWeight: 600 }}>{rev.platform || "Google"}</div>
                      <div style={{ fontSize: 11.5, color: "#94a3b8" }}>{rev.date || "Recent"}</div>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <p style={{ margin: 0, fontSize: 13, color: "#475569", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        &ldquo;{rev.text}&rdquo;
                      </p>
                    </td>
                    <td style={{ padding: "14px 18px", textAlign: "right", whiteSpace: "nowrap" }}>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingReview(JSON.parse(JSON.stringify(rev)));
                          setIsCreating(false);
                        }}
                        className="adm-btn adm-btn-primary adm-btn-sm"
                        style={{ marginRight: 6, display: "inline-flex", alignItems: "center", gap: 4 }}
                      >
                        <EditIcon size={13} />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        disabled={!canDelete}
                        onClick={() => setDeleteTarget({ id: rev.id, author: rev.author })}
                        className="adm-btn adm-btn-secondary adm-btn-sm"
                        style={{ color: "#dc2626", padding: "5px 8px" }}
                        title="Delete Review"
                      >
                        <TrashIcon size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal Editor */}
      {editingReview && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(15,23,42,0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 16,
              width: "100%",
              maxWidth: 620,
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
              display: "flex",
              flexDirection: "column"
            }}
          >
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc" }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
                {isCreating ? "Add New Patient Review" : `Edit Review: ${editingReview.author}`}
              </h3>
              <button
                type="button"
                onClick={() => setEditingReview(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}
              >
                <XIcon size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveReview(editingReview);
              }}
              style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="adm-form-group" style={{ margin: 0 }}>
                  <label className="adm-form-label">Patient Name *</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={editingReview.author}
                    onChange={(e) => setEditingReview({ ...editingReview, author: e.target.value })}
                    placeholder="e.g. David Miller"
                    required
                  />
                </div>

                <div className="adm-form-group" style={{ margin: 0 }}>
                  <label className="adm-form-label">Star Rating</label>
                  <select
                    className="adm-select"
                    value={editingReview.rating || 5}
                    onChange={(e) => setEditingReview({ ...editingReview, rating: Number(e.target.value) })}
                  >
                    <option value={5}>★★★★★ (5.0 Stars)</option>
                    <option value={4}>★★★★☆ (4.0 Stars)</option>
                    <option value={3}>★★★☆☆ (3.0 Stars)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="adm-form-group" style={{ margin: 0 }}>
                  <label className="adm-form-label">Review Date</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={editingReview.date || ""}
                    onChange={(e) => setEditingReview({ ...editingReview, date: e.target.value })}
                    placeholder="e.g. 2 weeks ago or August 2026"
                  />
                </div>

                <div className="adm-form-group" style={{ margin: 0 }}>
                  <label className="adm-form-label">Review Platform</label>
                  <select
                    className="adm-select"
                    value={editingReview.platform || "Google"}
                    onChange={(e) => setEditingReview({ ...editingReview, platform: e.target.value })}
                  >
                    <option value="Google">Google Maps Review</option>
                    <option value="RateMDs">RateMDs</option>
                    <option value="Direct">Direct Clinic Feedback</option>
                  </select>
                </div>
              </div>

              <AdminImageUploader
                label="Author Photo / Avatar (Optional)"
                value={editingReview.avatar || ""}
                onChange={(url) => setEditingReview({ ...editingReview, avatar: url })}
                folder="reviews"
                placeholder="Leave blank for automatic initials avatar"
                aspectRatioNote="Square 1:1 recommended"
              />

              <div className="adm-form-group" style={{ margin: 0 }}>
                <label className="adm-form-label">Review Testimonial Text *</label>
                <textarea
                  className="adm-textarea"
                  style={{ minHeight: 110 }}
                  value={editingReview.text}
                  onChange={(e) => setEditingReview({ ...editingReview, text: e.target.value })}
                  placeholder="Paste or write the patient's exact 5-star review here..."
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setEditingReview(null)}
                  className="adm-btn adm-btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="adm-btn adm-btn-primary">
                  Save Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
