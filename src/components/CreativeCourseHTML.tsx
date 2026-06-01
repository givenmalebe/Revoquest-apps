import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';
import '@/styles/creative-course.css';

const ALLOWED_TAGS = [
  'article', 'section', 'div', 'p', 'br', 'h1', 'h2', 'h3', 'h4', 'strong', 'em', 'b', 'i',
  'ul', 'ol', 'li', 'blockquote', 'span', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'details', 'summary'
];
const ALLOWED_ATTR = ['class', 'id'];

export interface CreativeCourseHTMLProps {
  html: string;
  /** Use light palette when app is in light mode */
  lightMode?: boolean;
  className?: string;
}

/**
 * Renders AI-generated course HTML inside a creative, scoped layout. HTML is sanitized.
 */
export const CreativeCourseHTML: React.FC<CreativeCourseHTMLProps> = ({
  html,
  lightMode = false,
  className = ''
}) => {
  const safe = useMemo(() => {
    if (!html?.trim()) return '';
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS,
      ALLOWED_ATTR,
      KEEP_CONTENT: true
    });
  }, [html]);

  if (!safe.trim()) {
    return (
      <div className={`creative-course-root ${className}`}>
        <div className="cc-inner">
          <p className="text-slate-600">No lesson content.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`creative-course-root ${lightMode ? 'light-context' : ''} ${className}`}
      data-testid="creative-course-html"
    >
      <div className="cc-inner">
        <div className="cc-lesson" dangerouslySetInnerHTML={{ __html: safe }} />
      </div>
    </div>
  );
};

export default CreativeCourseHTML;
