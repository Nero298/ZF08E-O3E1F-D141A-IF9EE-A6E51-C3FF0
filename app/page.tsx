import Link from "next/link";

const CATEGORIES = [
  {
    slug: "obfuscator",
    title: "Obfuscator",
    desc: "Protect your Luau source with VM virtualization, control-flow scrambling, and string encoding.",
    tools: ["ZodiacObfuscator", "ClydeObfuscator", "IronVeil Mod"],
  },
  {
    slug: "deobfuscator",
    title: "Deobfuscator",
    desc: "Reverse common obfuscation schemes back into readable Luau.",
    tools: ["MoonSec V3", "Prometheus", "IronBrew2", "IronVeil", "Hercules"],
  },
  {
    slug: "beautify",
    title: "Beautify",
    desc: "Reformat cramped or minified Lua into clean, indented source.",
    tools: ["Beautifier"],
  },
  {
    slug: "detect",
    title: "Detect",
    desc: "Identify which obfuscator produced a given script before you deobfuscate it.",
    tools: ["Obfuscator Detector"],
  },
];

export default function Home() {
  return (
    <div>
      <section style={{ padding: "96px 0 72px", position: "relative", overflow: "hidden" }}>
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "inline-block",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "1.5px",
              color: "var(--gold)",
              border: "1px solid var(--border-line)",
              borderRadius: 999,
              padding: "6px 14px",
              marginBottom: 24,
              textTransform: "uppercase",
            }}
          >
            Lua / Luau Tooling Platform
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(38px, 6vw, 64px)",
              lineHeight: 1.08,
              margin: "0 0 22px",
              maxWidth: 780,
              color: "var(--text-primary)",
            }}
          >
            Obfuscate, deobfuscate,{" "}
            <span
              style={{
                background: "linear-gradient(120deg, var(--gold-bright), var(--gold))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              and understand
            </span>{" "}
            every script.
          </h1>
          <p style={{ fontSize: 17, color: "var(--text-dim)", maxWidth: 560, lineHeight: 1.65, marginBottom: 36 }}>
            ZodiacTools brings together in-house obfuscation engines and a full deobfuscation
            suite under one roof — built for Roblox Luau developers who need their scripts
            protected, reversed, or simply readable again.
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <Link href="/tools" style={primaryBtn}>
              Browse Tools
            </Link>
            <Link href="/api-docs" style={secondaryBtn}>
              API Reference
            </Link>
          </div>
        </div>

        <div
          aria-hidden
          style={{
            position: "absolute",
            top: -80,
            right: -120,
            width: 480,
            height: 480,
            background: "radial-gradient(circle, rgba(232,184,75,0.14), transparent 70%)",
            filter: "blur(10px)",
          }}
        />
      </section>

      <section className="container" style={{ paddingBottom: 100 }}>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 28,
            marginBottom: 8,
            color: "var(--text-primary)",
          }}
        >
          Four categories, one platform
        </h2>
        <p style={{ color: "var(--text-dim)", marginBottom: 36, maxWidth: 560 }}>
          Every tool lives under one of four categories. Pick a category to see what's inside.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 20,
          }}
        >
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/tools/${c.slug}`}
              style={{
                display: "block",
                background: "var(--bg-panel)",
                border: "1px solid var(--border-line)",
                borderRadius: 14,
                padding: 24,
                transition: "border-color 0.2s, transform 0.2s",
              }}
              className="category-card"
            >
              <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--gold-bright)", marginBottom: 10 }}>
                {c.title}
              </div>
              <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.55, marginBottom: 16, minHeight: 62 }}>
                {c.desc}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {c.tools.map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                      color: "var(--gold-dim)",
                      border: "1px solid var(--border-line)",
                      borderRadius: 6,
                      padding: "3px 8px",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <style>{`
        .category-card:hover {
          border-color: var(--gold-dim) !important;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}

const primaryBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "13px 26px",
  borderRadius: 10,
  fontWeight: 700,
  fontSize: 14,
  background: "linear-gradient(120deg, var(--gold-bright), var(--gold))",
  color: "#0a0812",
};

const secondaryBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "13px 26px",
  borderRadius: 10,
  fontWeight: 700,
  fontSize: 14,
  border: "1px solid var(--border-line)",
  color: "var(--text-primary)",
};
