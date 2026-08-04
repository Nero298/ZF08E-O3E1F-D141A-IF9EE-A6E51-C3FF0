// Shared proxy helper for LeakD public API -> ZodiacTools API
// LeakD is a public API co-developed/used under a paid team arrangement.
// We rebrand the "Deobfuscated by LeakD..." credit lines to ZodiacTools.

const LEAKD_BASE = "https://leakd.up.railway.app";

const CODE_FIELDS = ["deobfuscated_code", "obfuscated_code", "beautified_code"] as const;

function rebrand(text: string): string {
  return text.replace(/Deobfuscated by LeakD/gi, "Deobfuscated by ZodiacTools");
}

function rebrandJson(data: any): any {
  if (data && typeof data === "object") {
    for (const field of CODE_FIELDS) {
      if (typeof data[field] === "string") {
        data[field] = rebrand(data[field]);
      }
    }
  }
  return data;
}

export async function proxyFileUpload(
  endpoint: string,
  req: Request,
  extraQuery?: Record<string, string>
): Promise<Response> {
  try {
    const incomingForm = await req.formData();
    const file = incomingForm.get("file");

    if (!file || !(file instanceof File)) {
      return Response.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const forwardForm = new FormData();
    forwardForm.append("file", file, file.name);

    let url = `${LEAKD_BASE}${endpoint}`;
    if (extraQuery && Object.keys(extraQuery).length > 0) {
      const params = new URLSearchParams(extraQuery);
      url += `?${params.toString()}`;
    }

    const upstream = await fetch(url, {
      method: "POST",
      body: forwardForm,
    });

    const data = await upstream.json();
    return Response.json(rebrandJson(data), { status: upstream.status });
  } catch (err: any) {
    return Response.json({ success: false, error: `Proxy error: ${err.message}` }, { status: 500 });
  }
}

export async function proxyJsonOrFile(endpoint: string, req: Request): Promise<Response> {
  try {
    const contentType = req.headers.get("content-type") || "";

    let upstream: globalThis.Response;

    if (contentType.includes("multipart/form-data")) {
      const incomingForm = await req.formData();
      const file = incomingForm.get("file");
      if (!file || !(file instanceof File)) {
        return Response.json({ success: false, error: "No file provided" }, { status: 400 });
      }
      const forwardForm = new FormData();
      forwardForm.append("file", file, file.name);
      upstream = await fetch(`${LEAKD_BASE}${endpoint}`, { method: "POST", body: forwardForm });
    } else {
      const body = await req.json();
      if (typeof body.code !== "string") {
        return Response.json({ success: false, error: "No code provided" }, { status: 400 });
      }
      upstream = await fetch(`${LEAKD_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: body.code }),
      });
    }

    const data = await upstream.json();
    return Response.json(rebrandJson(data), { status: upstream.status });
  } catch (err: any) {
    return Response.json({ success: false, error: `Proxy error: ${err.message}` }, { status: 500 });
  }
}
