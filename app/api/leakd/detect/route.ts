// ZodiacTools API - proxies LeakD /detect
import { proxyFileUpload } from "@/lib/leakd";

export const runtime = "nodejs";

export async function POST(req: Request) {
  return proxyFileUpload("/detect", req);
}
