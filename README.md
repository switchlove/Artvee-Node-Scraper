# Artvee Scraper

[![npm version](https://img.shields.io/npm/v/artvee-scraper.svg)](https://www.npmjs.com/package/artvee-scraper)
[![npm downloads](https://img.shields.io/npm/dm/artvee-scraper.svg)](https://www.npmjs.com/package/artvee-scraper)
[![License: ISC](https://img.shields.io/badge/License-ISC-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D24.0.0-brightgreen.svg)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

A Node.js web scraper for [Artvee.com](https://artvee.com/) that allows you to scrape, filter, and download high-quality public domain artwork.

## Features

- 🎨 **Scrape artworks** - Filter by category, century, and orientation
- 💾 **Download images** - Three quality levels (thumbnail, standard, high)
- 🔐 **Premium support** - Access highest quality images with premium account
- 📦 **Batch processing** - Download multiple artworks with configurable concurrency
- 📊 **Export metadata** - Save artwork details as JSON
- 📄 **Pagination** - Navigate through large collections

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
// Download with standard quality (1800px)
await scraper.downloadMultipleArtworks(
  results.artworks,
  './downloads',
  {
    quality: 'standard',
    includeDetails: true,
    delay: 1500
  }
);
```

### Run Examples

```bash
npm run test-scrape    # Run scraping examples
npm run test-download  # Run download examples
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
