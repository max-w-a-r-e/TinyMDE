import { describe, it, expect } from 'vitest';
import { parseMarkdown, parseInline, escapeHtml } from '../src/core/parser';

describe('Markdown Parser', () => {
  describe('HTML Escaping & Security', () => {
    it('escapes raw HTML tags to prevent XSS', () => {
      const raw = '<script>alert("xss")</script>';
      expect(escapeHtml(raw)).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });

    it('neutralizes javascript: in links', () => {
      const md = '[Dangerous](javascript:alert(1))';
      const html = parseMarkdown(md);
      expect(html).toContain('href="#"');
      expect(html).not.toContain('javascript:alert(1)');
    });

    it('neutralizes vbscript: and data: links', () => {
      expect(parseMarkdown('[vb](vbscript:msgbox)')).toContain('href="#"');
      expect(parseMarkdown('[data](data:text/html,<script>)')).toContain('href="#"');
    });
  });

  describe('Headings (# to ###)', () => {
    it('parses h1, h2, and h3 correctly', () => {
      const md = '# Heading 1\n## Heading 2\n### Heading 3';
      const html = parseMarkdown(md);
      expect(html).toContain('<h1>Heading 1</h1>');
      expect(html).toContain('<h2>Heading 2</h2>');
      expect(html).toContain('<h3>Heading 3</h3>');
    });

    it('parses inline markdown inside headings', () => {
      const md = '## Heading with **bold** and `code`';
      const html = parseMarkdown(md);
      expect(html).toBe('<h2>Heading with <strong>bold</strong> and <code>code</code></h2>');
    });
  });

  describe('Inline Styling (Bold, Italic, Code, Links)', () => {
    it('parses bold using asterisks and underscores', () => {
      expect(parseInline('**bold asterisks**')).toBe('<strong>bold asterisks</strong>');
      expect(parseInline('__bold underscores__')).toBe('<strong>bold underscores</strong>');
    });

    it('parses italic using asterisks and underscores', () => {
      expect(parseInline('*italic asterisks*')).toBe('<em>italic asterisks</em>');
      expect(parseInline('_italic underscores_')).toBe('<em>italic underscores</em>');
    });

    it('parses combined bold and italic', () => {
      expect(parseInline('***bold and italic***')).toBe('<strong><em>bold and italic</em></strong>');
    });

    it('parses inline code without formatting its content', () => {
      const result = parseInline('Use `**not bold**` here');
      expect(result).toBe('Use <code>**not bold**</code> here');
    });

    it('parses markdown hyperlinks with security attributes', () => {
      const result = parseInline('[TinyMDE](https://example.com)');
      expect(result).toBe(
        '<a href="https://example.com" target="_blank" rel="noopener noreferrer">TinyMDE</a>'
      );
    });
  });

  describe('Code Blocks', () => {
    it('parses fenced code blocks without language tag', () => {
      const md = '```\nconst a = 10;\nconst b = 20;\n```';
      const html = parseMarkdown(md);
      expect(html).toBe('<pre><code>const a = 10;\nconst b = 20;</code></pre>');
    });

    it('parses fenced code blocks with language tag', () => {
      const md = '```typescript\nfunction hello(): void {}\n```';
      const html = parseMarkdown(md);
      expect(html).toBe('<pre><code class="language-typescript">function hello(): void {}</code></pre>');
    });

    it('escapes HTML within code blocks', () => {
      const md = '```html\n<div>Hello</div>\n```';
      const html = parseMarkdown(md);
      expect(html).toBe('<pre><code class="language-html">&lt;div&gt;Hello&lt;/div&gt;</code></pre>');
    });
  });

  describe('Lists', () => {
    it('parses unordered lists with dashes and asterisks', () => {
      const md = '- Item 1\n- Item 2\n* Item 3';
      const html = parseMarkdown(md);
      expect(html).toBe('<ul>\n<li>Item 1</li>\n<li>Item 2</li>\n<li>Item 3</li>\n</ul>');
    });

    it('parses ordered lists', () => {
      const md = '1. First step\n2. Second step\n3. Third step';
      const html = parseMarkdown(md);
      expect(html).toBe('<ol>\n<li>First step</li>\n<li>Second step</li>\n<li>Third step</li>\n</ol>');
    });

    it('closes list on paragraph transition', () => {
      const md = '- Item 1\n\nParagraph after list';
      const html = parseMarkdown(md);
      expect(html).toBe('<ul>\n<li>Item 1</li>\n</ul>\n<p>Paragraph after list</p>');
    });
  });

  describe('Blockquotes & Horizontal Rules', () => {
    it('parses blockquotes', () => {
      const md = '> Quoted wisdom';
      expect(parseMarkdown(md)).toBe('<blockquote><p>Quoted wisdom</p></blockquote>');
    });

    it('parses horizontal rules', () => {
      expect(parseMarkdown('---')).toBe('<hr />');
      expect(parseMarkdown('***')).toBe('<hr />');
    });
  });

  describe('Paragraphs & Complex Documents', () => {
    it('wraps standalone lines in paragraphs', () => {
      const md = 'This is a single paragraph.';
      expect(parseMarkdown(md)).toBe('<p>This is a single paragraph.</p>');
    });

    it('separates paragraphs across empty lines', () => {
      const md = 'Paragraph 1\n\nParagraph 2';
      expect(parseMarkdown(md)).toBe('<p>Paragraph 1</p>\n<p>Paragraph 2</p>');
    });

    it('handles empty string gracefully', () => {
      expect(parseMarkdown('')).toBe('');
    });

    it('renders a full markdown document correctly', () => {
      const doc = `# TinyMDE
A **lightweight** markdown editor.

## Features
- Zero dependencies
- Fast parser
- *Split-screen* preview

\`\`\`javascript
TinyMDE.init({ selector: '#editor' });
\`\`\`

Visit [Docs](https://example.com) for more!`;

      const html = parseMarkdown(doc);
      expect(html).toContain('<h1>TinyMDE</h1>');
      expect(html).toContain('<strong>lightweight</strong>');
      expect(html).toContain('<h2>Features</h2>');
      expect(html).toContain('<ul>');
      expect(html).toContain('<li>Zero dependencies</li>');
      expect(html).toContain('<li>Fast parser</li>');
      expect(html).toContain('<li><em>Split-screen</em> preview</li>');
      expect(html).toContain('</ul>');
      expect(html).toContain('<pre><code class="language-javascript">TinyMDE.init({ selector: &#39;#editor&#39; });</code></pre>');
      expect(html).toContain('<a href="https://example.com" target="_blank" rel="noopener noreferrer">Docs</a>');
    });
  });
});
