// ZodiacTools API - proxies LeakD /ironveil, rebrands credit line
import { proxyFileUpload } from "@/lib/leakd";

export const runtime = "nodejs";

export async function POST(req: Request) {
  return proxyFileUpload("/ironveil", req);
}
