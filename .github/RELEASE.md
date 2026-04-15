# Release Guide

Complete guide for releasing the Artvee Scraper package to npm and GitHub.

## Prerequisites

### 1. npm Account
- Create an account at [npmjs.com](https://www.npmjs.com/signup)
- Verify your email address
- (Optional) Set up 2FA for security

### 2. Login to npm
```bash
npm login
```

Enter your username, password, and email when prompted.

### 3. Verify Login
```bash
npm whoami
```

## Pre-Release Checklist

Before releasing, ensure:

- [ ] All tests pass (`npm run test-scrape`, `npm run test-download`)
- [ ] Documentation is up to date (README, wiki)
- [ ] CHANGELOG.md is updated with new version changes
- [ ] Version number is bumped in package.json
- [ ] All changes are committed to git
- [ ] No sensitive data in code (check config.js is in .gitignore)
- [ ] .npmignore properly excludes unnecessary files

## Versioning Strategy

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.x.x): Breaking changes
- **MINOR** (x.1.x): New features (backwards compatible)
- **PATCH** (x.x.1): Bug fixes

### Bump Version

Important release tags should be cryptographically signed.

```bash
# Patch release (1.0.0 -> 1.0.1)
npm version patch --sign-git-tag

# Minor release (1.0.0 -> 1.1.0)
npm version minor --sign-git-tag

# Major release (1.0.0 -> 2.0.0)
npm version major --sign-git-tag
```

This automatically:
- Updates package.json and package-lock.json
- Creates a git commit
- Creates a cryptographically signed git tag (using your configured Git signing format)

### Configure Git Tag Signing

The project supports signed tags for important releases. On this repository, the documented verification path uses **SSH-signed git tags** with the allowed signers file committed at `.github/allowed_signers`.

Before creating release tags, configure Git for SSH signing:

```bash
# Derive or create an SSH signing key if needed
ssh-keygen -t ed25519 -f ~/.ssh/git_signing_key -C "your.email@example.com"

# Export the public key
ssh-keygen -y -f ~/.ssh/git_signing_key > ~/.ssh/git_signing_key.pub

# Configure git to use SSH signing
git config gpg.format ssh
git config user.signingkey ~/.ssh/git_signing_key.pub
git config tag.gpgSign true
```

If you use a different signing key, update `.github/allowed_signers` with the public key for the release signer identity.

Verify a signed tag:

```bash
git -c gpg.format=ssh -c gpg.ssh.allowedSignersFile=.github/allowed_signers tag -v v1.0.4
```

## Publishing to npm

### Method 1: Standard Publish

```bash
# Dry run (see what will be published)
npm publish --dry-run

# Publish to npm
npm publish
```

### Method 2: Using npm Scripts

```bash
# Prepare and publish (recommended)
npm run release:patch   # or release:minor, release:major
```

### Verify Publication

```bash
# Check if package exists
npm view artvee-node-scraper

# Install from npm to test
npm install artvee-node-scraper
```

## Creating GitHub Releases

### Manual Release

1. Go to your repository on GitHub
2. Click **Releases** → **Draft a new release**
3. Choose a tag (e.g., v1.0.0)
4. Set release title: "v1.0.0 - Initial Release"
5. Add release notes from CHANGELOG.md
6. Click **Publish release**

### Automated Release (GitHub Actions)

Push your tag to trigger the release:

```bash
git push origin main --tags
```

The GitHub workflow will automatically create a release.

## Signed Release Artifacts

GitHub releases are signed automatically by the release workflow using **Sigstore Cosign keyless signing**.

- The npm package tarball is signed
- The `SHA256SUMS` file is signed
- Signatures and certificates are attached to the GitHub release
- No long-lived private signing key is stored in the repository or on public distribution sites

Sigstore keyless signing uses GitHub Actions OIDC identity plus Sigstore's public trust roots. Users verify the signature against the workflow identity instead of downloading a project-managed private key.

## Verify Release Signatures

### 1. Download release files

From the GitHub release page, download:

- `artvee-node-scraper-<version>.tgz`
- `artvee-node-scraper-<version>.tgz.sig`
- `artvee-node-scraper-<version>.tgz.pem`
- `SHA256SUMS`
- `SHA256SUMS.sig`
- `SHA256SUMS.pem`

### 2. Install Cosign

