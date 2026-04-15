# Maintenance and Upgrade Policy

This document describes supported versions and how to upgrade safely.

## Supported Versions

The project follows Semantic Versioning.

| Version Line | Status | Notes |
| --- | --- | --- |
| 1.0.x | Supported | Receives fixes and security updates |
| < 1.0.0 | Unsupported | No longer maintained |

The maintainer prioritizes updates for the latest released patch version in the current major line.

## Upgrade Path

For most users, upgrades are straightforward patch/minor updates.

### 1. Check release notes

Review:
- CHANGELOG entries for your current version through the target version
- Any breaking-change notes (if present in future major releases)

## 2. Update dependency

If installed from npm:

```bash
npm install artvee-node-scraper@latest
```

If used directly from repository source:

```bash
git pull
npm install
```

## 3. Run validation checks

```bash
npm test
npm run test-scrape
```

## 4. Verify integration behavior

- Confirm your scraping filters still match expected results
- Confirm download paths and compression options still behave as expected
- Confirm authentication cookie usage still works if premium access is enabled

## Known Upgrade Note

### Upgrade from package name `artvee-scraper` to `artvee-node-scraper`

This change occurred in version 1.0.2.

1. Remove old dependency if present:
```bash
npm uninstall artvee-scraper
```
2. Install current package:
```bash
npm install artvee-node-scraper
```
3. Update imports if needed:
```javascript
const ArtveeScraper = require('artvee-node-scraper');
```

## Future Major Releases

If a major version introduces breaking changes, this file will include:
- Changed interfaces
- Migration steps
- Before/after usage examples

## Maintenance Commitment

The project maintains the most used older versions by supporting the active major line and publishing an upgrade path for transitions.
