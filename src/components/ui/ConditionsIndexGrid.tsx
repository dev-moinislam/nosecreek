"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Condition } from "@/types/content";
import defaultConditionsData from "@/data/conditions.json";
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
    function sync() {
      try {
        const saved = localStorage.getItem("adm_conditions");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setConditions(parsed);
          }
        }
      } catch {}
    }
    sync();
    window.addEventListener("conditionsUpdated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("conditionsUpdated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
      {conditions.map((condition) => {
        const hasImage = Boolean(condition.heroImage && condition.heroImage.trim() !== "");
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
            {hasImage && (
              <div style={{ height: 160, overflow: "hidden", position: "relative", backgroundColor: "#f2f8fb", marginBottom: 18 }}>
                <img
                  src={condition.heroImage!}
                  alt={condition.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                {condition.category && (
                  <div style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    background: "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(4px)",
                    padding: "4px 10px",
                    borderRadius: 999,
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: "#0e78a8"
                  }}>
                    {condition.category}
                  </div>
                )}
              </div>
            )}

            <div style={{ padding: hasImage ? "0 24px" : "0", flexGrow: 1, display: "flex", flexDirection: "column" }}>
              {!hasImage && condition.category && (
                <div style={{
                  display: "inline-block",
                  background: "#f2f8fb",
                  color: "#0e78a8",
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  padding: "4px 10px",
                  borderRadius: 6,
                  marginBottom: 14,
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
