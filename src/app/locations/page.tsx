import React from "react";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { getLocations } from "@/lib/api";

export const metadata = {
  title: "Our Clinic Locations | Calgary Physiotherapy & Rehabilitation",
  description: "Find Nose Creek Physiotherapy Clinic in Calgary. View maps, driving directions, phone numbers, opening hours, and practitioners."
};

export default async function LocationsPage() {
  const locations = await getLocations();

  return (
    <div className="section section-offset">
      <div className="container">
        <Breadcrumbs items={[{ label: "Locations", href: "/locations" }]} />
        
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h1>Clinic Locations</h1>
          <p style={{ color: "var(--text-muted)", maxWidth: "600px", margin: "0 auto" }}>
            Visit our fully equipped modern clinics in Northwest Calgary. We offer convenient hours and free patient parking.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "30px" }}>
          {locations.map((loc) => (
            <div
              key={loc.slug}
              style={{
                backgroundColor: "#fff",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                overflow: "hidden",
                boxShadow: "var(--shadow-sm)",
                display: "flex",
                flexDirection: "column"
              }}
            >
              {/* Map/Image Placeholder Header */}
              <div
                style={{
                  height: "200px",
                  backgroundColor: "var(--bg-offset)",
                  position: "relative"
                }}
              >
                {loc.mapEmbedUrl ? (
                  <iframe
                    src={loc.mapEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    title={`${loc.name} Google Map`}
                  ></iframe>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }}>
                    Map not available
                  </div>
                )}
              </div>

              <div style={{ padding: "24px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                <h2 style={{ fontSize: "1.375rem", margin: "0 0 12px 0", color: "var(--primary)" }}>
                  {loc.name}
                </h2>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.875rem", color: "var(--text-dark)", marginBottom: "20px", flexGrow: 1 }}>
                  <div>
                    <strong>Address: </strong> {loc.address}
                  </div>
                  <div>
                    <strong>Phone: </strong> {loc.phone}
                  </div>
                  <div>
                    <strong>Email: </strong> {loc.email}
                  </div>
                </div>

                <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "16px", display: "flex", gap: "12px" }}>
                  <Link href={`/locations/${loc.slug}`} className="btn btn-outline" style={{ flexGrow: 1, textAlign: "center", fontSize: "0.75rem" }}>
                    Details & Hours
                  </Link>
                  <a href="#booking" className="btn btn-secondary" style={{ flexGrow: 1, textAlign: "center", fontSize: "0.75rem" }}>
                    Book Appointment
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
