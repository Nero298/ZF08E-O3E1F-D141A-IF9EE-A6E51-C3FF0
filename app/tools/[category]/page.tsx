import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORIES, getCategory } from "@/lib/tools-registry";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const cat = getCategory(params.category);
  if (!cat) notFound();

  return (
    <div className="container" style={{ padding: "56px 0 100px" }}>
      <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 10 }}>
        <Link href="/tools" style={{ color: "var(--gold-dim)" }}>
          Tools
        </Link>{" "}
        / {cat.title}
      </div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 34, marginBottom: 10 }}>{cat.title}</h1>
      <p style={{ color: "var(--text-dim)", marginBottom: 40, maxWidth: 560 }}>{cat.desc}</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 20,
        }}
      >
        {cat.tools.map((t) => (
          <Link
            key={t.slug}
            href={`/tools/${cat.slug}/${t.slug}`}
            style={{
              display: "block",
              background: "var(--bg-panel)",
              border: "1px solid var(--border-line)",
              borderRadius: 14,
              padding: 22,
            }}
            className="tool-link"
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--gold-bright)" }}>
                {t.name}
              </div>
              {t.badge && (
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: "var(--font-mono)",
                    color: "var(--gold-dim)",
                    border: "1px solid var(--border-line)",
                    borderRadius: 5,
                    padding: "2px 6px",
                  }}
                >
                  {t.badge}
                </span>
              )}
            </div>
            <p style={{ fontSize: 13.5, color: "var(--text-dim)", lineHeight: 1.55 }}>{t.desc}</p>
          </Link>
        ))}
      </div>

      <style>{`.tool-link:hover { border-color: var(--gold-dim) !important; }`}</style>
    </div>
  );
}
