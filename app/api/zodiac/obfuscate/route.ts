// ZodiacTools API - ZodiacObfuscator, proxies LeakD /obfuscate
import { proxyFileUpload } from "@/lib/leakd";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const preset = searchParams.get("preset");
  return proxyFileUpload("/obfuscate", req, preset ? { preset } : undefined);
}
