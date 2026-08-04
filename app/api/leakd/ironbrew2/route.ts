// ZodiacTools API - proxies LeakD /ironbrew2, rebrands credit line
import { proxyFileUpload } from "@/lib/leakd";

export const runtime = "nodejs";

export async function POST(req: Request) {
  return proxyFileUpload("/ironbrew2", req);
}
