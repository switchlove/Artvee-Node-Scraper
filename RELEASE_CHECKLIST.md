# Automated Release Preparation Checklist

This guide will help you prepare for your first automated release.

## ✅ Pre-Flight Checklist

### 1. Commit All Changes
```powershell
# Stage all release files
git add .

# Commit
git commit -m "chore: add release automation and documentation"

# Push to GitHub
git push origin main
```

### 2. Verify GitHub Repository Settings

**Required:**
- [ ] Repository is pushed to GitHub
- [ ] Repository URL matches package.json: `https://github.com/switchlove/artvee-scraper.git`
- [ ] Main branch is named `main` (not `master`)

**Optional (for npm auto-publish):**
- [ ] Get npm token: `npm token create --read-only=false`
- [ ] Add to GitHub Secrets: Settings → Secrets → Actions → New repository secret
  - Name: `NPM_TOKEN`
  - Value: Your npm token

### 3. Test Locally First

```powershell
# Run tests
npm run test-scrape
npm run test-download

# Check what will be published
npm publish --dry-run

# Verify package structure
npm pack
tar -tzf artvee-scraper-1.0.0.tgz
```

### 4. Update CHANGELOG.md

Make sure CHANGELOG.md reflects what's in version 1.0.0:
- All features implemented
- Any breaking changes
- Known issues

## 🚀 Automated Release Workflow

### How It Works

1. **You push a version tag** → GitHub Actions triggers
2. **GitHub creates release** → With CHANGELOG notes
3. **Artifacts are built** → Ready for distribution

### Trigger Your First Release

```powershell
# Make sure everything is committed
git status

# Update CHANGELOG if needed
# (Edit CHANGELOG.md manually)

# Create and push version tag (triggers automated release)
git tag v1.0.0
git push origin v1.0.0
```

**What happens automatically:**
- ✅ GitHub workflow runs tests
- ✅ GitHub Release is created with tag
- ✅ Release notes pulled from CHANGELOG
- ✅ Installation instructions added

### Manual npm Publish (First Time)

For the first release, publish to npm manually:

```powershell
# Login to npm
npm login

# Publish
npm publish

# Verify
npm view artvee-scraper
```

### Future Releases (Using Scripts)

After initial setup, use the npm scripts:

```powershell
# Update CHANGELOG.md first!

# Then run (automatically tags, pushes, and releases)
npm run release:patch   # 1.0.0 → 1.0.1
# or
npm run release:minor   # 1.0.0 → 1.1.0
# or
npm run release:major   # 1.0.0 → 2.0.0
```

## 📋 Step-by-Step Quick Start

Copy and paste these commands:

```powershell
# Step 1: Commit release setup
git add .
git commit -m "chore: add release automation"
git push origin main

# Step 2: Verify everything works
npm run test-scrape

# Step 3: Login to npm (first time only)
npm login

# Step 4: Tag and push (triggers GitHub release)
git tag v1.0.0
git push origin v1.0.0

# Step 5: Publish to npm (first time - manual)
npm publish

# Step 6: Verify
npm view artvee-scraper
```

## 🎯 After First Release

For subsequent releases:

1. **Make changes** to code
2. **Update CHANGELOG.md** with new changes
3. **Run**: `npm run release:patch` (or minor/major)
4. **Done!** - Automation handles the rest

## 🔍 Verify Release Was Successful

### Check GitHub
- Go to: `https://github.com/switchlove/artvee-scraper/releases`
- Should see your v1.0.0 release

### Check npm
```powershell
npm view artvee-scraper
npm view artvee-scraper versions
```

### Test Installation
```powershell
# In a different directory
mkdir test-install
cd test-install
npm init -y
npm install artvee-scraper

# Test it works
node -e "const s = require('artvee-scraper'); console.log('✓ Package works!')"
```

## 🆘 Troubleshooting

### GitHub Actions Failing

1. Check workflow runs: `Settings → Actions → Workflow runs`
2. View logs for error messages
3. Common issues:
   - Tests failing (fix code)
   - Node version mismatch (update .github/workflows/release.yml)

### npm Publish Fails

- **"Package already exists"**: Version already published, bump version
- **"Not logged in"**: Run `npm login`
- **"Permission denied"**: Check package name isn't taken

### Tag Already Exists

```powershell
# Delete local tag
git tag -d v1.0.0

# Delete remote tag
git push origin :refs/tags/v1.0.0

# Create new tag
git tag v1.0.0
git push origin v1.0.0
```

## 📚 Documentation References

- Full release guide: [RELEASE.md](RELEASE.md)
- Changelog template: [CHANGELOG.md](CHANGELOG.md)
- GitHub workflow: [.github/workflows/release.yml](.github/workflows/release.yml)
- Package scripts: [package.json](package.json)

## 🎉 Ready to Release!

Once you've completed the checklist above, you're ready to publish your first release!
