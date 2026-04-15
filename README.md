# Artvee Node Scraper

[![NPM Version](https://img.shields.io/npm/v/artvee-node-scraper?style=flat-square&logo=npm&logoColor=%23CB3837)](https://www.npmjs.com/package/artvee-node-scraper)
[![Node Current](https://img.shields.io/node/v/artvee-node-scraper?style=flat-square&logo=nodedotjs&logoColor=%235FA04E)](https://nodejs.org/)
[![Node LTS](https://img.shields.io/node/v-lts/artvee-node-scraper?style=flat-square&logo=nodedotjs&logoColor=%235FA04E)](https://nodejs.org/)
[![NPM License](https://img.shields.io/npm/l/artvee-node-scraper?style=flat-square&logo=creativecommons&logoColor=%23ED592F)](LICENSE)

[![GitHub commit activity](https://img.shields.io/github/commit-activity/t/switchlove/Artvee-Node-Scraper?style=flat-square&logo=github&logoColor=%23181717)](https://github.com/switchlove/Artvee-Node-Scraper)
[![GitHub Issues](https://img.shields.io/github/issues/switchlove/Artvee-Node-Scraper?style=flat-square&logo=github&logoColor=%23181717)](https://github.com/switchlove/Artvee-Node-Scraper/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/switchlove/Artvee-Node-Scraper?style=flat-square&logo=github&logoColor=%23181717)](https://github.com/switchlove/Artvee-Node-Scraper/pulls)
[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/switchlove/Artvee-Node-Scraper/ci.yml?branch=main&style=flat-square&logo=github&logoColor=%23181717)](https://github.com/theoephraim/node-google-spreadsheet/actions/workflows/ci.yml)
[![Coverage Status](https://img.shields.io/coverallsCoverage/github/switchlove/Artvee-Node-Scraper?style=flat-square&logo=github&logoColor=%23181717)](https://coveralls.io/github/switchlove/Artvee-Node-Scraper?branch=main)


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
npm run fuzz                 # Property-based fuzz tests
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

**License:** [MIT License](LICENSE)

This means you can use, modify, and distribute this code as long as you:
- ✅ Give appropriate credit
- ✅ Share derivatives under the same license

**Educational Use Only** - Please respect [Artvee's Terms of Service](https://artvee.com/terms-of-service/). Use responsibly with appropriate delays and rate limiting.

---

**[📖 Full Documentation](../../wiki)** • **[Examples](examples/)** • **[Issues](../../issues)** • **[Contributing](CONTRIBUTING.md)**
