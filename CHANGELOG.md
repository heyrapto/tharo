# Changelog

All notable changes to this project will be documented in this file.

## [1.0.1] - 2026-05-08

### Added
- Comprehensive test suite for all core modules (`Intent`, `Entities`, `Guard`, `Patterns`, `Processor`).
- Explicit ESM support for Jest using `ts-jest` and `--experimental-vm-modules`.
- GitHub Actions workflow for automated testing and NPM publishing.
- Provenance support for secure NPM releases.

### Changed
- Refactored core utilities to use PascalCase exports (`Intent`, `Guard`, etc.) for better consistency.
- Updated `tsconfig.json` with `isolatedModules: true` for better ESM compatibility.
- Hardened CI/CD authentication logic to ensure reliable publishing.

### Fixed
- Resolved "No tests found" error in CI.
- Fixed PII redaction logic for 10-digit phone numbers.
- Improved repository metadata in `package.json`.
