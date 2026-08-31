"use client";
import React from "react";
import Link from "next/link";
import { Condition } from "@/types/content";
import defaultConditionsData from "@/data/conditions.json";

interface ConditionTilesProps {
  conditions?: Condition[];
}

export default function ConditionTiles({ conditions }: ConditionTilesProps) {
  const displayConditions: Condition[] =
    conditions && conditions.length > 0
      ? conditions
      : (defaultConditionsData as Condition[]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16 }}>
      {displayConditions.map((c) => (
        <Link
          key={c.slug || c.id || c.name}
          href={`/conditions/${c.slug}`}
          style={{
            background: "#fff",
            borderRadius: 14,
            padding: "24px 20px",
            textAlign: "center",
            border: "1px solid #e2ebf0",
            fontFamily: "'Poppins',sans-serif",
            fontWeight: 700,
            color: "#1d2b34",
            display: "block",
            textDecoration: "none",
            boxShadow: "0 4px 12px rgba(18,60,80,0.04)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#1c9fd8";
            e.currentTarget.style.color = "#fff";
            e.currentTarget.style.borderColor = "#1c9fd8";
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.boxShadow = "0 10px 24px rgba(28,159,216,0.22)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#fff";
            e.currentTarget.style.color = "#1d2b34";
            e.currentTarget.style.borderColor = "#e2ebf0";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(18,60,80,0.04)";
          }}
        >
          {c.name}
        </Link>
      ))}
    </div>
  );
}
