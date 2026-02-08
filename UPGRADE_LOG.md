# Dependency Upgrade Log

**Date:** 2026-02-08  |  **Project:** frankentui-website  |  **Language:** Node.js (Bun)

## Summary
- **Updated:** 3  |  **Skipped:** 1  |  **Failed:** 0

## Updates

### react: 19.2.3 → 19.2.4
- **Breaking:** None (patch - security hardening for Server Actions/Components)
- **Build:** Passed
- **Lint:** Passed

### react-dom: 19.2.3 → 19.2.4
- **Breaking:** None (same release as react)
- **Build:** Passed
- **Lint:** Passed

### @types/node: 20.19.33 → 24.10.12
- **Breaking:** None for this project
- **Notes:** Aligned with runtime Node.js v24.12.0 (was mismatched at v20)
- **Build:** Passed
- **Lint:** Passed
- **Type-check:** Pre-existing test file errors unchanged

## Skipped

### eslint: 9.39.2 → 10.0.0
- **Reason:** eslint-plugin-react (transitive dep via eslint-config-next) uses removed `getFilename()` API
- **Error:** `TypeError: contextOrFilename.getFilename is not a function`
- **Tracked:** https://github.com/jsx-eslint/eslint-plugin-react/issues/3970
- **Action:** Rolled back to 9.39.2. Retry when eslint-plugin-react releases ESLint 10 support.
