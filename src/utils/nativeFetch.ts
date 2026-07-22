/**
 * Captures the browser's native `window.fetch` before any third-party scripts
 * (e.g. FingerprintJS BotD / frame_ant.js) can wrap or override it.
 *
 * Import this module as early as possible in the app entry point so the
 * reference is saved before any async script injection happens.
 */

const _nativeFetch: typeof window.fetch =
  typeof window !== 'undefined' ? window.fetch.bind(window) : (globalThis as any).fetch;

/** Use this instead of `window.fetch` for calls that must bypass interceptors. */
export function nativeFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  return _nativeFetch(input, init);
}
