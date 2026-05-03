"use client";

import React from "react";

export const Navbar = () => {
  return (
    <nav
      className="bg-deep"
      style={{
        padding: "15px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid var(--glass-border)",
        backdropFilter: "blur(10px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Brand Section */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Logo Icon from your branding */}
        <div
          style={{
            width: "32px",
            height: "32px",
            backgroundColor: "var(--zodiac-orange)",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 10px rgba(255, 127, 0, 0.4)",
          }}
        >
          <span style={{ fontSize: "1rem" }}>🦅</span>
        </div>

        <h1
          style={{
            color: "white",
            margin: 0,
            fontSize: "1.1rem",
            fontWeight: "800",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
          }}
        >
          ZODIAC <span className="text-cyan">HUB</span>
        </h1>
      </div>

      {/* Mobile Action Icons */}
      <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
        {/* Search/Dashboard Icon Toggle */}
        <button
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "none",
            color: "white",
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          🔍
        </button>

        {/* User / Profile Shortcut */}
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "2px solid var(--zodiac-cyan)",
            background: "rgba(0, 255, 255, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.2rem",
          }}
        >
          👤
        </div>
      </div>
    </nav>
  );
};
