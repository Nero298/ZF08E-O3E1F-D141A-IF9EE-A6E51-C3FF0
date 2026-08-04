import luaparse from "luaparse";

export type ContinueStatement = { type: "ContinueStatement" };

export type Identifier = { type: "Identifier"; name: string; scope?: { type: string } };
export type NilLiteral = { type: "NilLiteral"; value: null };
export type BooleanLiteral = { type: "BooleanLiteral"; value: boolean };
export type NumberLiteral = { type: "NumberLiteral"; value: number; raw?: string };
export type StringLiteral = { type: "StringLiteral"; value: string; raw?: string };
export type VarargLiteral = { type: "VarargLiteral"; value: string };

export type UnaryExpression = { type: "UnaryExpression"; operator: string; argument: Expression };
export type BinaryExpression = { type: "BinaryExpression"; operator: string; left: Expression; right: Expression };
export type MemberExpression = {
  type: "MemberExpression";
  base: Expression;
  computed: boolean;
  indexer: string | Expression;
  identifier?: Identifier;
};
export type CallExpression = {
  type: "CallExpression";
  base: Expression;
  arguments: Expression[];
  selfCall: boolean;
};
export type TableConstructor = { type: "TableConstructor"; fields: TableField[] };
export type FunctionExpression = { type: "FunctionExpression"; parameters: Identifier[]; body: Block };

export type Expression =
  | Identifier | NilLiteral | BooleanLiteral | NumberLiteral | StringLiteral | VarargLiteral
  | UnaryExpression | BinaryExpression | MemberExpression | CallExpression | TableConstructor | FunctionExpression;

export type TableField =
  | { type: "Array"; value: Expression }
  | { type: "Record"; key: Identifier; value: Expression }
  | { type: "General"; key: Expression; value: Expression };

export type Block = { type?: "Block"; body: Statement[] };
export type IfClause = { type: "IfClause" | "ElseifClause"; condition: Expression; body: Block };
export type Program = { type: "Program"; body: Statement[] };

export type LocalStatement = { type: "LocalStatement"; variables: Identifier[]; init: Expression[] };
export type AssignmentStatement = {
  type: "AssignmentStatement";
  operator?: string;
  left: (Identifier | MemberExpression)[];
  right: Expression[];
};
export type CallStatement = { type: "CallStatement"; expression: Expression };
export type FunctionDeclaration = {
  type: "FunctionDeclaration";
  identifier: Identifier | MemberExpression;
  isLocal: boolean;
  parameters: Identifier[];
  body: Block;
};
export type ReturnStatement = { type: "ReturnStatement"; arguments: Expression[] };
export type IfStatement = {
  type: "IfStatement";
  clauses: IfClause[];
  elseBody: Block | null;
};
export type WhileStatement = { type: "WhileStatement"; condition: Expression; body: Block };
export type RepeatStatement = { type: "RepeatStatement"; body: Block; condition: Expression };
export type ForStatement = {
  type: "ForStatement";
  variable: Identifier;
  start: Expression;
  end: Expression;
  step: Expression | null;
  body: Block;
};
export type ForInStatement = { type: "ForInStatement"; variables: Identifier[]; iterator: Expression[]; body: Block };
export type BreakStatement = { type: "BreakStatement" };
export type DoStatement = { type: "DoStatement"; body: Block };

export type Statement =
  | LocalStatement | AssignmentStatement | CallStatement | FunctionDeclaration
  | ReturnStatement | IfStatement | WhileStatement | RepeatStatement
  | ForStatement | ForInStatement | BreakStatement | ContinueStatement | DoStatement | Block;

