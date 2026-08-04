import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORIES, getCategory, getTool } from "@/lib/tools-registry";
import ToolRunner from "@/components/ToolRunner";

export function generateStaticParams() {
  return CATEGORIES.flatMap((c) => c.tools.map((t) => ({ category: c.slug, tool: t.slug })));
}

export default function ToolPage({ params }: { params: { category: string; tool: string } }) {
  const cat = getCategory(params.category);
  const tool = getTool(params.category, params.tool);
  if (!cat || !tool) notFound();

  return (
    <div className="container" style={{ padding: "48px 0 100px" }}>
      <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 10 }}>
        <Link href="/tools" style={{ color: "var(--gold-dim)" }}>
          Tools
        </Link>{" "}
        /{" "}
        <Link href={`/tools/${cat.slug}`} style={{ color: "var(--gold-dim)" }}>
          {cat.title}
        </Link>{" "}
        / {tool.name}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 30, margin: 0 }}>{tool.name}</h1>
        {tool.badge && (
          <span
            style={{
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              color: "var(--gold-dim)",
              border: "1px solid var(--border-line)",
              borderRadius: 6,
              padding: "3px 8px",
            }}
          >
            {tool.badge}
          </span>
        )}
      </div>
      <p style={{ color: "var(--text-dim)", marginBottom: 32, maxWidth: 600 }}>{tool.desc}</p>

      <ToolRunner tool={tool} />
    </div>
  );
}
