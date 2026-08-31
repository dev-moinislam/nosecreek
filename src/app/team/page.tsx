import React from "react";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { getTeamMembers } from "@/lib/api";

export const metadata = {
  title: "Meet Our Team | Nose Creek Physiotherapy Calgary",
  description: "Get to know the highly qualified physiotherapists, chiropractors, and massage therapists at Nose Creek Physiotherapy in Calgary."
};

export default async function TeamPage() {
  const team = await getTeamMembers();

  return (
    <div className="section section-offset" style={{ padding: "60px 0" }}>
      <div className="container">
        <Breadcrumbs items={[{ label: "Our Team", href: "/team" }]} />
        
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, color: "#1c9fd8", letterSpacing: "1.5px", fontSize: 13, textTransform: "uppercase", marginBottom: 12 }}>
            Our Practitioners
          </div>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800 }}>Meet Our Team</h1>
          <p style={{ color: "#5a6570", maxWidth: "600px", margin: "12px auto 0", fontSize: 16 }}>
            Our multidisciplinary team of licensed physiotherapists, chiropractors, and massage therapists work together to provide complete recovery solutions.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "24px" }}>
          {team.map((member) => {
            const linkHref = `/team/${member.slug}`;
            return (
              <div
                key={member.id || member.slug}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "14px",
                  border: "1px solid #e7edf1",
                  overflow: "hidden",
                  boxShadow: "0 6px 20px rgba(18,60,80,0.06)",
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                {/* Visual Avatar header */}
                <div
                  style={{
                    aspectRatio: "3/4",
                    backgroundColor: "#eef3f6",
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={member.profileImage}
                    alt={member.name}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
                  />
                </div>

                <div style={{ padding: "20px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                  <span
                    style={{
                      color: "#6faf1c",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: "4px"
                    }}
                  >
                    {member.role}
                  </span>
                  <h2 style={{ fontSize: "1.2rem", margin: "0 0 4px 0", color: "#1d2b34", fontWeight: 700 }}>
                    {member.name}
                  </h2>
                  {member.title && (
                    <span style={{ fontSize: "0.8125rem", color: "#5a6570", marginBottom: "12px", display: "block" }}>
                      {member.title}
                    </span>
                  )}
                  {member.shortBio && (
                    <p style={{ fontSize: "0.875rem", color: "#48535c", lineHeight: "1.5", marginBottom: "16px", flexGrow: 1 }}>
                      {member.shortBio}
                    </p>
                  )}
                  
                  <div style={{ borderTop: "1px solid #e7edf1", paddingTop: "14px", marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Link href={linkHref} style={{ color: "#0e78a8", fontWeight: 700, fontSize: "0.875rem" }}>
                      View Bio &rarr;
                    </Link>
                    <a
                      href="https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: "#6faf1c",
                        color: "#fff",
                        padding: "6px 14px",
                        borderRadius: "6px",
                        fontWeight: 700,
                        fontSize: "0.8125rem"
                      }}
                    >
                      Book
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
