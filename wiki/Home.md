# Artvee Node.js Scraper

Welcome to the Artvee Scraper wiki! This is a powerful Node.js tool for scraping and downloading artwork from [Artvee.com](https://artvee.com/).

## 🎨 Features

- **Smart Scraping**: Scrape artworks with advanced filtering by category, century, and orientation
- **Batch Downloads**: Download multiple artworks with configurable concurrency
- **Premium Support**: Full support for premium accounts with high-quality downloads
- **Quality Options**: Choose between thumbnail, standard (1800px), and high quality downloads
- **Metadata Export**: Save artwork details as JSON alongside images
- **Pagination**: Navigate through thousands of artworks across multiple pages

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run scraper example
npm run test-scrape

# Run download example
npm run test-download
```

## 📚 Documentation

- **[Installation](Installation)** - Setup and installation guide
- **[Basic Usage](Usage)** - Getting started with scraping
- **[Download Guide](Download-Guide)** - How to download artwork images
- **[API Reference](API-Reference)** - Complete API documentation
- **[Premium Account](Premium-Account)** - Using premium features
- **[Examples](Examples)** - Code examples and use cases
- **[FAQ](FAQ)** - Frequently asked questions
- **[Troubleshooting](Troubleshooting)** - Common issues and solutions

## 🔍 Available Filters

### Categories
abstract, figurative, landscape, posters, illustration, religion, mythology, drawings, still-life, plants-animals

### Centuries
15th, 16th, 17th, 18th, 19th, 20th, 21st century

### Orientations
landscape, portrait, square, panorama

## 📖 Quick Examples

### Scrape Artworks
```javascript
const ArtveeScraper = require('./scraper');
const scraper = new ArtveeScraper();

const results = await scraper.scrapeArtworks({
  category: 'landscape',
  century: '17th-century',
  orientation: 'landscape',
  perPage: 70
});
```

### Download Images
```javascript
await scraper.downloadMultipleArtworks(
  results.artworks,
  './downloads/17th-century',
  {
    quality: 'standard',
    includeDetails: true
  }
);
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## 📄 License

ISC License

## ⚠️ Disclaimer

This scraper is for educational purposes. Please respect Artvee.com's terms of service and use responsibly.
