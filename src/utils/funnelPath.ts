/** True when served from the revolearn.co.za domain (funnel-only brand site). */
export const isRevolearnDomain =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'revolearn.co.za' ||
    window.location.hostname.endsWith('.revolearn.co.za'));

/**
 * Returns the correct funnel path for the current domain.
 * On revolearn.co.za the funnel lives at root paths (e.g. "/about"),
 * everywhere else it lives under "/funnel" (e.g. "/funnel/about").
 */
export function funnelPath(path: string = ''): string {
  if (isRevolearnDomain) {
    return path === '/' ? '/' : path;
  }
  return `/funnel${path}`;
}
