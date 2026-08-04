"use client";
import Link from "next/link";
import { useState } from "react";

const LINKS = [
  { href: "/tools", label: "Tools" },
  { href: "/api-docs", label: "API" },
];

export default function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(7,6,10,0.82)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid var(--border-line)",
      }}
    >
      <div
        className="container"
        style={{
          height: 68,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <LightningMark />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 19,
              letterSpacing: "0.5px",
              background: "linear-gradient(120deg, var(--gold-bright), var(--gold))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            ZodiacTools
          </span>
        </Link>

        <nav style={{ display: "flex", gap: 30, alignItems: "center" }}>
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--text-primary)",
                letterSpacing: "0.3px",
              }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

function LightningMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <defs>
        <linearGradient id="boltGrad" x1="0" y1="0" x2="26" y2="26">
          <stop offset="0%" stopColor="#ffd670" />
          <stop offset="55%" stopColor="#e8b84b" />
          <stop offset="100%" stopColor="#7c5cff" />
        </linearGradient>
      </defs>
      <path
        d="M14.5 1L4 15h6.5l-2 10L21 11h-6.5L16.5 1H14.5z"
        fill="url(#boltGrad)"
      />
    </svg>
  );
}
