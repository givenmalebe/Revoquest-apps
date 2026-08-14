/**
 * Fix AI-generated practice HTML:
 * - Dead "View Solutions" links become a native <details> toggle when answers exist
 * - Otherwise the dead link is removed
 */

const SOLUTIONS_LABEL = /view solutions|self-check|see answers|show answers|answer key/i;

function isSolutionsTrigger(el: Element): boolean {
  const cls = (el.getAttribute('class') || '').toLowerCase();
  if (cls.includes('solutions-link')) return true;
  const text = (el.textContent || '').trim();
  if (!SOLUTIONS_LABEL.test(text)) return false;
  const tag = el.tagName.toLowerCase();
  return tag === 'a' || tag === 'u' || tag === 'button' || cls.includes('solutions');
}

function extractAnswersHtml(container: Element, trigger: Element): string {
  const candidates = Array.from(
    container.querySelectorAll(
      '.solutions, .practice-answers, .answer-key, .practice-solutions, [class*="solution"]'
    )
  ).filter((node) => node !== trigger && !trigger.contains(node));

  if (candidates.length > 0) {
    return candidates.map((n) => n.innerHTML).join('');
  }

  // Hidden blocks after the link (common AI pattern)
  let sibling = trigger.nextElementSibling;
  const chunks: string[] = [];
  while (sibling) {
    const style = (sibling.getAttribute('style') || '').toLowerCase();
    const hidden =
      sibling.hasAttribute('hidden') ||
      style.includes('display:none') ||
      style.includes('display: none');
    const looksLikeAnswers = SOLUTIONS_LABEL.test(sibling.textContent || '') || hidden;
    if (looksLikeAnswers || sibling.tagName.toLowerCase() === 'ol' || sibling.tagName.toLowerCase() === 'ul') {
      chunks.push(sibling.innerHTML || sibling.outerHTML);
      const next = sibling.nextElementSibling;
      sibling.remove();
      sibling = next;
      continue;
    }
    break;
  }
  return chunks.join('');
}

export function sanitizePracticeHtml(html: string): string {
  if (!html || typeof DOMParser === 'undefined') return html;

  try {
    const doc = new DOMParser().parseFromString(`<div id="__lesson_root">${html}</div>`, 'text/html');
    const root = doc.getElementById('__lesson_root');
    if (!root) return html;

    const triggers = Array.from(root.querySelectorAll('a, button, span, p, div, u, em, strong')).filter(isSolutionsTrigger);

    for (const trigger of triggers) {
      if (trigger.closest('details.practice-solutions')) continue;

      const container =
        trigger.closest('.challenge-set, .practice-opportunities, section') || trigger.parentElement || root;
      const answersHtml = extractAnswersHtml(container, trigger);

      if (answersHtml.trim()) {
        const details = doc.createElement('details');
        details.className = 'practice-solutions';
        details.innerHTML = `<summary>View solutions (self-check)</summary><div class="practice-solutions-body">${answersHtml}</div>`;
        trigger.replaceWith(details);
      } else {
        trigger.remove();
      }
    }

    return root.innerHTML;
  } catch {
    return html;
  }
}
