const ENDPOINTS = [
  {
    method: "POST",
    path: "/api/zodiac/obfuscate",
    desc: "ZodiacObfuscator — preset-based obfuscation.",
    params: "?preset=RobloxExecutor|RobloxStudio|Lua51|Lua52|Lua53|Lua54 (optional, default RobloxExecutor)",
    body: "multipart/form-data — field: file",
    response: `{
  "success": true,
  "preset": "RobloxExecutor",
  "file": { "name": "script.lua", "input_size_kb": 5.23, "output_size_kb": 45.67, "ratio": 873.2 },
  "obfuscated_code": "return(function(...)..."
}`,
  },
  {
    method: "POST",
    path: "/api/zodiac/clyde",
    desc: "ClydeObfuscator — VM/string-encoding based obfuscation.",
    body: `application/json — { "code": string, "options"?: {...} }`,
    response: `{ "success": true, "output": "..." }`,
  },
  {
    method: "POST",
    path: "/api/zodiac/ironveilmod",
    desc: "IronVeil Mod — anti-tamper VM obfuscator.",
    body: `application/json — { "code": string, "seed"?: number }  OR  multipart/form-data — field: file`,
    response: `{
  "success": true,
  "file": { "output_size_kb": 8.4 },
  "obfuscated_code": "-- protected by ZodiacTools ~ IronVeil Mod\\n..."
}`,
  },
  {
    method: "POST",
    path: "/api/leakd/detect",
    desc: "Identify which obfuscator produced a script.",
    body: "multipart/form-data — field: file",
    response: `{ "success": true, "top_result": { "name": "Prometheus", "confidence": 95 } }`,
  },
  {
    method: "POST",
    path: "/api/leakd/moonsec",
    desc: "Deobfuscate MoonSec V3 scripts.",
    body: "multipart/form-data — field: file",
    response: `{ "success": true, "file": {...}, "deobfuscated_code": "..." }`,
  },
  {
    method: "POST",
    path: "/api/leakd/prometheus",
    desc: "Deobfuscate Prometheus scripts.",
    body: "multipart/form-data — field: file",
    response: `{ "success": true, "deobfuscated_code": "..." }`,
  },
  {
    method: "POST",
    path: "/api/leakd/ironbrew2",
    desc: "Deobfuscate IronBrew2 scripts.",
    body: "multipart/form-data — field: file",
    response: `{ "success": true, "file": {...}, "deobfuscated_code": "..." }`,
  },
  {
    method: "POST",
    path: "/api/leakd/ironveil",
    desc: "Deobfuscate IronVeil scripts.",
    body: "multipart/form-data — field: file",
    response: `{ "success": true, "file": {...}, "deobfuscated_code": "..." }`,
  },
  {
    method: "POST",
    path: "/api/leakd/hercules",
    desc: "Deobfuscate Hercules scripts.",
    body: "multipart/form-data — field: file",
    response: `{ "success": true, "file": {...}, "deobfuscated_code": "..." }`,
  },
  {
    method: "POST",
    path: "/api/leakd/beautify",
    desc: "Reformat Lua source with clean indentation.",
    body: `application/json — { "code": string }  OR  multipart/form-data — field: file`,
    response: `{ "success": true, "beautified_code": "...", "file": {...} }`,
  },
];

export default function ApiDocsPage() {
  return (
    <div className="container" style={{ padding: "56px 0 100px" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 34, marginBottom: 10 }}>ZodiacTools API</h1>
      <p style={{ color: "var(--text-dim)", marginBottom: 44, maxWidth: 620, lineHeight: 1.6 }}>
        All endpoints are POST, accept file uploads (and JSON code where noted), and return JSON.
        No API key required.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {ENDPOINTS.map((e) => (
          <div
            key={e.path}
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-line)",
              borderRadius: 12,
              padding: 22,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#0a0812",
                  background: "var(--gold)",
                  borderRadius: 5,
                  padding: "3px 8px",
                }}
              >
                {e.method}
              </span>
              <code style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--gold-bright)" }}>
                {e.path}
              </code>
            </div>
            <p style={{ fontSize: 14, color: "var(--text-dim)", marginBottom: 14 }}>{e.desc}</p>
            {e.params && (
              <div style={{ marginBottom: 10 }}>
                <div style={labelStyle}>Query params</div>
                <code style={codeInline}>{e.params}</code>
              </div>
            )}
            <div style={{ marginBottom: 10 }}>
              <div style={labelStyle}>Request body</div>
              <code style={codeInline}>{e.body}</code>
            </div>
            <div>
              <div style={labelStyle}>Response</div>
              <pre style={codeBlock}>{e.response}</pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.5px",
  color: "var(--gold-dim)",
  textTransform: "uppercase",
  marginBottom: 5,
};

const codeInline: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-mono)",
  fontSize: 12.5,
  color: "var(--text-primary)",
  background: "var(--bg-panel-raised)",
  borderRadius: 6,
  padding: "8px 10px",
};

const codeBlock: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 12,
  color: "var(--text-primary)",
  background: "var(--bg-panel-raised)",
  borderRadius: 6,
  padding: 12,
  margin: 0,
  overflowX: "auto",
  whiteSpace: "pre",
};
