import React from 'react';

/** Detect if a line looks like a section heading (all caps, ends with colon, or known keywords) */
function isHeaderLine(line: string): boolean {
  const t = line.trim();
  if (t.length < 4 || t.length > 120) return false;
  const upper = t.toUpperCase();
  const capsRatio = (upper.match(/[A-Z]/g)?.length ?? 0) / t.length;
  if (/^(INSTRUCTIONS|SECTION\s|QUESTION\s|\d+\.\d+\s|READ\s+THE\s+FOLLOWING|LEARNING\s+OBJECTIVES|EXAM\s+SPECIFICATIONS)/i.test(t)) return true;
  if (/^\d+\.\s+\S/.test(t) && t.length < 100) return true;
  if (t.endsWith(':') && (capsRatio > 0.5 || t.length < 60)) return true;
  if (capsRatio > 0.75 && t.length >= 12) return true;
  return false;
}

/**
 * When content has no double-newline structure, split by header-like lines so we get headings + paragraphs.
 */
function ensureStructuredContent(content: string): string {
  const trimmed = content.trim();
  if (!trimmed) return content;
  const hasParagraphBreaks = /\n\s*\n/.test(trimmed);
  if (hasParagraphBreaks) return content;
  const lines = trimmed.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length <= 1) return content;
  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (isHeaderLine(lines[i])) {
      if (out.length > 0 && out[out.length - 1] !== '') out.push('');
      out.push(lines[i]);
      out.push('');
    } else {
      const prev = out[out.length - 1];
      if (prev !== '' && prev !== undefined) out[out.length - 1] = prev + '\n' + lines[i];
      else out.push(lines[i]);
    }
  }
  return out.join('\n');
}

/**
 * Parses plain-text course content and renders it with structured HTML/CSS.
 * Detects paragraphs, lists (bullet + numbered), tables, and subheadings.
 */
function parseBlocks(content: string): { type: 'paragraph' | 'list' | 'table' | 'heading'; lines: string[]; listOrdered?: boolean }[] {
  if (!content?.trim()) return [];
  let normalized = ensureStructuredContent(content);
  const blocks: { type: 'paragraph' | 'list' | 'table' | 'heading'; lines: string[]; listOrdered?: boolean }[] = [];
  let rawBlocks = normalized.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  // If we still have one big block with many lines, force structure by header detection
  if (rawBlocks.length === 1 && rawBlocks[0].includes('\n') && rawBlocks[0].length > 300) {
    normalized = ensureStructuredContent(rawBlocks[0]);
    rawBlocks = normalized.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  }

  for (const raw of rawBlocks) {
    const lines = raw.split('\n').map((l) => l.trimEnd());
    if (lines.length === 0) continue;

    const bulletMatch = lines.every((l) => /^\s*[-*•]\s+/.test(l) || /^\s*[-*•]\s*$/.test(l));
    const numberedMatch = lines.every((l) => /^\s*\d+[.)]\s+/.test(l) || /^\s*\d+[.)]\s*$/.test(l));
    if (bulletMatch && lines.length >= 1) {
      blocks.push({ type: 'list', lines, listOrdered: false });
      continue;
    }
    if (numberedMatch && lines.length >= 1) {
      blocks.push({ type: 'list', lines, listOrdered: true });
      continue;
    }

    // Table: multiple columns separated by 2+ spaces; at least 2 rows
    const splitBySpaces = (line: string) => line.split(/\s{2,}/).map((c) => c.trim()).filter(Boolean);
    const rowCols = lines.map(splitBySpaces);
    const colCounts = rowCols.map((r) => r.length);
    const multiCol = colCounts.every((c) => c >= 2) && colCounts.length >= 2;
    if (multiCol && lines.length >= 2) {
      blocks.push({ type: 'table', lines: rowCols.map((cells) => cells.join('\t')) });
      continue;
    }

    // Single short line -> subheading (markdown ##, numbered section "1. Title", or short title)
    if (lines.length === 1) {
      const line = lines[0];
      const isMarkdownHeading = /^#{1,3}\s+/.test(line);
      const isNumberedSection = /^\d+\.\s+\S/.test(line) && line.length < 120 && !/[.!?]$/.test(line);
      const shortLine = line.length < 80 && !/[.!?]$/.test(line) && line.length > 0;
      if (isMarkdownHeading) {
        blocks.push({ type: 'heading', lines: [line.replace(/^#{1,3}\s+/, '')] });
        continue;
      }
      if (isNumberedSection || (shortLine && /^[A-Z0-9]/.test(line))) {
        blocks.push({ type: 'heading', lines: [line] });
        continue;
      }
    }

    blocks.push({ type: 'paragraph', lines });
  }
  return blocks;
}

function parseTableLines(lines: string[]): { header: string[]; rows: string[][] } {
  const rows = lines.map((l) => l.split('\t').map((c) => c.trim()));
  if (rows.length === 0) return { header: [], rows: [] };
  return { header: rows[0], rows: rows.slice(1) };
}

/** Renders text with **bold** as <strong> */
function renderWithBold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    const match = part.match(/^\*\*(.+)\*\*$/);
    if (match) return <strong key={i} className="font-semibold text-slate-900 dark:text-slate-100">{match[1]}</strong>;
    return part;
  });
}

