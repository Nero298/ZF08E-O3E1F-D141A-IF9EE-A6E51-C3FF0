// ZodiacTools API - Clyde Obfuscator endpoint
// Ported from Clyde-Luau-Obfuscator (MIT License, Copyright (c) 2025 Clyde)
// Original source: https://github.com/sfrde/Clyde-Luau-Obfuscator
// Logic below mirrors the original src/server.ts /api/obfuscate handler 1:1.
// Credits are NOT modified per original license terms.

import { NextRequest, NextResponse } from "next/server";
import { lex } from "@/lib/clyde/lexer/Lexer";
import { parse } from "@/lib/clyde/parser/Parser";
import { obfuscate } from "@/lib/clyde/obfuscator/Obfuscator";
import { encodeStrings } from "@/lib/clyde/obfuscator/StringEncoder";
import { scrambleControlFlow } from "@/lib/clyde/obfuscator/ControlFlowScrambler";
import { printChunk, printChunkOneLine } from "@/lib/clyde/obfuscator/Printer";
import { compile } from "@/lib/clyde/vm/Compiler";
import { regCompile } from "@/lib/clyde/vm/RegCompiler";
import { generateVM } from "@/lib/clyde/vm/vm-gen";
import { generateRegVM } from "@/lib/clyde/vm/reg-vm-gen";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, options } = body;

    if (typeof code !== "string") {
      return NextResponse.json({ error: "Invalid 'code' parameter" }, { status: 400 });
    }

    const opts = options || {};
    const noRename = opts.noRename === true;
    const noPreserve = opts.noPreserve === true;
    const encodeStringsOpt = opts.encodeStrings === true;
    const scrambleOpt = opts.scramble === true;
    const oneLineOpt = opts.oneLine === true;
    const vmType = opts.vmType || "none";
    const vmLevel = opts.vmLevel || "normal";

    const { tokens, errors: lexErrors } = lex(code);
    if (lexErrors.length > 0) {
      return NextResponse.json({ error: "Lexer error", details: lexErrors }, { status: 400 });
    }

    let ast = parse(tokens);

    if (encodeStringsOpt) {
      ast = encodeStrings(ast, { enabled: true });
    }

    if (scrambleOpt) {
      ast = scrambleControlFlow(ast, { enabled: true });
    }

    let output: string;

    if (vmType === "stack") {
      const obfuscated = obfuscate(ast, {
        renameLocals: !noRename,
        preserveGlobals: !noPreserve,
      });
      const chunk = compile(obfuscated);
      output = generateVM(chunk, {
        level: vmLevel as any,
        executorGlobals: vmLevel !== "debug",
      });
    } else if (vmType === "register") {
      const obfuscated = obfuscate(ast, {
        renameLocals: !noRename,
        preserveGlobals: !noPreserve,
      });
      const chunk = regCompile(obfuscated);
      const disableFeatures: string[] = [];
      if (vmLevel === "debug") disableFeatures.push("controlFlowFlattening");
      output = generateRegVM(chunk, {
        level: vmLevel as any,
        executorGlobals: vmLevel !== "debug",
        polymorphicSeed: Date.now(),
        disableFeatures: disableFeatures as any[],
      });
    } else {
      const obfuscated = obfuscate(ast, {
        renameLocals: !noRename,
        preserveGlobals: !noPreserve,
      });
      output = oneLineOpt ? printChunkOneLine(obfuscated) : printChunk(obfuscated);
    }

    return NextResponse.json({ success: true, output });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: `Server error: ${err.message}` }, { status: 500 });
  }
}
