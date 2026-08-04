"use client";
import { useState } from "react";
import type { ToolDef } from "@/lib/tools-registry";

export default function ToolRunner({ tool }: { tool: ToolDef }) {
  const [code, setCode] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [params, setParams] = useState<Record<string, string>>(
    Object.fromEntries((tool.extraParams || []).map((p) => [p.key, p.default]))
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let url = tool.endpoint;
      if (tool.extraParams && tool.extraParams.length > 0) {
        const qs = new URLSearchParams(params);
        url += `?${qs.toString()}`;
      }

      let res: Response;

      if (file) {
        const form = new FormData();
        form.append("file", file);
        res = await fetch(url, { method: "POST", body: form });
      } else {
        res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
      }

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Unknown error");
      } else {
        setResult(data);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const outputText =
    result && tool.outputField in result
      ? typeof result[tool.outputField] === "string"
        ? result[tool.outputField]
        : JSON.stringify(result[tool.outputField], null, 2)
      : null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="tool-grid">
      <div style={panelStyle}>
        <div style={panelHeader}>Input</div>
        <div style={{ padding: 18 }}>
          <textarea
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setFile(null);
            }}
            placeholder="Paste your Lua/Luau code here…"
            style={textareaStyle}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
            <label style={fileLabel}>
              {file ? file.name : "Or choose a file"}
              <input
                type="file"
                accept=".lua,.luau,.txt"
                style={{ display: "none" }}
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  setFile(f);
                  if (f) setCode("");
                }}
              />
            </label>
            {file && (
              <button onClick={() => setFile(null)} style={clearBtn}>
                Clear
              </button>
            )}
          </div>

          {tool.extraParams?.map((p) => (
            <div key={p.key} style={{ marginTop: 16 }}>
              <label style={{ fontSize: 12, color: "var(--text-dim)", display: "block", marginBottom: 6 }}>
                {p.label}
              </label>
              <select
                value={params[p.key]}
                onChange={(e) => setParams((prev) => ({ ...prev, [p.key]: e.target.value }))}
                style={selectStyle}
              >
                {p.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          ))}

          <button
            onClick={run}
            disabled={loading || (!code.trim() && !file)}
            style={{
              ...runBtn,
              opacity: loading || (!code.trim() && !file) ? 0.5 : 1,
              cursor: loading || (!code.trim() && !file) ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Running…" : `Run ${tool.name}`}
          </button>
        </div>
      </div>

      <div style={panelStyle}>
        <div style={panelHeader}>
          Output
          {outputText && (
            <button
              onClick={() => navigator.clipboard.writeText(outputText)}
              style={{ ...clearBtn, marginLeft: "auto" }}
            >
              Copy
            </button>
          )}
        </div>
        <div style={{ padding: 18 }}>
          {error && (
            <div style={{ color: "#ff8686", fontSize: 13.5, fontFamily: "var(--font-mono)" }}>Error: {error}</div>
          )}
          {!error && !outputText && (
            <div style={{ color: "var(--text-dim)", fontSize: 13.5 }}>Output will appear here.</div>
          )}
          {outputText && (
            <pre
              style={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
                fontFamily: "var(--font-mono)",
                fontSize: 12.5,
                color: "var(--text-primary)",
                margin: 0,
                maxHeight: 480,
                overflowY: "auto",
              }}
            >
              {outputText}
            </pre>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .tool-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  background: "var(--bg-panel)",
  border: "1px solid var(--border-line)",
  borderRadius: 14,
  overflow: "hidden",
};

const panelHeader: React.CSSProperties = {
  padding: "12px 18px",
  borderBottom: "1px solid var(--border-line)",
  fontSize: 12.5,
  fontWeight: 700,
  letterSpacing: "0.5px",
  color: "var(--gold-dim)",
  textTransform: "uppercase",
  display: "flex",
  alignItems: "center",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 260,
  background: "var(--bg-panel-raised)",
  border: "1px solid var(--border-line)",
  borderRadius: 8,
  padding: 12,
  color: "var(--text-primary)",
  fontFamily: "var(--font-mono)",
  fontSize: 12.5,
  resize: "vertical",
};

const fileLabel: React.CSSProperties = {
  fontSize: 12.5,
  color: "var(--text-dim)",
  border: "1px dashed var(--border-line)",
  borderRadius: 8,
  padding: "8px 14px",
  cursor: "pointer",
};

const clearBtn: React.CSSProperties = {
  fontSize: 12,
  color: "var(--gold-dim)",
  background: "transparent",
  border: "none",
  cursor: "pointer",
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--bg-panel-raised)",
  border: "1px solid var(--border-line)",
  borderRadius: 8,
  padding: "9px 12px",
  color: "var(--text-primary)",
  fontSize: 13,
};

const runBtn: React.CSSProperties = {
  width: "100%",
  marginTop: 20,
  padding: "13px 20px",
  borderRadius: 10,
  fontWeight: 700,
  fontSize: 14,
  background: "linear-gradient(120deg, var(--gold-bright), var(--gold))",
  color: "#0a0812",
  border: "none",
};