export interface CourseContentRendererProps {
  content: string;
  className?: string;
}

export const CourseContentRenderer: React.FC<CourseContentRendererProps> = ({ content, className = '' }) => {
  const blocks = parseBlocks(content);
  if (blocks.length === 0) {
    return (
      <div className={`text-slate-600 dark:text-slate-400 text-sm ${className}`}>
        <p className="whitespace-pre-wrap">{content || 'No content.'}</p>
      </div>
    );
  }

  return (
    <section
      className={`course-lesson-content course-content space-y-6 ${className}`}
      aria-label="Lesson content"
    >
      {blocks.map((block, idx) => {
        if (block.type === 'paragraph') {
          return (
            <div key={idx} className="course-lesson-paragraphs space-y-2">
              {block.lines.map((line, i) => (
                <p key={i} className="course-lesson-text text-slate-700 dark:text-slate-300 leading-relaxed">
                  {renderWithBold(line)}
                </p>
              ))}
            </div>
          );
        }
        if (block.type === 'heading') {
          const isFirstInDoc = idx === 0;
          return (
            <h3
              key={idx}
              className={`course-lesson-heading font-bold text-blue-700 dark:text-blue-400 mt-6 mb-2 first:mt-0 ${
                isFirstInDoc ? 'text-lg border-b-2 border-blue-200 dark:border-blue-800 pb-2' : 'text-base border-b border-slate-200 dark:border-slate-700 pb-1.5'
              }`}
            >
              {renderWithBold(block.lines[0])}
            </h3>
          );
        }
        if (block.type === 'list') {
          const Tag = block.listOrdered ? 'ol' : 'ul';
          const listStyle = block.listOrdered ? 'list-decimal' : 'list-disc';
          return (
            <Tag key={idx} className={`course-lesson-list ${listStyle} list-outside pl-6 space-y-2 text-slate-700 dark:text-slate-300 text-[15px]`}>
              {block.lines.map((line, i) => {
                const text = line.replace(/^\s*[-*•]\s+/, '').replace(/^\s*\d+[.)]\s+/, '');
                return (
                  <li key={i} className="pl-1 leading-relaxed">
                    {renderWithBold(text)}
                  </li>
                );
              })}
            </Tag>
          );
        }
        if (block.type === 'table') {
          const { header, rows } = parseTableLines(block.lines);
          if (header.length === 0) return null;
          return (
            <div key={idx} className="course-lesson-table overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 my-4">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/80">
                    {header.map((cell, i) => (
                      <th key={i} className="text-left font-semibold text-slate-800 dark:text-slate-200 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                        {cell}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, ri) => (
                    <tr key={ri} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      {header.map((_, ci) => (
                        <td key={ci} className="px-4 py-2.5 text-slate-700 dark:text-slate-300">
                          {row[ci] ?? ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        return null;
      })}
    </section>
  );
};

export default CourseContentRenderer;
