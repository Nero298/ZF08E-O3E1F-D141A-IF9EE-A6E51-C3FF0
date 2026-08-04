import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "ZodiacTools — Lua/Luau Obfuscation Platform",
  description:
    "ZodiacTools is a Lua/Luau obfuscation and deobfuscation platform: obfuscators, deobfuscators, beautifiers, and detectors, all in one place.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800&family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <NavBar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border-line)",
        marginTop: 80,
        padding: "36px 0",
      }}
    >
      <div className="container" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 15, letterSpacing: 1, color: "var(--gold)" }}>
          ZODIACTOOLS
        </div>
        <div style={{ fontSize: 13, color: "var(--text-dim)" }}>
          Built on the LeakD public API · IronVeil Mod &amp; Clyde engines run in-house
        </div>
      </div>
    </footer>
  );
}
