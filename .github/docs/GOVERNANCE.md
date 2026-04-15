# Project Governance

This document describes the governance model for the Artvee Node Scraper project.

## Overview

Artvee Node Scraper is currently maintained as a solo-maintainer open source project. Decisions are made transparently through GitHub Issues and Pull Requests with community input.

## Roles and Responsibilities

### Maintainer

**Current Maintainer:** [@switchlove](https://github.com/switchlove)

**Responsibilities:**
- Review and merge pull requests
- Triage and respond to issues within 7 days
- Release new versions and maintain changelog
- Enforce code of conduct
- Make final decisions on feature requests and design direction
- Maintain project security (address vulnerabilities within SLA)
- Update documentation and wiki pages

**Authority:**
- Approve or reject contributions
- Grant commit access to trusted contributors (see Contributor path below)
- Archive or transfer project if unable to maintain

### Contributors

**How to Become a Contributor:**
- Submit quality pull requests
- Follow DCO (sign-off commits)
- Adhere to code of conduct
- Write tests for new features (100% coverage requirement)

**Contributor Rights:**
- Submit issues and feature requests
- Propose changes via pull requests
- Participate in design discussions
- Receive attribution in releases

### Core Contributors (Future)

As the project grows, active contributors may be granted commit access:

**Criteria for Core Contributor Status:**
- 5+ merged pull requests of high quality
- Demonstrated understanding of project goals and code quality standards
- Active participation in issue triage and reviews
- Commitment to maintaining code quality and test coverage

**Core Contributor Privileges:**
- Direct commit access to repository
- Ability to label and triage issues
- Vote on major architectural decisions
- Participating in release planning

## Decision Making

### Day-to-Day Decisions
- Bug fixes and minor improvements: Merged by maintainer after review
- Documentation updates: Fast-tracked if non-controversial
- Dependency updates: Merged after automated tests pass

### Major Decisions
Major changes require discussion and consensus:
- Breaking API changes
- New dependencies
- Architectural changes
- Changes to security model

**Process:**
1. Open GitHub Issue for discussion
2. Allow 7 days for community feedback
3. Maintainer makes final decision considering:
   - Community input
   - Project goals
   - Backward compatibility
   - Maintenance burden

### Conflict Resolution
- Disagreements discussed in GitHub Issues with technical justification
- Maintainer has final decision authority
- Community members may fork project under MIT license if needed

## Access Continuity (Bus Factor)

To ensure project continuity if the maintainer is unavailable:

### Emergency Contacts
- **Primary:** Issues remain open for 7+ days without response
- **Secondary:** Contact via email in package.json (if no response to issues)

### NPM Package Access
- NPM account has 2FA enabled
- Recovery codes stored securely offline
- Trusted colleague has emergency access instructions (sealed envelope)

### GitHub Repository Access
- Repository settings allow GitHub staff to transfer ownership if maintainer is unreachable for 90+ days
- Interested community members may request transfer if:
  - No response for 90+ days
  - Critical security vulnerabilities unaddressed
  - Package is widely used (500+ weekly downloads)

### Succession Plan
If the maintainer is permanently unavailable:
1. GitHub will transfer ownership to trusted contributor (if requested)
2. NPM package ownership transferred via NPM support ticket
3. New maintainer commits to:
   - Preserving MIT license
   - Maintaining backward compatibility where possible
   - Following existing governance model

## Improving Governance

As the project evolves, this governance model may be updated. Changes require:
1. Pull request updating this document
2. 14-day comment period for community input
3. Maintainer approval

Community members may propose governance changes via GitHub Issues.

## Code of Conduct Enforcement

Violations of the [Code of Conduct](../../CODE_OF_CONDUCT.md) are handled by the maintainer:

1. **Warning:** First offense (unless severe)
2. **Temporary Ban:** Repeated violations (1-6 months)
3. **Permanent Ban:** Severe violations or repeated offenses after temporary ban

Appeals may be submitted via email to the maintainer.

## Resources

- [Contributing Guidelines](../CONTRIBUTING.md)
- [Code of Conduct](../../CODE_OF_CONDUCT.md)
- [Security Policy](../../SECURITY.md)
- [Project Roadmap](../../CHANGELOG.md#future-releases)

---

**Last Updated:** April 15, 2026  
**Next Review:** April 15, 2027
