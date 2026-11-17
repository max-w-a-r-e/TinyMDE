/**
 * TinyMDE Lightweight Markdown Parser
 * Zero-dependency, line- and regex-based markdown to HTML converter.
 */

export interface ParserOptions {
  sanitize?: boolean;
}

/**
 * Escapes potentially dangerous HTML characters.
 */
export function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
}

/**
 * Sanitizes URLs to avoid XSS via `javascript:` or `vbscript:` schemes.
 */
function sanitizeUrl(url: string): string {
  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();
  if (lower.startsWith('javascript:') || lower.startsWith('vbscript:') || lower.startsWith('data:text/html')) {
    return '#';
  }
  return escapeHtml(trimmed);
}

/**
 * Parses inline markdown: inline code, bold, italic, and links.
 */
export function parseInline(text: string): string {
  // Store code tokens so nested formatting is not executed inside inline code
  const codeTokens: string[] = [];
  let processed = text.replace(/`([^`]+)`/g, (_, code) => {
    const token = `\uE000CODETOKEN${codeTokens.length}\uE000`;
    codeTokens.push(`<code>${escapeHtml(code)}</code>`);
    return token;
  });

  // Escape remaining raw HTML
  processed = escapeHtml(processed);

  // Links: [text](url)
  processed = processed.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_, linkText, url) => {
      const cleanUrl = sanitizeUrl(url);
      return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
    }
  );

  // Bold & Italic: ***text*** or ___text___
  processed = processed.replace(
    /(\*\*\*|___)(.*?)\1/g,
    '<strong><em>$2</em></strong>'
  );

  // Bold: **text** or __text__
  processed = processed.replace(
    /(\*\*|__)(.*?)\1/g,
    '<strong>$2</strong>'
  );

  // Italic: *text* or _text_
  processed = processed.replace(
    /(\*|_)(.*?)\1/g,
    '<em>$2</em>'
  );

  // Restore inline code tokens
  processed = processed.replace(/\uE000CODETOKEN(\d+)\uE000/g, (_, index) => {
    return codeTokens[Number(index)] || '';
  });

  return processed;
}

/**
 * Parses markdown text into HTML string.
 */
export function parseMarkdown(markdown: string): string {
  if (!markdown || typeof markdown !== 'string') {
    return '';
  }

  const lines = markdown.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const result: string[] = [];

  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeBlockLines: string[] = [];

  let listType: 'ul' | 'ol' | null = null;
  let paragraphLines: string[] = [];

  const flushParagraph = () => {
    if (paragraphLines.length > 0) {
      const pContent = paragraphLines.map((line) => parseInline(line)).join('<br />');
      result.push(`<p>${pContent}</p>`);
      paragraphLines = [];
    }
  };

  const closeList = () => {
    if (listType) {
      result.push(`</${listType}>`);
      listType = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for fenced code block toggle
    const codeBlockMatch = line.match(/^```(\w*)/);
    if (codeBlockMatch) {
      if (inCodeBlock) {
        // Closing code block
        const escapedContent = escapeHtml(codeBlockLines.join('\n'));
        const langClass = codeBlockLang ? ` class="language-${escapeHtml(codeBlockLang)}"` : '';
        result.push(`<pre><code${langClass}>${escapedContent}</code></pre>`);
        inCodeBlock = false;
        codeBlockLines = [];
        codeBlockLang = '';
      } else {
        // Opening code block
        flushParagraph();
        closeList();
        inCodeBlock = true;
        codeBlockLang = codeBlockMatch[1] || '';
        codeBlockLines = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // Blank line
    if (line.trim() === '') {
      flushParagraph();
      closeList();
      continue;
    }

    // Horizontal Rule: ---, ***, ___
    if (/^(\-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      flushParagraph();
      closeList();
      result.push('<hr />');
      continue;
    }

    // Headings: #, ##, ### (and ####, #####, ######)
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      closeList();
      const level = headingMatch[1].length;
      const text = parseInline(headingMatch[2].trim());
      result.push(`<h${level}>${text}</h${level}>`);
      continue;
    }

    // Blockquote: > text
    const blockquoteMatch = line.match(/^>\s?(.*)$/);
    if (blockquoteMatch) {
      flushParagraph();
      closeList();
      const quoteText = parseInline(blockquoteMatch[1]);
      result.push(`<blockquote><p>${quoteText}</p></blockquote>`);
      continue;
    }

    // Unordered List: - text or * text
    const ulMatch = line.match(/^[\*\-]\s+(.*)$/);
    if (ulMatch) {
      flushParagraph();
      if (listType !== 'ul') {
        closeList();
        result.push('<ul>');
        listType = 'ul';
      }
      result.push(`<li>${parseInline(ulMatch[1])}</li>`);
      continue;
    }

    // Ordered List: 1. text
    const olMatch = line.match(/^\d+\.\s+(.*)$/);
    if (olMatch) {
      flushParagraph();
      if (listType !== 'ol') {
        closeList();
        result.push('<ol>');
        listType = 'ol';
      }
      result.push(`<li>${parseInline(olMatch[1])}</li>`);
      continue;
    }

    // Regular line in paragraph
    closeList();
    paragraphLines.push(line);
  }

  // Handle any remaining unclosed elements
  if (inCodeBlock) {
    const escapedContent = escapeHtml(codeBlockLines.join('\n'));
    const langClass = codeBlockLang ? ` class="language-${escapeHtml(codeBlockLang)}"` : '';
    result.push(`<pre><code${langClass}>${escapedContent}</code></pre>`);
  }

  flushParagraph();
  closeList();

  return result.join('\n');
}
