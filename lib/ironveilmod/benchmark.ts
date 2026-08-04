import { execFileSync } from "node:child_process";
import luaparse from "luaparse";
import { IronVeilObfuscator } from "./obfuscator";

const ROBLOX_STUB_PREAMBLE = `
local function makeService(name)
  local svc = {}
  svc.Name = name
  function svc:GetService(n) return makeService(n) end
  function svc:WaitForChild(n) return makeService(n) end
  function svc:FindFirstChild(n) return nil end
  function svc:Connect(fn) return { Disconnect = function() end } end
  function svc:GetChildren() return {} end
  setmetatable(svc, { __index = function(t, k) return makeService(tostring(k)) end })
  return svc
end
game = makeService("game")
workspace = makeService("workspace")
script = makeService("script")
Instance = { new = function(className) return makeService(className) end }
`;

function runLua(source: string): { ok: boolean; stdout: string; stderr: string } {
  try {
    const stdout = execFileSync("lua", [], {
      input: ROBLOX_STUB_PREAMBLE + source,
      encoding: "utf8",
      timeout: 10_000,
    });
    return { ok: true, stdout, stderr: "" };
  } catch (err) {
    const anyErr = err as { stdout?: string; stderr?: string; message: string };
    return { ok: false, stdout: anyErr.stdout ?? "", stderr: anyErr.stderr ?? anyErr.message };
  }
}

interface BenchmarkCase {
  name: string;
  code: string;
}

interface CaseResult {
  name: string;
  ok: boolean;
  error?: string;
  seedsRun: number;
  seedsFailed: number;
  avgMs: number;
  minMs: number;
  maxMs: number;
  avgSizeRatio: number;
}

const SEEDS = [1, 2, 3, 42, 1337, 0xdeadbeef, 0x13572468, 99991];

const CASES: BenchmarkCase[] = [
  {
    name: "empty-and-trivial",
    code: `local x = 1\nprint(x)`,
  },
  {
    name: "numbers-and-arithmetic",
    code: `
local a = 10
local b = 3.5
local c = a + b * 2 - (a / b) % 2
local d = 0xFF
local e = 1e3
print(a, b, c, d, e)
`,
  },
  {
    name: "strings-and-concat",
    code: `
local s1 = "hello"
local s2 = 'world'
local s3 = s1 .. " " .. s2 .. "!"
local s4 = [[a
multiline
string]]
print(s3, s4, #s3)
`,
  },
  {
    name: "tables-nested",
    code: `
local t = {
  a = 1,
  b = { 1, 2, 3 },
  c = { x = 10, y = { z = 20 } },
  [1] = "array-like",
  "positional",
}
print(t.a, t.b[1], t.c.y.z, t[1])
`,
  },
  {
    name: "control-flow-continue-break",
    code: `
local sum = 0
for i = 1, 20 do
  if i % 2 == 0 then
    continue
  end
  if i > 15 then
    break
  end
  sum = sum + i
end
print(sum)
`,
  },
  {
    name: "while-repeat-loops",
    code: `
local k = 0
while k < 10 do
  k = k + 1
  if k == 5 then continue end
end
repeat
  k = k - 1
until k <= 0
print(k)
`,
  },
  {
    name: "functions-closures-varargs",
    code: `
local function make_counter()
  local count = 0
  return function(...)
    local args = {...}
    count = count + #args
    return count
  end
end
local counter = make_counter()
print(counter(1, 2, 3), counter("a"))
`,
  },
  {
    name: "recursion-fibonacci",
    code: `
local function fib(n)
  if n < 2 then
    return n
  end
  return fib(n - 1) + fib(n - 2)
end
print(fib(18))
`,
  },
  {
    name: "metatables-oop",
    code: `
local Animal = {}
Animal.__index = Animal

function Animal.new(name)
  local self = setmetatable({}, Animal)
  self.name = name
  return self
end

function Animal:speak()
  return self.name .. " makes a sound"
end

local dog = Animal.new("Rex")
print(dog:speak())
`,
  },
  {
    name: "roblox-style-services",
    code: `
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local player = Players.LocalPlayer

local function onCharacterAdded(character)
  local humanoid = character:WaitForChild("Humanoid")
  humanoid.WalkSpeed = 16
end

RunService.Heartbeat:Connect(function(dt)
  local health = 100 - dt
end)

print(player, onCharacterAdded)
`,
  },
  {
    name: "generic-for-ipairs-pairs",
    code: `
local items = { "sword", "shield", "potion" }
for i, v in ipairs(items) do
  print(i, v)
end
local map = { a = 1, b = 2, c = 3 }
for k, v in pairs(map) do
  print(k, v)
end
`,
  },
  {
    name: "string-formatting-heavy",
    code: `
local function buildMessage(name, score)
  return string.format("Player %s scored %d points (%.2f%%)", name, score, score / 100 * 100)
end
print(buildMessage("Alice", 42))
print(string.sub("obfuscation", 1, 4))
print(string.byte("A"), string.char(65))
`,
  },
  {
    name: "deep-nesting-stress",
    code: `
local function level1()
  local function level2()
    local function level3()
      local total = 0
      for i = 1, 5 do
        for j = 1, 5 do
          if i == j then
            if j % 2 == 0 then
              continue
            end
            total = total + i * j
          end
        end
      end
      return total
    end
    return level3()
  end
  return level2()
end
print(level1())
`,
  },
];

