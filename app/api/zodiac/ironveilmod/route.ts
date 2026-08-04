// ZodiacTools API - IronVeil Mod endpoint
// Original engine gifted in full to ZodiacTools; watermark/credit rebranded.

import { NextRequest, NextResponse } from "next/server";
import { IronVeilObfuscator } from "@/lib/ironveilmod/obfuscator";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, seed } = body;

    if (typeof code !== "string" || code.trim().length === 0) {
      return NextResponse.json({ success: false, error: "No code provided" }, { status: 400 });
    }

    const engine = new IronVeilObfuscator(typeof seed === "number" ? { seed } : {});
    const output = engine.obfuscate(code);

    return NextResponse.json({
      success: true,
      file: {
        output_size_kb: Math.round((Buffer.byteLength(output, "utf8") / 1024) * 100) / 100,
      },
      obfuscated_code: output,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: `Server error: ${err.message}` }, { status: 500 });
  }
}
