import Link from "next/link";
import { CATEGORIES } from "@/lib/tools-registry";

export default function ToolsIndex() {
  return (
    <div className="container" style={{ padding: "56px 0 100px" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, marginBottom: 10 }}>Tools</h1>
      <p style={{ color: "var(--text-dim)", marginBottom: 44, maxWidth: 560 }}>
        Pick a category to see what's available inside.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 22,
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
              borderRadius: 16,
              padding: 30,
            }}
            className="cat-link"
          >
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 24,
                color: "var(--gold-bright)",
                marginBottom: 12,
              }}
            >
              {c.title}
            </div>
            <p style={{ fontSize: 14.5, color: "var(--text-dim)", lineHeight: 1.6, marginBottom: 18 }}>{c.desc}</p>
            <div style={{ fontSize: 13, color: "var(--gold-dim)", fontWeight: 700 }}>
              {c.tools.length} tool{c.tools.length > 1 ? "s" : ""} →
            </div>
          </Link>
        ))}
      </div>

      <style>{`.cat-link:hover { border-color: var(--gold-dim) !important; }`}</style>
    </div>
  );
}