function measure(fn: () => void): number {
  const start = process.hrtime.bigint();
  fn();
  const end = process.hrtime.bigint();
  return Number(end - start) / 1_000_000;
}

function isReparseable(output: string): boolean {
  try {
    luaparse.parse(output, { luaVersion: "5.2" });
    return true;
  } catch {
    return false;
  }
}

function runCase(testCase: BenchmarkCase): CaseResult {
  const durations: number[] = [];
  const ratios: number[] = [];
  let seedsFailed = 0;
  let error: string | undefined;

  const reference = runLua(testCase.code);
  const hasReference = reference.ok;

  for (const seed of SEEDS) {
    try {
      const obfuscator = new IronVeilObfuscator({ seed });
      let output = "";
      const ms = measure(() => {
        output = obfuscator.obfuscate(testCase.code);
      });

      if (!output || output.length === 0) {
        throw new Error("empty output");
      }
      if (!isReparseable(output)) {
        throw new Error("obfuscated output is not valid Lua (fails to re-parse)");
      }

      const executed = runLua(output);
      if (!executed.ok) {
        throw new Error(`obfuscated output threw at runtime: ${executed.stderr.trim().slice(0, 300)}`);
      }
      if (hasReference && executed.stdout !== reference.stdout) {
        throw new Error(
          `obfuscated output stdout mismatch vs reference\n    expected: ${JSON.stringify(reference.stdout)}\n    actual:   ${JSON.stringify(executed.stdout)}`,
        );
      }

      durations.push(ms);
      ratios.push(output.length / testCase.code.length);
    } catch (err) {
      seedsFailed += 1;
      error = err instanceof Error ? err.message : String(err);
    }
  }

  const ok = seedsFailed === 0;
  const avgMs = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
  const minMs = durations.length > 0 ? Math.min(...durations) : 0;
  const maxMs = durations.length > 0 ? Math.max(...durations) : 0;
  const avgSizeRatio = ratios.length > 0 ? ratios.reduce((a, b) => a + b, 0) / ratios.length : 0;

  return {
    name: testCase.name,
    ok,
    error,
    seedsRun: SEEDS.length,
    seedsFailed,
    avgMs,
    minMs,
    maxMs,
    avgSizeRatio,
  };
}

export function runBenchmarks(): CaseResult[] {
  return CASES.map(runCase);
}

function formatMs(ms: number): string {
  return `${ms.toFixed(2)}ms`;
}

function main(): void {
  console.log(`IronVeil Obfuscator Benchmark — ${CASES.length} cases x ${SEEDS.length} seeds\n`);

  const results = runBenchmarks();
  let failures = 0;

  for (const result of results) {
    const status = result.ok ? "PASS" : "FAIL";
    if (!result.ok) failures += 1;

    console.log(`[${status}] ${result.name}`);
    console.log(
      `  seeds: ${result.seedsRun - result.seedsFailed}/${result.seedsRun} ok` +
        (result.seedsFailed > 0 ? `  (${result.seedsFailed} failed)` : ""),
    );
    if (result.ok) {
      console.log(
        `  time: avg=${formatMs(result.avgMs)} min=${formatMs(result.minMs)} max=${formatMs(result.maxMs)}` +
          `  size ratio: ${result.avgSizeRatio.toFixed(2)}x`,
      );
    } else {
      console.log(`  error: ${result.error}`);
    }
    console.log("");
  }

  const passCount = results.length - failures;
  const overallAvgMs =
    results.filter((r) => r.ok).reduce((sum, r) => sum + r.avgMs, 0) / Math.max(passCount, 1);
  const overallAvgRatio =
    results.filter((r) => r.ok).reduce((sum, r) => sum + r.avgSizeRatio, 0) / Math.max(passCount, 1);

  console.log("=".repeat(60));
  console.log(`Summary: ${passCount}/${results.length} cases passed`);
  if (passCount > 0) {
    console.log(`Overall avg obfuscation time: ${formatMs(overallAvgMs)}`);
    console.log(`Overall avg output size ratio: ${overallAvgRatio.toFixed(2)}x`);
  }

  if (failures > 0) {
    console.error(`\n${failures} case(s) failed — see errors above.`);
    process.exit(1);
  }
}

main();
