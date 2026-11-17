# Contributing to TinyMDE

Thank you for your interest in contributing to TinyMDE!

## Development Guidelines

1. **Zero Runtime Dependencies**: TinyMDE has zero runtime dependencies. Please do not add runtime packages or external parsers.
2. **TypeScript & Modular Code**: All source code is written in clean, modular TypeScript under `src/`.
3. **Testing**: Every feature or bugfix must include corresponding unit tests in `tests/`.
4. **Git Standards**:
   - Keep commits small, focused, and atomic.
   - Use Conventional Commits (`feat:`, `fix:`, `test:`, `docs:`, `refactor:`).
   - Update `CHANGELOG.md` and `README.md` alongside notable changes and releases.

## Local Workflow

```bash
# Install development dependencies
npm install

# Run unit tests
npm test

# Build library artifacts (ESM & UMD)
npm run build
```

## Pull Request Process

1. Create a feature branch from `main`.
2. Ensure tests pass with `npm test` and build succeeds with `npm run build`.
3. Open a pull request describing the changes and referencing any related issues.