function normalizeNode(node: any): any {
  if (!node || typeof node !== "object") return node;
  if (Array.isArray(node)) return node.map(normalizeNode);

  switch (node.type) {
    case "IndexExpression":
      return {
        type: "MemberExpression",
        base: normalizeNode(node.base),
        computed: true,
        indexer: normalizeNode(node.index),
        identifier: undefined,
      };

    case "MemberExpression":
      return {
        type: "MemberExpression",
        base: normalizeNode(node.base),
        computed: false,
        indexer: node.indexer,
        identifier: normalizeNode(node.identifier),
      };

    case "NumericLiteral":
      return {
        type: "NumberLiteral",
        value: Number(node.value),
      };

    case "ForGenericStatement":
      return {
        type: "ForInStatement",
        variables: normalizeNode(node.variables),
        iterator: normalizeNode(node.iterators),
        body: ensureBlock(normalizeNode(node.body)),
      };

    case "IfStatement": {
      const allClauses: any[] = node.clauses || [];
      const mainClauses = allClauses.filter((c: any) => c.type !== "ElseClause").map(normalizeNode);
      const elseClause = allClauses.find((c: any) => c.type === "ElseClause");
      return {
        type: "IfStatement",
        clauses: mainClauses,
        elseBody: elseClause ? ensureBlock(normalizeNode(elseClause.body)) : null,
      };
    }

    case "IfClause":
    case "ElseifClause":
      return {
        type: node.type,
        condition: normalizeNode(node.condition),
        body: ensureBlock(normalizeNode(node.body)),
      };

    case "CallExpression": {
      const base = normalizeNode(node.base);
      const selfCall =
        base.type === "MemberExpression" && !base.computed && base.indexer === ":";
      return {
        type: "CallExpression",
        base,
        arguments: normalizeNode(node.arguments || []),
        selfCall,
      };
    }

    case "StringCallExpression": {
      const base = normalizeNode(node.base);
      const selfCall =
        base.type === "MemberExpression" && !base.computed && base.indexer === ":";
      return {
        type: "CallExpression",
        base,
        arguments: [normalizeNode(node.argument)],
        selfCall,
      };
    }

    case "TableCallExpression": {
      const base = normalizeNode(node.base);
      const selfCall =
        base.type === "MemberExpression" && !base.computed && base.indexer === ":";
      // luaparse names the field "arguments" (plural) for TableCallExpression
      // unlike StringCallExpression which uses "argument" (singular)
      const tableArg = node.arguments ?? node.argument;
      return {
        type: "CallExpression",
        base,
        arguments: tableArg != null ? [normalizeNode(tableArg)] : [],
        selfCall,
      };
    }

    case "FunctionDeclaration":
      if (!node.identifier) {
        return {
          type: "FunctionExpression",
          parameters: buildParams(node),
          body: ensureBlock(normalizeNode(node.body)),
        };
      }
      return {
        type: "FunctionDeclaration",
        identifier: normalizeNode(node.identifier),
        isLocal: !!node.isLocal,
        parameters: buildParams(node),
        body: ensureBlock(normalizeNode(node.body)),
      };

    case "FunctionExpression":
      return {
        type: "FunctionExpression",
        parameters: buildParams(node),
        body: ensureBlock(normalizeNode(node.body)),
      };

    case "TableConstructorExpression":
      return {
        type: "TableConstructor",
        fields: (node.fields || []).map((f: any) => normalizeField(f)),
      };

    case "ForNumericStatement":
      return {
        type: "ForStatement",
        variable: normalizeNode(node.variable),
        start: normalizeNode(node.start),
        end: normalizeNode(node.end),
        step: node.step ? normalizeNode(node.step) : null,
        body: ensureBlock(normalizeNode(node.body)),
      };

    case "LocalStatement":
      return {
        type: "LocalStatement",
        variables: normalizeNode(node.variables),
        init: normalizeNode(node.init || []),
      };

    case "LogicalExpression":
      // luaparse emits LogicalExpression for `and`/`or`; treat as BinaryExpression
      return {
        type: "BinaryExpression",
        operator: node.operator,
        left: normalizeNode(node.left),
        right: normalizeNode(node.right),
      };

    case "AssignmentStatement":
      return {
        type: "AssignmentStatement",
        operator: node.operator,
        left: normalizeNode(node.variables || node.left),
        right: normalizeNode(node.init || node.right),
      };

    case "WhileStatement":
      return {
        type: "WhileStatement",
        condition: normalizeNode(node.condition),
        body: ensureBlock(normalizeNode(node.body)),
      };

    case "RepeatStatement":
      return {
        type: "RepeatStatement",
        body: ensureBlock(normalizeNode(node.body)),
        condition: normalizeNode(node.condition),
      };

    case "DoStatement":
      return {
        type: "DoStatement",
        body: ensureBlock(normalizeNode(node.body)),
      };

    case "ReturnStatement":
      return {
        type: "ReturnStatement",
        arguments: normalizeNode(node.arguments || []),
      };

    case "CallStatement": {
      const expr = node.expression;
      if (
        expr &&
        expr.type === "CallExpression" &&
        expr.base &&
        expr.base.type === "Identifier" &&
        expr.base.name === CONTINUE_MARKER
      ) {
        return { type: "ContinueStatement" };
      }
      return {
        type: "CallStatement",
        expression: normalizeNode(node.expression),
      };
    }

    case "Chunk":
      return {
        type: "Program",
        body: normalizeNode(node.body || []),
      };

    default: {
      const out: any = {};
      for (const [k, v] of Object.entries(node)) {
        out[k] = normalizeNode(v);
      }
      return out;
    }
  }
}

