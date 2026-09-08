import React from "react";

export default function RootLoading() {
  return (
    <div
      style={{
        minHeight: "75vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        background: "linear-gradient(180deg, rgba(242, 248, 251, 0.4) 0%, rgba(255, 255, 255, 1) 100%)",
        color: "#12303d",
        fontFamily: "'Poppins', 'Open Sans', system-ui, sans-serif"
      }}
    >
      <div style={{ position: "relative", width: 84, height: 84, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Outer pulsating subtle glow */}
        <div
          style={{
            position: "absolute",
            inset: -8,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(28, 159, 216, 0.18) 0%, rgba(111, 175, 28, 0.08) 60%, transparent 80%)",
            animation: "ncPulse 2s ease-in-out infinite"
          }}
        />

        {/* Spinning Gradient Ring */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "3.5px solid transparent",
            borderTopColor: "var(--nc-blue, #1c9fd8)",
            borderRightColor: "var(--nc-green, #6faf1c)",
            animation: "ncSpin 0.9s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite"
          }}
        />

        {/* Secondary counter-spinning light ring */}
        <div
          style={{
            position: "absolute",
            inset: 8,
            borderRadius: "50%",
            border: "2px dashed rgba(28, 159, 216, 0.25)",
            animation: "ncSpinReverse 3s linear infinite"
          }}
        />

        {/* Center Clinical Logo Icon Badge */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "#ffffff",
            boxShadow: "0 4px 16px rgba(18, 48, 61, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--nc-blue, #1c9fd8)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
      </div>

      <div style={{ marginTop: 26, textAlign: "center" }}>
        <p
          style={{
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: "-0.2px",
            color: "#12303d",
            marginBottom: 6
          }}
        >
          Loading Clinical Care...
        </p>
        <div
          style={{
            fontSize: 12.5,
            color: "#5a6570",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: "var(--nc-green, #6faf1c)",
              animation: "ncDotBlink 1.4s infinite"
            }}
          />
          <span>Nose Creek Physiotherapy</span>
        </div>
      </div>
    </div>
  );
}
