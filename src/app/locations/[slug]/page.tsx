import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import SchemaMarkup from "@/components/seo/SchemaMarkup";
import {
  getLocationBySlug,
  getServices,
  getTeamMembers
} from "@/lib/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;

export async function generateStaticParams() {
  const { getLocations } = await import("@/lib/api");
  const locations = await getLocations();
  return locations.map((loc) => ({
    slug: loc.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const location = await getLocationBySlug(slug);

  if (!location) {
    return {
      title: "Location Not Found"
    };
  }

  return {
    title: location.seo.title || `${location.name} | Calgary Clinic`,
    description: location.seo.description,
    openGraph: {
      title: location.seo.ogTitle || location.name,
      description: location.seo.ogDescription || location.description
    }
  };
}

export default async function LocationDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const location = await getLocationBySlug(slug);

  if (!location) {
    notFound();
  }

  // Cross reference services and team members
  const allServices = await getServices();
  const allTeam = await getTeamMembers();

  const localServices = allServices.filter((s) =>
    location.services.includes(s.id)
  );

  const localTeam = allTeam.filter((member) =>
    location.teamMembers.includes(member.slug)
  );

  return (
    <div className="section section-offset">
      <div className="container">
        <Breadcrumbs
          items={[
            { label: "Locations", href: "/locations" },
            { label: location.name }
          ]}
        />

        <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr", gap: "40px", alignItems: "start" }}>
          
          {/* Left Column: Clinic details & Map */}
          <div>
            <h1 style={{ color: "var(--secondary)", fontWeight: "300", fontSize: "2.5rem", marginBottom: "24px" }}>
              {location.name}
            </h1>
            
            <div style={{ backgroundColor: "#fff", padding: "40px", borderRadius: "8px", boxShadow: "var(--shadow-sm)", marginBottom: "30px" }}>
              <p style={{ fontSize: "1.125rem", lineHeight: "1.6", marginBottom: "24px", color: "var(--text-dark)" }}>
                {location.description}
              </p>

              {/* Map embed */}
              {location.mapEmbedUrl && (
                <div style={{ height: "400px", width: "100%", borderRadius: "6px", overflow: "hidden", marginBottom: "24px", border: "1px solid var(--border-color)" }}>
                  <iframe
                    src={location.mapEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    title={`${location.name} Map`}
                  ></iframe>
                </div>
              )}
            </div>

            {/* Local Team */}
            {localTeam.length > 0 && (
              <div style={{ backgroundColor: "#fff", padding: "40px", borderRadius: "8px", boxShadow: "var(--shadow-sm)", marginBottom: "30px" }}>
                <h2 style={{ fontSize: "1.5rem", marginBottom: "24px" }}>Practitioners at this Location</h2>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  {localTeam.map((member) => (
                    <Link
                      key={member.slug}
                      href={`/team/${member.slug}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        padding: "16px",
                        borderRadius: "6px",
                        border: "1px solid var(--border-color)"
                      }}
                    >
                      <div
                        style={{
                          width: "50px",
                          height: "50px",
                          borderRadius: "50%",
                          backgroundColor: "var(--accent)",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.125rem",
                          fontWeight: "bold",
                          flexShrink: 0
                        }}
                      >
                        {member.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <strong style={{ display: "block" }}>{member.name}</strong>
                        <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{member.role}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Contact details & Hours */}
          <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
            
            {/* Booking Box */}
            <div style={{ backgroundColor: "var(--primary)", color: "#fff", padding: "30px", borderRadius: "8px", boxShadow: "var(--shadow-sm)" }}>
              <h3 style={{ color: "#fff", fontSize: "1.25rem", marginBottom: "12px" }}>Schedule a Visit</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.875rem", opacity: 0.9, marginBottom: "20px" }}>
                <div>
                  <strong>Phone:</strong> {location.phone}
                </div>
                <div>
                  <strong>Email:</strong> {location.email}
                </div>
                <div>
                  <strong>Address:</strong> {location.address}
                </div>
              </div>
              <a href="#booking" className="btn btn-secondary" style={{ width: "100%", textAlign: "center" }}>
                Book Appointment
              </a>
            </div>

            {/* Opening Hours */}
            <div style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "8px", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
              <h3 style={{ fontSize: "1.125rem", marginBottom: "16px", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
                Hours of Operation
              </h3>
              
              <ul style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.875rem" }}>
                <li style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Mon-Fri:</span>
                  <span style={{ fontWeight: "600" }}>{location.openingHours.monday}</span>
                </li>
                <li style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Saturday:</span>
                  <span style={{ fontWeight: "600" }}>{location.openingHours.saturday}</span>
                </li>
                <li style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Sunday:</span>
                  <span style={{ fontWeight: "600" }}>{location.openingHours.sunday}</span>
                </li>
              </ul>
            </div>

            {/* Offered Services */}
            {localServices.length > 0 && (
              <div style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "8px", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
                <h3 style={{ fontSize: "1.125rem", marginBottom: "16px" }}>Services Mapped</h3>
                <ul style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {localServices.map((service) => (
                    <li key={service.slug}>
                      <Link href={`/services/${service.slug}`} style={{ color: "var(--secondary)", fontSize: "0.9375rem" }}>
                        {service.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

        </div>
      </div>
      <SchemaMarkup type="MedicalBusiness" data={{
        name: location.name,
        telephone: location.phone,
        email: location.email,
        address: {
          street: location.address.split(",")[0],
          city: "Calgary",
          province: "AB",
          postalCode: location.address.match(/[T]\d[A-Z]\s\d[A-Z]\d/) || "T3K 5N4"
        }
      }} />
    </div>
  );
}
