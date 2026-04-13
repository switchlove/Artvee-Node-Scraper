# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

### Changed
- `downloadMultipleArtworks` now shows progress bars by default
- Enhanced download tracking with formatted, aligned progress indicators
- Filenames padded to 40 characters for perfect visual alignment
- Progress bars use 25-character width for consistent display

### Security
- **Enhanced path traversal protection in filename sanitization**
- Removed `..` sequences to prevent directory traversal attacks
- Removed leading dots to prevent hidden file creation
- Added null byte filtering to prevent null byte injection
- Added `path.basename()` safeguard for additional protection
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

## Future Releases

### Planned Features
- [ ] CLI tool for command-line usage
- [ ] Database integration options
- [ ] Advanced filtering (by color, style, etc.)
- [ ] Automated retry logic for failed downloads
- [ ] Resume interrupted downloads

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
