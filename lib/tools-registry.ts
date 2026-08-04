export type ToolDef = {
  slug: string;
  name: string;
  desc: string;
  endpoint: string; // API route to POST to
  inputMode: "file" | "code-or-file";
  extraParams?: { key: string; label: string; options: string[]; default: string }[];
  outputField: string; // which JSON field holds the result code
  badge?: string;
};

export type CategoryDef = {
  slug: string;
  title: string;
  desc: string;
  tools: ToolDef[];
};

export const CATEGORIES: CategoryDef[] = [
  {
    slug: "obfuscator",
    title: "Obfuscator",
    desc: "Protect Luau source code before you ship it.",
    tools: [
      {
        slug: "zodiac-obfuscator",
        name: "ZodiacObfuscator",
        desc: "Preset-based obfuscator with Roblox executor, Studio, and Lua 5.1–5.4 targets.",
        endpoint: "/api/zodiac/obfuscate",
        inputMode: "file",
        extraParams: [
          {
            key: "preset",
            label: "Preset",
            options: ["RobloxExecutor", "RobloxStudio", "Lua51", "Lua52", "Lua53", "Lua54"],
            default: "RobloxExecutor",
          },
        ],
        outputField: "obfuscated_code",
        badge: "LeakD-powered",
      },
      {
        slug: "clyde-obfuscator",
        name: "ClydeObfuscator",
        desc: "VM-based Luau protection with string encoding and control-flow scrambling.",
        endpoint: "/api/zodiac/clyde",
        inputMode: "code-or-file",
        outputField: "output",
        badge: "MIT — Clyde",
      },
      {
        slug: "ironveil-mod",
        name: "IronVeil Mod",
        desc: "Anti-tamper VM obfuscator with environment-integrity checks baked in.",
        endpoint: "/api/zodiac/ironveilmod",
        inputMode: "code-or-file",
        outputField: "obfuscated_code",
        badge: "In-house",
      },
    ],
  },
  {
    slug: "deobfuscator",
    title: "Deobfuscator",
    desc: "Reverse obfuscated Luau back into something readable.",
    tools: [
      {
        slug: "moonsec",
        name: "MoonSec V3",
        desc: "Deobfuscates scripts protected with MoonSec V3.",
        endpoint: "/api/leakd/moonsec",
        inputMode: "file",
        outputField: "deobfuscated_code",
      },
      {
        slug: "prometheus",
        name: "Prometheus",
        desc: "Deobfuscates scripts protected with Prometheus.",
        endpoint: "/api/leakd/prometheus",
        inputMode: "file",
        outputField: "deobfuscated_code",
      },
      {
        slug: "ironbrew2",
        name: "IronBrew2",
        desc: "Deobfuscates scripts protected with IronBrew2.",
        endpoint: "/api/leakd/ironbrew2",
        inputMode: "file",
        outputField: "deobfuscated_code",
      },
      {
        slug: "ironveil",
        name: "IronVeil",
        desc: "Deobfuscates scripts protected with IronVeil.",
        endpoint: "/api/leakd/ironveil",
        inputMode: "file",
        outputField: "deobfuscated_code",
      },
      {
        slug: "hercules",
        name: "Hercules",
        desc: "Deobfuscates scripts protected with Hercules.",
        endpoint: "/api/leakd/hercules",
        inputMode: "file",
        outputField: "deobfuscated_code",
      },
    ],
  },
  {
    slug: "beautify",
    title: "Beautify",
    desc: "Clean up minified or cramped Lua formatting.",
    tools: [
      {
        slug: "beautifier",
        name: "Beautifier",
        desc: "Reformats Lua source with proper indentation and line breaks.",
        endpoint: "/api/leakd/beautify",
        inputMode: "code-or-file",
        outputField: "beautified_code",
      },
    ],
  },
  {
    slug: "detect",
    title: "Detect",
    desc: "Identify which obfuscator produced a script.",
    tools: [
      {
        slug: "obfuscator-detector",
        name: "Obfuscator Detector",
        desc: "Analyzes a script and returns the most likely obfuscator used, with confidence.",
        endpoint: "/api/leakd/detect",
        inputMode: "file",
        outputField: "top_result",
      },
    ],
  },
];

export function getCategory(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getTool(categorySlug: string, toolSlug: string) {
  const cat = getCategory(categorySlug);
  return cat?.tools.find((t) => t.slug === toolSlug);
}
