# Project Rules: TinyMDE

## Goal & Architecture
- **TinyMDE** is a lightweight, zero-dependency, framework-agnostic drop-in Markdown editor written in TypeScript (inspired by TinyMCE).
- Public entry point: `TinyMDE.init({ selector: '...' })`.
- **Zero runtime dependencies**: Do NOT install external Markdown parsers (like `marked`) or UI libraries. Write clean, modular vanilla TypeScript and CSS.
- **Build & Test**: Vite (Library Mode, outputting `tinymde.js` and `tinymde.umd.cjs`) + Vitest for unit tests. Every feature MUST include corresponding unit tests in `tests/`.

## Git & Open Source Standards (Strict)
- Every task must be broken down into small, atomic, logical Git commits (e.g., separate commits for core logic, UI/CSS, and tests).
- Use Conventional Commits (`feat:`, `fix:`, `test:`, `docs:`, `refactor:`).
- Never bundle an entire month's work into a single giant commit.
- Keep `README.md` and `CHANGELOG.md` updated with every release tag (`v0.1.0`, `v0.2.0`, etc.).