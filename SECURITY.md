# Security Policy

This file is intentionally placed at the repository root for easy discovery by vulnerability reporters.

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it by:

1. **Do NOT** open a public issue.
2. Use GitHub's private vulnerability reporting:
   - https://github.com/switchlove/Artvee-Node-Scraper/security/advisories/new
3. If private reporting is unavailable, contact the maintainer by email:
   - tim@timothyhaines.net
   - mailto:tim@timothyhaines.net
4. Reference this repository in your report:
   - https://github.com/switchlove/Artvee-Node-Scraper
5. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Disclosure Process

- Initial acknowledgment target: within 72 hours
- Status update target: within 7 days
- Coordinated fix and release before public disclosure whenever possible
- Public advisories (when published) are listed at:
  - https://github.com/switchlove/Artvee-Node-Scraper/security/advisories

## Scope

- In scope: vulnerabilities in this repository's source code, workflows, and release artifacts
- Out of scope: issues in third-party services outside this repository, unless directly caused by this project's code

## Security Requirements

This section documents what users can and cannot expect from this software.

### What Users Can Expect

- Path traversal protections for downloaded filenames and output paths
- Input validation for user-provided options and URLs
- Retry logic with bounded behavior for network failures
- Private vulnerability reporting and coordinated disclosure process
- Security scanning in development workflows (static analysis and dependency checks)

### What Users Cannot Expect

- Protection against compromise of third-party services (for example, Artvee itself)
- Guarantees about the integrity or availability of third-party remote content
- A hosted service with account management or password storage by this project
- Compatibility or security guarantees on unsupported Node.js versions

### User Responsibilities

- Keep dependencies updated (`npm audit`, `npm update`)
- Store any authentication data outside source control
- Use this scraper in accordance with Artvee Terms of Service and local law
- Run the latest supported release when handling untrusted content

## Preferred Report Content

- Affected version(s)
- Attack prerequisites
- Proof-of-concept details
- Severity estimate (for example, CVSS) and business impact:
  - https://www.first.org/cvss/
- Any known mitigations

## Safe Harbor

If you act in good faith, avoid privacy violations, data destruction, and service disruption, we will consider your research authorized and will not pursue legal action.

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 1.0.x   | Yes       |

## Additional Security Resources

- OpenSSF Scorecard: https://github.com/ossf/scorecard
- GitHub Security Advisories: https://docs.github.com/en/code-security/security-advisories
