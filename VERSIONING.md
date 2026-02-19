# Semantic Versioning Strategy

This project follows [Semantic Versioning 2.0.0](https://semver.org/) (SemVer) for version management.

## Version Format

Versions are specified as `MAJOR.MINOR.PATCH`:

1.  **MAJOR** version: Incremented when there are incompatible API changes.
2.  **MINOR** version: Incremented when functionality is added in a backwards compatible manner.
3.  **PATCH** version: Incremented when backwards compatible bug fixes are made.

Additional labels for pre-release and build metadata are available as extensions to the `MAJOR.MINOR.PATCH` format.

## Release Lifecycle

### 0.x.y (Initial Development)
- The project is currently in initial development.
- The API is not yet stable.
- Anything may change at any time.

### 1.0.0 (Public Release)
- Once the application is ready for production and feature-complete, it will be released as `1.0.0`.
- This version defines the first stable public API.

## Pre-release Versions
Pre-release versions may be denoted by appending a hyphen and a series of dot-separated identifiers immediately following the patch version (e.g., `1.0.0-alpha.1`, `1.0.0-rc.1`).

## Versioning Decisions for Group Chat App

- **Current State**: The application is close to feature-complete but requires final refinements.
- **Current Version**: `0.9.0`
- **Next Milestone**: `1.0.0` (Production Release)

## Update Process

1.  **Code Changes**: All changes should be merged into the main branch via Pull Requests.
2.  **Version Bump**: The version number in `package.json` must be updated according to the impact of the changes.
3.  **Changelog**: All significant changes should be documented in a `CHANGELOG.md` (if applicable) or in the release notes.