function buildParams(node: any): Identifier[] {
  const params: Identifier[] = [];
  const rawParams: any[] = node.parameters || [];
  if (node.hasVararg) rawParams.push({ type: "Identifier", name: "..." });
  for (const p of rawParams) {
    if (p.type === "VarargLiteral") {
      params.push({ type: "Identifier", name: "..." });
    } else {
      params.push(normalizeNode(p));
    }
  }
  return params;
}

function ensureBlock(value: any): Block {
  if (Array.isArray(value)) return { body: value };
  if (value && typeof value === "object" && Array.isArray(value.body)) return value;
  return { body: [] };
}

function normalizeField(field: any): TableField {
  if (field.type === "TableValue") {
    return { type: "Array", value: normalizeNode(field.value) };
  }
  if (field.type === "TableKey") {
    return { type: "General", key: normalizeNode(field.key), value: normalizeNode(field.value) };
  }
  if (field.type === "TableKeyString") {
    return { type: "Record", key: normalizeNode(field.key), value: normalizeNode(field.value) };
  }
  return { type: "Array", value: normalizeNode(field.value) };
}

const CONTINUE_MARKER = "__ivcontinue__";

function maskStringsAndComments(source: string): string {
  return source.replace(
    /--\[(=*)\[[\s\S]*?\]\1\]|\[(=*)\[[\s\S]*?\]\2\]|--[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g,
    (m) => " ".repeat(m.length),
  );
}

// Like maskStringsAndComments but leaves comments intact — only replaces string literals.
// Used to locate "--" comment markers that are not inside strings.
function maskStringsOnly(source: string): string {
  return source.replace(
    /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g,
    (m) => " ".repeat(m.length),
  );
}

function preprocessContinue(source: string): string {
  const masked = maskStringsAndComments(source);
  return source.replace(/\bcontinue\b/g, (match, offset: number) => {
    const maskedSlice = masked.slice(offset, offset + match.length);
    if (maskedSlice === match) {
      return `${CONTINUE_MARKER}()`;
    }
    return match;
  });
}

// Encode a Unicode codepoint as UTF-8 bytes
function utf8Bytes(codepoint: number): number[] {
  if (codepoint <= 0x7F) return [codepoint];
  if (codepoint <= 0x7FF) return [0xC0 | (codepoint >> 6), 0x80 | (codepoint & 0x3F)];
  if (codepoint <= 0xFFFF) return [
    0xE0 | (codepoint >> 12),
    0x80 | ((codepoint >> 6) & 0x3F),
    0x80 | (codepoint & 0x3F),
  ];
  return [
    0xF0 | (codepoint >> 18),
    0x80 | ((codepoint >> 12) & 0x3F),
    0x80 | ((codepoint >> 6) & 0x3F),
    0x80 | (codepoint & 0x3F),
  ];
}

// Get the full Unicode codepoint at position i (handles JS surrogate pairs)
function codepointAt(source: string, i: number): { cp: number; advance: number } {
  const cc = source.charCodeAt(i);
  if (cc >= 0xD800 && cc <= 0xDBFF && i + 1 < source.length) {
    const nc = source.charCodeAt(i + 1);
    if (nc >= 0xDC00 && nc <= 0xDFFF) {
      return { cp: 0x10000 + ((cc - 0xD800) << 10) + (nc - 0xDC00), advance: 2 };
    }
  }
  return { cp: cc, advance: 1 };
}

// Emit Lua decimal byte escapes for a codepoint (\ddd\ddd...)
function luaEscapeCodepoint(source: string, i: number): { escaped: string; advance: number } {
  const { cp, advance } = codepointAt(source, i);
  const escaped = utf8Bytes(cp).map((b) => `\\${b}`).join("");
  return { escaped, advance };
}

/**
 * Preprocess non-ASCII characters before luaparse (which only accepts pseudo-latin1):
 *   - In comments: replace with spaces (comments are discarded by parser)
 *   - In short strings: convert to Lua \NNN decimal byte escapes (UTF-8 bytes)
 *   - In long strings: convert to short string with escapes to allow escape sequences
 *   - In code: replace with spaces (non-ASCII identifiers are invalid Lua anyway)
 */
function preprocessUnicode(source: string): string {
  if (!/[^\x00-\x7F]/.test(source)) return source;

  const out: string[] = [];
  let i = 0;

  const pushChar = () => { out.push(source[i]); i++; };

  while (i < source.length) {
    const ch = source[i];
    const cc = source.charCodeAt(i);

    // --- Single-line or long comment ---
    if (ch === "-" && i + 1 < source.length && source[i + 1] === "-") {
      out.push("--");
      i += 2;

      // Detect long comment --[=*[
      let isLong = false;
      if (i < source.length && source[i] === "[") {
        let eq = 0;
        let j = i + 1;
        while (j < source.length && source[j] === "=") { eq++; j++; }
        if (j < source.length && source[j] === "[") {
          isLong = true;
          const close = "]" + "=".repeat(eq) + "]";
          out.push("[", "=".repeat(eq), "[");
          i = j + 1;
          while (i < source.length && !source.startsWith(close, i)) {
            if (source.charCodeAt(i) > 127) {
              const { advance } = codepointAt(source, i);
              out.push(" ");
              i += advance;
            } else {
              pushChar();
            }
          }
          if (source.startsWith(close, i)) { out.push(close); i += close.length; }
        }
      }
      if (!isLong) {
        while (i < source.length && source[i] !== "\n") {
          if (source.charCodeAt(i) > 127) {
            const { advance } = codepointAt(source, i);
            out.push(" ");
            i += advance;
          } else {
            pushChar();
          }
        }
      }
      continue;
    }

    // --- Short string "..." or '...' ---
    if (ch === '"' || ch === "'") {
      const quote = ch;
      out.push(quote);
      i++;
      while (i < source.length) {
        const c = source[i];
        const ccc = source.charCodeAt(i);
        if (c === "\\") {
          out.push(c); i++;
          if (i < source.length) { pushChar(); }
          continue;
        }
        if (c === quote || c === "\n") { out.push(c); i++; break; }
        if (ccc > 127) {
          const { escaped, advance } = luaEscapeCodepoint(source, i);
          out.push(escaped);
          i += advance;
        } else {
          pushChar();
        }
      }
      continue;
    }

    // --- Long string [=*[ ... ]=*] — convert to short string so escapes work ---
    if (ch === "[") {
      let eq = 0;
      let j = i + 1;
      while (j < source.length && source[j] === "=") { eq++; j++; }
      if (j < source.length && source[j] === "[") {
        const close = "]" + "=".repeat(eq) + "]";
        const contentStart = j + 1;
        const contentEnd = source.indexOf(close, contentStart);
        // Unterminated long string — pass through unchanged so luaparse reports the error
        if (contentEnd === -1) { pushChar(); continue; }
        const raw = source.slice(contentStart, contentEnd);
        // Lua long strings strip only the very first newline (any of \n, \r\n, \r)
        let content = raw;
        if (content.startsWith("\r\n")) content = content.slice(2);
        else if (content.startsWith("\r") || content.startsWith("\n")) content = content.slice(1);
        let escaped = '"';
        for (let k = 0; k < content.length; ) {
          const c = content[k];
          const ccc = content.charCodeAt(k);
          if (c === '"') { escaped += '\\"'; k++; }
          else if (c === "\\") { escaped += "\\\\"; k++; }
          else if (c === "\n") { escaped += "\\n"; k++; }
          else if (c === "\r") { escaped += "\\r"; k++; }
          else if (c === "\0") { escaped += "\\0"; k++; }
          else if (ccc > 127) {
            const { cp, advance } = codepointAt(content, k);
            escaped += utf8Bytes(cp).map((b) => `\\${b}`).join("");
            k += advance;
          } else {
            escaped += c; k++;
          }
        }
        escaped += '"';
        out.push(escaped);
        i = contentEnd + close.length;
        continue;
      }
    }

    // --- Non-ASCII in code position (invalid Lua, replace with space) ---
    if (cc > 127) {
      const { advance } = codepointAt(source, i);
      out.push(" ");
      i += advance;
      continue;
    }

    pushChar();
  }

  return out.join("");
}

/**
 * Desugar Luau compound assignment operators (+=, -=, *=, /=, %=, ^=, ..=)
 * into standard Lua assignments, since luaparse doesn't understand them.
 *
 * `x += expr`   →  `x = x + (expr)`
 * `a.b -= 3`   →  `a.b = a.b - (3)`
 * `t[k] ..= s` →  `t[k] = t[k] .. (s)`
 *
 * One compound op per line is handled. Multiple on one line is unsupported.
 */
function preprocessCompoundAssignment(source: string): string {
  const COMPOUND_OPS: Record<string, string> = {
    "..=": "..", "+=": "+", "-=": "-", "*=": "*", "/=": "/", "%=": "%", "^=": "^",
  };

  const hasAny = Object.keys(COMPOUND_OPS).some((op) => source.includes(op));
  if (!hasAny) return source;

  const masked = maskStringsAndComments(source);
  const lines = source.split("\n");
  const maskedLines = masked.split("\n");

  return lines.map((line, idx) => {
    const mline = maskedLines[idx] ?? "";

    for (const [cop, bop] of Object.entries(COMPOUND_OPS)) {
      const opIdx = mline.indexOf(cop);
      if (opIdx === -1) continue;

      // Skip if inside a string or comment (masked chars are spaces, but the
      // compound op chars themselves must survive masking to be visible here)
      if (mline[opIdx] === " ") continue;

      // Find end of LHS: scan backward from opIdx, skip leading whitespace
      let lhsEnd = opIdx;
      while (lhsEnd > 0 && mline[lhsEnd - 1] === " ") lhsEnd--;

      // Scan backward to find start of LHS expression
      // Valid LHS chars (outside brackets): A-Z a-z 0-9 _ .
      // Inside [...] (tracked by depth) include everything
      let lhsStart = lhsEnd;
      let depth = 0;
      while (lhsStart > 0) {
        const c = mline[lhsStart - 1];
        if (c === "]") { depth++; lhsStart--; }
        else if (c === "[") { depth--; lhsStart--; }
        else if (depth > 0) { lhsStart--; }
        else if (/[A-Za-z0-9_.]/.test(c)) { lhsStart--; }
        else break;
      }

      // Get actual LHS from original (not masked) source
      const lhs = line.slice(lhsStart, lhsEnd).trim();
      // LHS must start with an identifier char — reject spaced/bracket-only forms
      if (!lhs || !/^[A-Za-z_]/.test(lhs)) continue;

      // Indentation prefix (everything before LHS)
      const prefix = line.slice(0, lhsStart);

      // RHS: everything after the compound op token (may include trailing comment)
      const rhsFull = line.slice(opIdx + cop.length).trimStart();

      // Separate trailing line comment from RHS so it doesn't end up inside parens:
      // `x += 1 -- note` → `x = x + (1) -- note`
      // Use maskStringsOnly (not maskStringsAndComments) so "--" is still visible after masking.
      const maskedRhs = maskStringsOnly(rhsFull);
      const commentIdx = maskedRhs.indexOf("--");
      const rhsExpr = commentIdx !== -1 ? rhsFull.slice(0, commentIdx).trimEnd() : rhsFull;
      const trailingComment = commentIdx !== -1 ? " " + rhsFull.slice(commentIdx) : "";

      return `${prefix}${lhs} = ${lhs} ${bop} (${rhsExpr})${trailingComment}`;
    }

    return line;
  }).join("\n");
}

export function parseLuau(source: string): Program {
  // Apply preprocessors in order before luaparse
  const preprocessed = preprocessUnicode(preprocessCompoundAssignment(source));
  const raw = luaparse.parse(preprocessContinue(preprocessed), {
    luaVersion: "5.2",
    scope: false,
    locations: false,
    ranges: false,
    comments: false,
    encodingMode: "pseudo-latin1",
  });
  const normalized = normalizeNode(raw);
  return {
    type: "Program",
    body: normalized.body || [],
  };
}
