import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Page Not Found | Nose Creek Physiotherapy",
  description: "Oops! We can't find the page you are looking for. Return to the Nose Creek Physiotherapy homepage to access physiotherapy and rehabilitation services."
};

export default function NotFound() {
  return (
    <div className="section section-offset" style={{ minHeight: "60vh", display: "flex", alignItems: "center" }}>
      <div className="container" style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "5rem", color: "var(--secondary)", fontWeight: "100", marginBottom: "10px" }}>
          404
        </h1>
        <h2 style={{ fontSize: "2rem", marginBottom: "20px" }}>Page Not Found</h2>
        <p style={{ color: "var(--text-muted)", maxWidth: "500px", margin: "0 auto 30px auto", fontSize: "1.125rem" }}>
          We could not find the page you are looking for. It may have been moved, renamed, or is temporarily unavailable.
        </p>
        <Link href="/" className="btn btn-secondary">
          Return Home
        </Link>
      </div>
    </div>
  );
}
