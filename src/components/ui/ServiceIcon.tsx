import React from "react";

interface ServiceIconProps {
  type?: string;
  color?: string;
  size?: number;
}

export default function ServiceIcon({ type = "heart-pulse", color = "#1c9fd8", size = 26 }: ServiceIconProps) {
  switch (type) {
    case "sparkles":
    case "massage":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 21s-6-4.35-9-8.5C1.5 10 2 6.5 5 5.5S10 7 12 9c2-2 4-4.5 7-3.5s3.5 4.5 2 7c-3 4.15-9 8.5-9 8.5z" />
        </svg>
      );
    case "zap":
    case "shockwave":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case "needle":
    case "acupuncture":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="20" x2="20" y2="4" />
          <path d="M14 4h6v6" />
          <circle cx="7" cy="17" r="2" />
        </svg>
      );
    case "footprints":
    case "orthotics":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 16c0-3 1-5 4-5s3 2 6 2 4-1 4 2v2a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z" />
          <path d="M8 11V5a2 2 0 0 1 4 0" />
        </svg>
      );
    case "shield":
    case "bracing":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 3v5l-2 3 2 3v7" />
          <path d="M15 3v5l2 3-2 3v7" />
          <line x1="9" y1="11" x2="15" y2="11" />
        </svg>
      );
    case "user-check":
    case "pelvic":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4 3.5-6 8-6s8 2 8 6" />
        </svg>
      );
    case "heart-pulse":
    case "physio":
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      );
  }
}
