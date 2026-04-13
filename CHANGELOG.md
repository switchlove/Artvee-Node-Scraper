# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

---

## Future Releases

### Planned Features
- [ ] CLI tool for command-line usage
- [ ] Progress bars for large downloads
- [ ] Database integration options
- [ ] Advanced filtering (by color, style, etc.)
- [ ] Automated retry logic for failed downloads
- [ ] Resume interrupted downloads
- [ ] Image compression options

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
