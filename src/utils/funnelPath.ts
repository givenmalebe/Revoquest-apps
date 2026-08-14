/** True when served from the revolearn.co.za domain (funnel-only brand site). */
export const isRevolearnDomain =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'revolearn.co.za' ||
    window.location.hostname.endsWith('.revolearn.co.za') ||
    window.location.hostname === 'revolearn-redirect.web.app');

/**
 * Returns the correct funnel path for the current domain.
 * On revolearn.co.za the funnel lives at root paths (e.g. "/about"),
 * everywhere else it lives under "/funnel" (e.g. "/funnel/about").
 *
 * Always returns a non-empty absolute path starting with "/".
 */
export function funnelPath(path: string = ''): string {
  const normalized =
    !path || path === '/'
      ? ''
      : path.startsWith('/')
        ? path
        : `/${path}`;

  if (isRevolearnDomain) {
    return normalized || '/';
  }
  return normalized ? `/funnel${normalized}` : '/funnel';
}

const LEARNER_HOME_KEY = 'revo_learner_home';

/** Remember which LMS home the learner came from (funnel dashboard vs /lms). */
export function setLearnerHomePath(path: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(LEARNER_HOME_KEY, path);
  } catch {
    // ignore
  }
}

/** Learner home (dashboard) for the current brand/context. */
export function learnerHomePath(query: string = ''): string {
  const q = query.startsWith('?') || query === '' ? query : `?${query}`;
  if (typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem(LEARNER_HOME_KEY);
      if (stored) return `${stored}${q}`;
    } catch {
      // ignore
    }
  }
  if (isRevolearnDomain) {
    return `${funnelPath('/dashboard')}${q}`;
  }
  return `/lms${q}`;
}

/** AI Tutor route (same on all domains). */
export function aiTutorPath(query: string = ''): string {
  const q = query.startsWith('?') || query === '' ? query : `?${query}`;
  return `/ai-tutor${q}`;
}
