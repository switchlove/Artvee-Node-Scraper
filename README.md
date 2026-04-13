# Artvee Node Scraper

[![npm version](https://img.shields.io/npm/v/artvee-node-scraper.svg)](https://www.npmjs.com/package/artvee-node-scraper)
[![npm downloads](https://img.shields.io/npm/dm/artvee-node-scraper.svg)](https://www.npmjs.com/package/artvee-node-scraper)
[![License: ISC](https://img.shields.io/badge/License-ISC-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

A Node.js web scraper for [Artvee.com](https://artvee.com/) that allows you to scrape, filter, and download high-quality public domain artwork.

## Features

- 🎨 **Scrape artworks** - Filter by category, century, and orientation
- 💾 **Download images** - Three quality levels (thumbnail, standard, high)
- � **Progress tracking** - Visual progress bars for downloads
- 🗜️ **Image compression** - Reduce file sizes with quality/format options
- 🔐 **Premium support** - Access highest quality images with premium account
- 📦 **Batch processing** - Download multiple artworks with configurable concurrency
- 📄 **Export metadata** - Save artwork details as JSON
- 📑 **Pagination** - Navigate through large collections

## Quick Start

### Installation

```bash
npm install
```

### Basic Usage

```javascript
const ArtveeScraper = require('./scraper');
const scraper = new ArtveeScraper();

// Scrape 17th century landscape artworks
const results = await scraper.scrapeArtworks({
  category: 'landscape',
  century: '17th-century',
  orientation: 'landscape',
  perPage: 20
});

console.log(`Found ${results.totalResults} artworks`);
```

### Download Artworks

```javascript
// Download with standard quality (1800px) and progress bars
await scraper.downloadMultipleArtworks(
  results.artworks,
  './downloads',
  {
    quality: 'standard',
    includeDetails: true,
    delay: 1500,
    showProgress: true  // Visual progress bars (default: true)
  }
);
```

### Progress Bars

Downloads now display beautifully formatted progress bars with perfect alignment:

```
📥 17th_Century_Landscape                  │█████████████████████████│ 100% │ 2.30 MB
📥 Dutch_Harbor_Scene                      │████████████░░░░░░░░░░░░░│  60% │ 1.25/2.10 MB
📥 Italian_Countryside                     │█████████████████████████│ 100% │ 1.87 MB (cached)
```

**Features:**
- ✓ Real-time download progress with human-readable file sizes
- ✓ 40-character filename padding for perfect alignment
- ✓ Shows "(cached)" indicator for existing files
- ✓ Clean visual separators for better readability

```javascript
// Multiple downloads with progress bars (default)
await scraper.downloadMultipleArtworks(artworks, './downloads', {
  showProgress: true  // default
});

// Disable progress bars for legacy output
await scraper.downloadMultipleArtworks(artworks, './downloads', {
  showProgress: false
});

// Single download with progress bar
await scraper.downloadArtwork(artwork, './downloads', {
  showProgress: true
});
```

### Image Compression

Reduce file sizes while maintaining quality using built-in compression:

```javascript
// Basic compression (80% quality, default)
await scraper.downloadArtwork(artwork, './downloads', {
  quality: 'standard',
  compress: true
});

// High compression (60% quality for smaller files)
await scraper.downloadArtwork(artwork, './downloads', {
  compress: true,
  compressionOptions: {
    quality: 60
  }
});

// Resize and compress
await scraper.downloadArtwork(artwork, './downloads', {
  compress: true,
  compressionOptions: {
    quality: 80,
    width: 1200  // Resize to 1200px width
  }
});

// Convert to WebP format (best compression)
await scraper.downloadArtwork(artwork, './downloads', {
  compress: true,
  compressionOptions: {
    format: 'webp',
    quality: 85
  }
});
```

**Compression Options:**
- `quality`: 1-100 (default: 80)
- `format`: 'jpeg', 'png', 'webp'
- `width`: Resize width in pixels
- `height`: Resize height in pixels
- `progressive`: Progressive JPEG (default: true)

**Note:** Requires `sharp` package: `npm install sharp`

### Run Examples

```bash
npm run test-scrape       # Run scraping examples
npm run test-download     # Run download examples
npm run test-compression  # Run compression examples
```

## Documentation

📚 **[Visit the Wiki](../../wiki)** for comprehensive documentation:

- **[Installation Guide](../../wiki/Installation)** - Setup and configuration
- **[Usage Guide](../../wiki/Usage)** - Basic scraping and filtering
- **[Download Guide](../../wiki/Download-Guide)** - Image download options
- **[API Reference](../../wiki/API-Reference)** - Complete API documentation
- **[Premium Account](../../wiki/Premium-Account)** - Premium setup guide
- **[Examples](../../wiki/Examples)** - 14+ practical code examples
- **[FAQ](../../wiki/FAQ)** - Common questions
- **[Troubleshooting](../../wiki/Troubleshooting)** - Debug and fix issues

## Available Filters

**Categories:** abstract, figurative, landscape, posters, illustration, religion, mythology, drawings, still-life, plants-animals4

**Centuries:** 15th-century through 21st-century

**Orientations:** landscape, portrait, square, panorama

## Image Quality Levels

| Quality | Resolution | File Size | Account Type |
|---------|-----------|-----------|--------------|
| `thumbnail` | ~500px | 50-100 KB | Free |
| `standard` | 1800px | 1-3 MB | Free |
| `high` | 4000-7000px+ | 10-30 MB | Premium |

## Rate Limiting

Please be respectful when using this scraper:
- ✅ Add delays between requests (recommended: 1500ms)
- ✅ Limit concurrent downloads (recommended: 3 max)
- ✅ Cache results when possible
- ❌ Don't overwhelm the server

## License

ISC

## Disclaimer

This scraper is for educational purposes only. Please respect [Artvee's Terms of Service](https://artvee.com/terms-of-service/) and use responsibly.
