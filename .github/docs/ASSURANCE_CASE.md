# Security Assurance Case

This assurance case explains why the project's documented security requirements are met.

## Security Review Record

- Review date: 2026-04-15
- Review scope: source code, CI workflows, and release artifacts
- Review basis: documented security requirements in [SECURITY.md](../../SECURITY.md)
- Security boundaries reviewed: remote network, filesystem, credentials, and release boundaries
- Reviewer: project maintainer

This review is within the last 5 years and is updated as part of release readiness and policy maintenance.

## Scope

This assurance case applies to the software in this repository, including source code, CI workflows, and release artifacts.

## Security Requirements Summary

Security requirements are documented in [SECURITY.md](../../SECURITY.md), including:

- Input validation for user-provided options and URLs
- Path traversal protections for downloaded filenames and output paths
- Coordinated vulnerability disclosure and response
- Security scanning in development workflows

## Threat Model

### Assets

- Local filesystem where downloaded images and metadata are written
- User-provided authentication cookies for premium access
- Integrity of published release artifacts

### Potential Attackers

- Remote content providers returning malformed or malicious HTML/URLs
- Adversaries attempting path traversal through crafted artwork titles or filenames
- Adversaries attempting to tamper with release artifacts

### Threats Considered

- Path traversal and unsafe file writes
- ReDoS or parser instability from untrusted content
- Credential leakage via source control or unsafe defaults
- Supply-chain compromise of release outputs

## Trust Boundaries

The following trust boundaries are explicitly recognized:

1. Remote network boundary:
- Data fetched from external services is untrusted until parsed and validated

2. Filesystem boundary:
- User and remote inputs must not be allowed to escape the configured download directory

3. Credentials boundary:
- Authentication cookies and secrets are external to source code and must be provided by users

4. Release boundary:
- Build/release output is trusted only after cryptographic signing and verification

## Secure Design Principles Applied

### Validate Inputs and Constrain Outputs

- Filenames are sanitized before use
- Paths are resolved and checked to remain within target directory
- Option handling uses explicit defaults and bounded behavior for retries

### Defense in Depth

- Filename sanitization plus safe path validation are both applied
- Security scanning and tests run in CI before release
- Release artifacts are signed and verification steps are documented

## Hardening Mechanisms Implemented

The project uses implementation-level hardening mechanisms so defects are less likely to become exploitable vulnerabilities.

### Input and Path Hardening

- Path traversal defenses in `sanitizeFilename()` and `safePath()`
- URL and option input validation in scraping and download flows

Evidence:

- [scraper.js](../../scraper.js)
- [__tests__/scraper.test.js](../../__tests__/scraper.test.js)

### Parser and Runtime Hardening

- ReDoS-resistant string parsing patterns for artist extraction
- Cryptographically secure jitter source via Node.js `crypto.randomBytes()`

Evidence:

- [scraper.js](../../scraper.js)
- [__tests__/fuzz.test.js](../../__tests__/fuzz.test.js)

### Delivery and Pipeline Hardening

- CI static analysis and fuzz testing
- Signed release artifacts and verification workflow

Evidence:

- [../workflows/ci.yml](../workflows/ci.yml)
- [../workflows/release.yml](../workflows/release.yml)
- [../RELEASE.md](../RELEASE.md)

### Least Privilege and Secret Separation

- No credentials are stored in repository source files
- Authentication data is user-provided via external configuration or environment variables

## Common Security Weaknesses Countered

### CWE-22 Path Traversal

Countermeasures:

- `sanitizeFilename()` removes unsafe sequences and separators
- `safePath()` rejects resolved paths outside the target directory

Evidence:

- [scraper.js](../../scraper.js)
- [__tests__/scraper.test.js](../../__tests__/scraper.test.js)

### ReDoS / Parser Abuse

Countermeasures:

- Uses string operations and bounded parsing patterns in artist extraction logic
- Fuzz testing for parser and sanitizer stability

Evidence:

- [scraper.js](../../scraper.js)
- [__tests__/fuzz.test.js](../../__tests__/fuzz.test.js)

### Credential Exposure

Countermeasures:

- Credentials are not hardcoded in source
- Security guidance requires external secret handling

Evidence:

- [config.example.js](../../config.example.js)
- [SECURITY.md](../../SECURITY.md)

### Release Tampering

Countermeasures:

- Release artifacts are signed in CI
- Verification process is documented for users

Evidence:

- [.github/workflows/release.yml](../workflows/release.yml)
- [.github/RELEASE.md](../RELEASE.md)

## Residual Risk and Assumptions

- The project relies on the security posture of third-party services and dependencies
- Users are responsible for secure local environment and secret management
- Threat landscape changes are handled through ongoing updates, advisories, and releases

## Conclusion

Given the documented threat model, trust boundaries, secure design controls, implementation countermeasures, and verification processes, this project provides a reasonable assurance case that its stated security requirements are met.