Follow the official installation instructions:

- https://docs.sigstore.dev/cosign/system_config/installation/

Optionally initialize/update Sigstore trust roots:

```bash
cosign initialize
```

### 3. Verify the package signature

```bash
cosign verify-blob \
	--certificate artvee-node-scraper-<version>.tgz.pem \
	--signature artvee-node-scraper-<version>.tgz.sig \
	--certificate-identity-regexp "^https://github.com/switchlove/Artvee-Node-Scraper/.github/workflows/release.yml@refs/tags/v.*$" \
	--certificate-oidc-issuer "https://token.actions.githubusercontent.com" \
	artvee-node-scraper-<version>.tgz
```

### 4. Verify the checksum file signature

```bash
cosign verify-blob \
	--certificate SHA256SUMS.pem \
	--signature SHA256SUMS.sig \
	--certificate-identity-regexp "^https://github.com/switchlove/Artvee-Node-Scraper/.github/workflows/release.yml@refs/tags/v.*$" \
	--certificate-oidc-issuer "https://token.actions.githubusercontent.com" \
	SHA256SUMS
```

### 5. Verify the checksum matches the package

```bash
sha256sum -c SHA256SUMS
```

Successful verification confirms that the artifact was signed by the repository's release workflow for a version tag.

## Complete Release Process

### Step-by-Step

```bash
# 1. Ensure you're on main and up to date
git checkout main
git pull origin main

# 2. Run tests
npm run test-scrape
npm run test-download

# 3. Update CHANGELOG.md
# Add changes for the new version

# 4. Commit changelog
git add CHANGELOG.md
git commit -m "docs: update changelog for v1.0.1"

# 5. Bump version (creates commit and tag)
npm version patch --sign-git-tag -m "chore: release v%s"

# 6. Push changes and tags
git push origin main --tags

# 7. Publish to npm
npm publish

# 8. Create GitHub Release (manual or automatic)
```

## Post-Release

### Update Badges

Update version badge in README.md:
```markdown
[![npm version](https://img.shields.io/npm/v/artvee-node-scraper.svg)](https://www.npmjs.com/package/artvee-node-scraper)
```

### Announce Release

- Update README if needed
- Post on relevant forums/communities
- Tweet about it (if applicable)

## Unpublishing (Emergency Only)

⚠️ **WARNING**: Unpublishing is heavily discouraged and only works within 72 hours.

```bash
# Unpublish a specific version
npm unpublish artvee-node-scraper@1.0.0

# Unpublish entire package (Use with extreme caution!)
npm unpublish artvee-node-scraper --force
```

**Better alternative**: Publish a patched version if there's an issue.

## Managing Package Access

### Make Package Public

```bash
npm access public artvee-node-scraper
```

### Add Collaborators

```bash
npm owner add <username> artvee-node-scraper
```

## Deprecating Old Versions

```bash
# Deprecate a specific version
npm deprecate artvee-node-scraper@1.0.0 "Please upgrade to 1.0.1 - fixes critical bug"

# Deprecate all 1.x versions
npm deprecate artvee-node-scraper@"1.x" "Please upgrade to 2.0.0"
```

## Beta/Alpha Releases

For pre-release versions:

```bash
# Set version to beta
npm version 1.1.0-beta.0

# Publish with beta tag
npm publish --tag beta

# Users install with:
# npm install artvee-node-scraper@beta
```

## Common Issues

### "You do not have permission to publish"

- Check you're logged in: `npm whoami`
- Verify package name isn't taken: `npm view artvee-node-scraper`
- Check organization scope if using @org/package

### "Package name too similar to existing package"

- Choose a different name
- Or request transfer of unused package

### Files not excluded

- Check .npmignore configuration
- Run `npm publish --dry-run` to preview

## Quick Commands Reference

```bash
# Check what will be published
npm pack --dry-run

# Check package size
npm pack
tar -tzf artvee-node-scraper-1.0.3.tgz

# View package info
npm view artvee-node-scraper

# Check outdated dependencies
npm outdated

# Update dependencies
npm update

# Audit security
npm audit
npm audit fix
```

## Release Automation with GitHub Actions

See `.github/workflows/release.yml` for automated releases on tag push.

## Need Help?

- [npm documentation](https://docs.npmjs.com/)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github)
- [Semantic Versioning](https://semver.org/)
