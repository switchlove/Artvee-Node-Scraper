# Artvee Node Scraper

[![npm version](https://img.shields.io/npm/v/artvee-node-scraper.svg)](https://www.npmjs.com/package/artvee-node-scraper)
[![npm downloads](https://img.shields.io/npm/dm/artvee-node-scraper.svg)](https://www.npmjs.com/package/artvee-node-scraper)
[![License: ISC](https://img.shields.io/badge/License-ISC-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D24.0.0-brightgreen.svg)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

A powerful Node.js scraper for [Artvee.com](https://artvee.com/) - download and organize high-quality public domain artwork with advanced filtering, progress tracking, and compression.

## ✨ Features

- 🎨 **Smart Filtering** - Search by category, century, orientation
- 💾 **Multi-Quality Downloads** - Thumbnail, standard (1800px), high (up to 7000px+)
- 📊 **Progress Tracking** - Beautiful visual progress bars with file sizes
- 🗜️ **Image Compression** - Reduce file sizes by 80%+ with format conversion
- 🔄 **Auto Retry & Resume** - Robust downloads with exponential backoff
- ⚡ **Batch Processing** - Concurrent downloads with rate limiting
- 📦 **Metadata Export** - Save artwork details as JSON
- 🔐 **Premium Support** - Full premium account integration

## 🚀 Quick Start

```bash
npm install
```

```javascript
const ArtveeScraper = require('./scraper');

// Initialize scraper
const scraper = new ArtveeScraper({
  maxRetries: 3,      // Auto-retry failed downloads
  enableResume: true  // Resume interrupted downloads
});

// Scrape artworks
const results = await scraper.scrapeArtworks({
  category: 'landscape',
  century: '17th-century',
  perPage: 20
});

// Download with progress bars
await scraper.downloadMultipleArtworks(
  results.artworks,
  './downloads',
  {
    quality: 'standard',
    compress: true,
    showProgress: true
  }
);
```

## 📚 Documentation

**[📖 Visit the Wiki](../../wiki)** for complete documentation:

| Guide | Description |
|-------|-------------|
| [Installation](../../wiki/Installation) | Setup and dependencies |
| [Usage Guide](../../wiki/Usage) | Scraping and filtering |
| [Download Guide](../../wiki/Download-Guide) | Progress bars, retry, resume |
| [Compression Guide](../../wiki/Compression-Guide) | Image optimization |
| [API Reference](../../wiki/API-Reference) | Complete API docs |
| [Examples](../../wiki/Examples) | 14+ code examples |
| [Premium Account](../../wiki/Premium-Account) | Premium features |
| [FAQ](../../wiki/FAQ) | Common questions |
| [Troubleshooting](../../wiki/Troubleshooting) | Debug issues |

## 🎯 Quick Examples

See [examples/](examples/) directory or run:

```bash
npm run test-scrape          # Scraping demo
npm run test-download        # Download demo
npm run test-compression     # Compression demo
npm run demo-retry-resume    # Retry/resume demo
```

## 💡 Key Features

### Progress Bars
```
📥 17th_Century_Landscape      │█████████████████│ 100% │ 2.30 MB
↻ Dutch_Harbor_Scene           │█████████░░░░░░░░│  60% │ 1.25/2.10 MB (resuming)
```

### Compression
Reduce file sizes by 80%+ with quality/format control. See [Compression Guide](../../wiki/Compression-Guide).

### Retry & Resume
Auto-retry with exponential backoff. Resume interrupted downloads. See [Download Guide](../../wiki/Download-Guide).

## ⚖️ License & Disclaimer

**License:** ISC

**Educational Use Only** - Please respect [Artvee's Terms of Service](https://artvee.com/terms-of-service/). Use responsibly with appropriate delays and rate limiting.

---

**[📖 Full Documentation](../../wiki)** • **[Examples](examples/)** • **[Issues](../../issues)** • **[Contributing](CONTRIBUTING.md)**
