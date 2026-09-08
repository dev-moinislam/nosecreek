"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Condition } from "@/types/content";
import defaultConditionsData from "@/data/conditions.json";
import ServiceIcon from "@/components/ui/ServiceIcon";
import { getConditions } from "@/lib/api";

interface ConditionsIndexGridProps {
  initialConditions?: Condition[];
}

export default function ConditionsIndexGrid({ initialConditions }: ConditionsIndexGridProps) {
  const [conditions, setConditions] = useState<Condition[]>(
    initialConditions && initialConditions.length > 0
      ? initialConditions
      : (defaultConditionsData as Condition[])
  );

  useEffect(() => {
    let isMounted = true;

    async function syncConditions() {
      try {
        const fresh = await getConditions();
        let list = Array.isArray(fresh) && fresh.length > 0 ? fresh : (initialConditions || (defaultConditionsData as Condition[]));

        if (typeof window !== "undefined") {
          const saved = localStorage.getItem("adm_conditions");
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed)) {
                list = parsed;
              }
            } catch {}
          }
        }

        if (isMounted) {
          setConditions(list);
        }
      } catch (err) {
        console.warn("Failed to sync conditions in ConditionsIndexGrid", err);
      }
    }

    syncConditions();
    window.addEventListener("conditionsUpdated", syncConditions);
    window.addEventListener("storage", syncConditions);
    return () => {
      isMounted = false;
      window.removeEventListener("conditionsUpdated", syncConditions);
      window.removeEventListener("storage", syncConditions);
    };
  }, [initialConditions]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
      {conditions.map((condition) => {
        const imageSrc = (condition.cardImage && condition.cardImage.trim() !== "") ? condition.cardImage : null;
        const hasImage = Boolean(imageSrc);
        const iconType = condition.iconType || "activity";
        const iconBg = condition.iconBg || "#f2f8fb";
        const iconColor = condition.iconColor || "#0e78a8";

        return (
          <div
            key={condition.slug || condition.id}
            style={{
              background: "#fff",
              border: "1px solid #e7edf1",
              borderRadius: 18,
              padding: hasImage ? "0 0 24px 0" : 28,
              overflow: "hidden",
              boxShadow: "0 6px 20px rgba(18,60,80,0.06)",
              display: "flex",
              flexDirection: "column",
              transition: "transform 0.2s, box-shadow 0.2s"
            }}
          >
            {hasImage ? (
              <div style={{ height: 160, overflow: "hidden", position: "relative", backgroundColor: "#f2f8fb", marginBottom: 18 }}>
                <img
                  src={imageSrc!}
                  alt={condition.cardImageAlt || condition.seo?.cardImageAlt || condition.heroImageAlt || condition.seo?.heroImageAlt || condition.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <div style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.92)",
                  backdropFilter: "blur(4px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
                }}>
                  <ServiceIcon type={iconType} color={iconColor} size={20} />
                </div>
              </div>
            ) : (
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20
              }}>
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: iconBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <ServiceIcon type={iconType} color={iconColor} size={26} />
                </div>
                {condition.category && (
                  <div style={{
                    background: "#f2f8fb",
                    color: "#0e78a8",
                    fontSize: 11.5,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontFamily: "'Poppins',sans-serif"
                  }}>
                    {condition.category}
                  </div>
                )}
              </div>
            )}

            <div style={{ padding: hasImage ? "0 24px" : "0", flexGrow: 1, display: "flex", flexDirection: "column" }}>
              {hasImage && condition.category && (
                <div style={{
                  display: "inline-block",
                  background: "#f2f8fb",
                  color: "#0e78a8",
                  fontSize: 11.5,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  padding: "3px 8px",
                  borderRadius: 6,
                  marginBottom: 10,
                  width: "fit-content",
                  fontFamily: "'Poppins',sans-serif"
                }}>
                  {condition.category}
                </div>
              )}

              <h3 style={{ fontSize: 21, fontWeight: 700, marginBottom: 10, color: "#1d2b34", lineHeight: 1.25 }}>
                <Link href={`/conditions/${condition.slug}`} style={{ color: "#1d2b34", textDecoration: "none" }}>
                  {condition.name}
                </Link>
              </h3>

              <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "#5a6570", flexGrow: 1, marginBottom: 20 }}>
                {condition.shortDescription || (condition.description ? condition.description.substring(0, 140) + "..." : "")}
              </p>

              <div style={{ borderTop: "1px solid #f0f4f7", paddingTop: 14, marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Link
                  href={`/conditions/${condition.slug}`}
                  style={{
                    color: "#0e78a8",
                    fontWeight: 700,
                    fontSize: 14.5,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  View treatment plan <span>&rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
