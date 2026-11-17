# TinyMDE 📝

A lightweight, zero-dependency, framework-agnostic drop-in Markdown editor written in TypeScript. Inspired by the ease of TinyMCE, TinyMDE provides live split-screen preview, an integrated toolbar, and instant synchronization with original HTML `<textarea>` elements.

[![CI](https://github.com/max-w-a-r-e/TinyMDE/actions/workflows/ci.yml/badge.svg)](https://github.com/max-w-a-r-e/TinyMDE/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Highlights

- **Zero Runtime Dependencies**: Pure TypeScript and CSS, no bulky third-party parsing or UI packages.
- **Framework Agnostic**: Works with vanilla JavaScript, React, Vue, Svelte, or server-rendered HTML.
- **Drop-in Replacement**: Initializes with one function call (`TinyMDE.init()`), keeping your existing form submission workflow intact.
- **Auto-Sync**: Automatically updates the underlying `<textarea>` on every edit, emitting standard `input` and `change` events.
- **Live Split-Screen Preview**: Real-time rendering alongside the editing pane.
- **Custom Fast Parser**: Hand-crafted line/regex parser supporting headings (# to ###), bold, italic, inline code, fenced code blocks, links, and lists with built-in HTML escaping.

---

## Quick Start

### 1. Include CSS and Script

```html
<link rel="stylesheet" href="tinymde/styles.css" />
<script type="module">
  import { TinyMDE } from 'tinymde';

  TinyMDE.init({
    selector: '#my-markdown-editor',
    preview: true
  });
</script>
```

### 2. Markup

```html
<form action="/submit" method="POST">
  <textarea id="my-markdown-editor" name="content">
# Welcome to TinyMDE

Start typing your **markdown** content here!
  </textarea>
  <button type="submit">Save</button>
</form>
```

---

## API Reference

### `TinyMDE.init(options: TinyMDEOptions): TinyMDEEditor`

Initializes TinyMDE on the target element.

#### Options

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `selector` | `string \| HTMLTextAreaElement` | *Required* | CSS selector or DOM element reference for the source `<textarea>`. |
| `preview` | `boolean` | `true` | Whether to display the live split-screen preview pane. |
| `placeholder` | `string` | `""` | Placeholder text displayed when editor is empty. |

#### Return Value: `TinyMDEEditor`

The returned instance provides programmatic control:

- `editor.getContent(): string`: Retrieves current markdown text.
- `editor.setContent(markdown: string): void`: Sets editor content and updates both preview and target `<textarea>`.
- `editor.togglePreview(visible?: boolean): void`: Toggles or sets preview visibility.
- `editor.insertMarkdown(prefix: string, suffix?: string, defaultText?: string): void`: Wraps current selection or inserts markdown syntax.
- `editor.destroy(): void`: Restores original `<textarea>` and cleans up DOM event listeners.

---

## Development & Testing

```bash
# Clone the repository
git clone https://github.com/max-w-a-r-e/TinyMDE.git
cd tinymde

# Install dev dependencies
npm install

# Run unit test suite
npm test

# Run build (produces ESM & UMD bundles in dist/)
npm run build
```

---

## License

MIT © 2026 TinyMDE Contributors. See [LICENSE](LICENSE) for details.
