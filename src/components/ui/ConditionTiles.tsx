"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Condition } from "@/types/content";
import defaultConditionsData from "@/data/conditions.json";
import { getConditions } from "@/lib/api";

interface ConditionTilesProps {
  conditions?: Condition[];
}

export default function ConditionTiles({ conditions }: ConditionTilesProps) {
  const [displayConditions, setDisplayConditions] = useState<Condition[]>(
    conditions && conditions.length > 0
      ? conditions
      : (defaultConditionsData as Condition[])
  );

  useEffect(() => {
    function sync(isBackgroundFetch = false) {
      try {
        const saved = localStorage.getItem("adm_conditions");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setDisplayConditions(parsed);
            return;
          }
        }
        if (isBackgroundFetch || !conditions || conditions.length === 0) {
          fetch("/api/content?type=conditions", { cache: "no-store" })
            .then((r) => r.json())
            .then((list) => {
              if (Array.isArray(list)) setDisplayConditions(list);
            })
            .catch(() => {});
        }
      } catch {}
    }
    sync(false);
    const handleUpdate = () => sync(true);
    window.addEventListener("conditionsUpdated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("conditionsUpdated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [conditions]);

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
