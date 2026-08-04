// ZodiacTools API - proxies LeakD /beautify (accepts JSON code or file upload)
import { proxyJsonOrFile } from "@/lib/leakd";

export const runtime = "nodejs";

export async function POST(req: Request) {
  return proxyJsonOrFile("/beautify", req);
}
