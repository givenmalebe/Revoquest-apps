/**
 * Helpers for parsing model JSON that may contain unescaped control characters
 * or extra prose around the object.
 */

/** First `{` … matching `}` outside of strings. */
export function extractBalancedJsonObject(s: string): string | null {
  const start = s.indexOf('{');
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (c === '\\' && inString) {
      escape = true;
      continue;
    }
    if (c === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) return s.slice(start, i + 1);
    }
  }
  return null;
}

/**
 * JSON.parse rejects raw U+0000–U+001F inside string literals. Escape them only inside "..." values.
 * Also fixes invalid JSON escape sequences (e.g. \p, \#) that models sometimes produce.
 */
export function escapeIllegalControlCharsInJsonStrings(input: string): string {
  let out = '';
  let inString = false;
  let escape = false;
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (!inString) {
      out += c;
      if (c === '"') inString = true;
      continue;
    }
    if (escape) {
      if ('"\\/bfnrtu'.includes(c)) {
        out += c;
      } else {
        out += c;
      }
      escape = false;
      continue;
    }
    if (c === '\\') {
      out += c;
      escape = true;
      continue;
    }
    if (c === '"') {
      out += c;
      inString = false;
      continue;
    }
    const code = c.charCodeAt(0);
    if (code >= 32) {
      out += c;
      continue;
    }
    if (code === 9) {
      out += '\\t';
      continue;
    }
    if (code === 10) {
      out += '\\n';
      continue;
    }
    if (code === 13) {
      out += '\\r';
      continue;
    }
    out += ' ';
  }
  return out;
}

export function fixInvalidJsonEscapes(input: string): string {
  return input.replace(/\\(?!["\\\/bfnrtu])/g, '');
}
