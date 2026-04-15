# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.3] - 2026-04-13

### Added
- Progress bars for large downloads with `cli-progress` library
- Multi-bar progress tracking for batch downloads with perfect alignment
- Single progress bar for individual downloads
- `showProgress` option in download methods (default: true for batch, false for single)
- Human-readable file sizes in progress display (MB format)
- Visual status indicators: "(cached)" for existing files
- Clean visual separators (│) for better readability
- **Image compression with `sharp` library**
- `compress` option for download methods to reduce file sizes
- `compressionOptions` for fine control (quality, format, resize)
- `compressImage()` method for standalone compression
- Support for JPEG, PNG, and WebP output formats
- Progressive JPEG encoding support
- Image resizing during compression (width/height)
- Compression statistics (original size, compressed size, savings %)
- **Automatic retry logic for failed downloads**
- `maxRetries` configuration option (default: 3)
- `retryDelay` configuration option (default: 1000ms)
- Exponential backoff with jitter for retry delays
- Retry attempt logging with countdown
- **Resume interrupted downloads**
- `enableResume` configuration option (default: true)
- HTTP Range header support for partial downloads
- `.partial` marker files to track incomplete downloads
- Resume indicator (↻) in progress bars
- Automatic cleanup of partial markers on completion

### Changed
- `downloadMultipleArtworks` now shows progress bars by default
- Enhanced download tracking with formatted, aligned progress indicators
- Filenames padded to 40 characters for perfect visual alignment
- Progress bars use 25-character width for consistent display
- **License changed from ISC to CC-BY-SA-4.0** (Creative Commons Attribution-ShareAlike 4.0 International)

### Security
- **Enhanced path traversal protection in filename sanitization**
- Removed `..` sequences to prevent directory traversal attacks
- Removed leading dots to prevent hidden file creation
- Added null byte filtering to prevent null byte injection
- Added `path.basename()` safeguard for additional protection
- Added `safePath()` method with path.resolve() validation
- Improved validation of user-provided artwork titles before filesystem operations

## [1.0.2] - 2026-04-13

### Changed
- Package renamed from `artvee-scraper` to `artvee-node-scraper`
- Updated repository URLs to match actual GitHub repository name
- Updated npm badges in README to reference new package name
- Normalized repository URL format in package.json

## [1.0.1] - 2026-04-13

### Changed
- Updated README.md with improved documentation structure
- Enhanced wiki documentation and navigation

### Security
- Eliminated ReDoS vulnerabilities by replacing regex patterns with String methods
- Improved GitHub Actions security with explicit permissions

## [1.0.0] - 2026-04-12

### Added
- Initial release of Artvee Scraper
- Web scraping functionality for Artvee.com
- Filter by category, century, and orientation
- Pagination support for browsing large collections
- Image download capabilities with three quality levels (thumbnail, standard, high)
- Premium account authentication support
- Batch download with configurable concurrency and delays
- Metadata export (JSON) alongside downloaded images
- Image size and resolution detection
- Comprehensive documentation (9-page wiki)
- Example scripts for scraping and downloading
- Rate limiting and respectful scraping practices

### Features
- `scrapeArtworks()` - Main scraping method with filtering options
- `scrapeArtworkDetails()` - Get detailed information for specific artworks
- `downloadArtwork()` - Download single artwork with metadata
- `downloadMultipleArtworks()` - Batch download with progress tracking
- `downloadImage()` - Download any image by URL
- Helper methods for categories, centuries, and orientations

### Documentation
- README.md with quick start guide
- Installation guide
- Usage guide with examples
- Download guide with quality comparisons
- Complete API reference
- Premium account setup guide
- 14+ practical code examples
- FAQ section
- Troubleshooting guide
- Contributing guidelines
- Security policy

### Dependencies
- axios@^1.6.0 - HTTP client
- cheerio@^1.0.0-rc.12 - HTML parsing
- image-size@^2.0.2 - Image metadata
- cli-progress@^3.12.0 - Progress bars
- sharp@^0.33.0 - Image compression (optional)

---

## [Unreleased]

### Added
- Enforced coding standards with ESLint (`eslint:recommended`) in CI (`npm run lint`)
- Published explicit coding standards and local lint commands in `.github/CONTRIBUTING.md`
- Added regression test tracking policy for bug-fix pull requests
- Added maintenance and upgrade policy in `.github/docs/UPGRADE.md`

### Changed
- License changed from CC-BY-SA-4.0 to MIT to use an OSI-approved software license.

### Fixed
- Documented existing regression coverage for recent bug fixes:
- Path traversal hardening covered by `sanitizeFilename` and `safePath` tests in `__tests__/scraper.test.js`
- ReDoS mitigation covered by `extractArtist` unit tests and fuzz tests in `__tests__/fuzz.test.js`

---

## Future Releases

### 12-Month Roadmap (2026-2027)

The project intends to focus on reliability, maintainability, and security over the next year.

### Planned Features
- [ ] CLI tool for command-line usage
- [ ] Database integration options
- [ ] Advanced filtering (by color, style, etc.)

### Planned Non-Goals (Out of Scope)
- [ ] Hosting a managed cloud scraping service
- [ ] Building a graphical desktop or mobile application
- [ ] Supporting non-Node.js runtime environments
- [ ] Storing user credentials on project-managed infrastructure

---

## Version History Format

### [Version] - YYYY-MM-DD

#### Added
- New features

#### Changed
- Changes to existing functionality

#### Deprecated
- Features that will be removed

#### Removed
- Removed features

#### Fixed
- Bug fixes

#### Security
- Security updates
