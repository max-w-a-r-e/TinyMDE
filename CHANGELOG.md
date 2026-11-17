# Changelog

All notable changes to TinyMDE will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-11-17

### Added
- Initial release of TinyMDE (MVP).
- `TinyMDE.init({ selector, preview })` API replacing `<textarea>` elements and auto-syncing content back to the source element.
- Lightweight, zero-dependency Markdown parser supporting:
  - Headings (`#`, `##`, `###`)
  - Bold (`**text**`, `__text__`)
  - Italic (`*text*`, `_text_`)
  - Inline code (`` `code` ``)
  - Fenced code blocks (` ``` `)
  - Hyperlinks (`[text](url)`)
  - Unordered (`-`, `*`) and ordered (`1.`) lists
  - Automatic HTML escaping to mitigate XSS
- Split-screen live preview mode (editor on the left, rendered HTML preview on the right).
- Toolbar with action buttons for quick formatting (Headings, Bold, Italic, Code, Link, List) and preview toggle.
- Clean CSS styling for the editor container, toolbar, split panes, and rendered preview.
- Comprehensive Vitest test suite for the Markdown parser.
- Interactive demo showcase in `demo/index.html`.
