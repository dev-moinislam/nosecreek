"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Service } from "@/types/content";
import defaultServicesData from "@/data/services.json";
import ServiceIcon from "@/components/ui/ServiceIcon";
import { getServices } from "@/lib/api";

interface HomeServicesGridProps {
  initialServices?: Service[];
}

export default function HomeServicesGrid({ initialServices }: HomeServicesGridProps) {
  const [services, setServices] = useState<Service[]>(
    initialServices && initialServices.length > 0
      ? initialServices
      : (defaultServicesData as Service[])
  );

  useEffect(() => {
    function sync() {
      try {
        const saved = localStorage.getItem("adm_services");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setServices(parsed);
          }
        }
      } catch {}
    }
    window.addEventListener("servicesUpdated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("servicesUpdated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 22 }}>
      {services.map((svc) => {
        const imageSrc = svc.cardImage || null;
        const hasImage = Boolean(imageSrc && imageSrc.trim() !== "");
        return (
          <Link
            key={svc.id || svc.slug}
            href={`/services/${svc.slug}`}
            style={{ display: "block", textDecoration: "none" }}
          >
            <div style={{
              background: "#fff",
              border: "1px solid #e7edf1",
              borderRadius: 16,
              overflow: "hidden",
              padding: hasImage ? "0 0 24px 0" : 28,
              boxShadow: "0 6px 20px rgba(18,60,80,0.05)",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              transition: "transform 0.2s, box-shadow 0.2s"
            }}>
              {hasImage ? (
                <div style={{ height: 160, overflow: "hidden", position: "relative", backgroundColor: "#f2f8fb", marginBottom: 18 }}>
                  <img
                    src={imageSrc!}
                    alt={svc.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                  <div style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.92)",
                    backdropFilter: "blur(4px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
                  }}>
                    <ServiceIcon type={svc.iconType} color={svc.iconColor || "#1c9fd8"} size={20} />
                  </div>
                </div>
              ) : (
                <div style={{ width: 52, height: 52, borderRadius: 12, background: svc.iconBg || "#e9f5fb", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <ServiceIcon type={svc.iconType} color={svc.iconColor || "#1c9fd8"} size={26} />
                </div>
              )}

              <div style={{ padding: hasImage ? "0 24px" : "0", flexGrow: 1, display: "flex", flexDirection: "column" }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: "#1d2b34" }}>{svc.title}</h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "#5a6570", flexGrow: 1, margin: "0 0 12px 0" }}>{svc.shortDescription}</p>
                <span style={{ display: "inline-block", marginTop: "auto", color: svc.ctaMuted ? "#8a97a1" : "#0e78a8", fontWeight: 700, fontSize: 14 }}>
                  {svc.ctaText || "Learn more →"}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
