# Artvee Scraper

A Node.js web scraper for [Artvee.com](https://artvee.com/) that allows you to scrape, filter, and download artwork data by category, century, and orientation.

## Features

- 🎨 Scrape artworks from Artvee.com
- 🔍 Filter by category (abstract, figurative, landscape, religion, mythology, etc.)
- 📅 Filter by century (15th-21st century)
- 📐 Filter by orientation (landscape, portrait, square, panorama)
- 📄 Pagination support
- 🖼️ Extract detailed artwork information
- 💾 **Download images automatically**
- 🔐 **Premium account support for higher quality downloads**
- 📦 Batch download with configurable concurrency
- 📊 Save metadata alongside images

## Installation

1. Install dependencies:
```bash
npm install
```

## Usage

### Basic Scraping Example

```javascript
const ArtveeScraper = require('./scraper');

const scraper = new ArtveeScraper();

// Scrape 17th century landscape artworks
const results = await scraper.scrapeArtworks({
  category: 'landscape',
  century: '17th-century',
  orientation: 'landscape',
  perPage: 70,
  page: 1
});

console.log(results.artworks);
```

### Download Images

```javascript
const ArtveeScraper = require('./scraper');
const scraper = new ArtveeScraper();

// Scrape artworks
const results = await scraper.scrapeArtworks({
  category: 'landscape',
  century: '17th-century',
  perPage: 10
});

// Download all artworks
await scraper.downloadMultipleArtworks(
  results.artworks,
  './downloads/17th-century',
  {
    quality: 'standard',
    includeDetails: true,
    delay: 1500,
    maxConcurrent: 3
  }
);
```

### Premium Account (Higher Quality Downloads)

```javascript
const ArtveeScraper = require('./scraper');

// Initialize with premium account credentials
const scraper = new ArtveeScraper({
  authCookie: 'your_cookie_string_here',
  headers: {
    // Additional headers if needed
  }
});

// Premium accounts get access to higher quality images
const results = await scraper.scrapeArtworks({
  category: 'landscape',
  century: '18th-century'
});

await scraper.downloadMultipleArtworks(
  results.artworks,
  './downloads/premium',
  {
    quality: 'high', // Premium accounts can access high quality
    includeDetails: true
  }
);
```

#### Getting Your Premium Cookie

1. Log in to [artvee.com](https://artvee.com) in your browser
2. Open DevTools (F12)
3. Go to **Application** > **Storage** > **Cookies**
4. Copy the cookie string (format: `cookie1=value1; cookie2=value2`)
5. Use it in the scraper constructor

### Available Options

#### `scrapeArtworks(options)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `category` | string | 'landscape' | Category to filter (see categories below) |
| `century` | string | null | Century to filter (e.g., '17th-century') |
| `orientation` | string | null | Orientation filter ('landscape', 'portrait', 'square') |
| `perPage` | number | 70 | Number of results per page |
| `page` | number | 1 | Page number for pagination |

#### Available Categories

- `abstract`
- `figurative`
- `landscape`
- `religion`
- `mythology`
- `posters`
- `animals`
- `illustration`
- `still-life`
- `botanical`
- `asian-art`

#### Available Centuries

- `11th-century` through `21st-century`

#### Available Orientations

- `landscape`
- `portrait`
- `square`

### Get Artwork Details

```javascript
// Get detailed information for a specific artwork
const details = await scraper.scrapeArtworkDetails('https://artvee.com/dl/artwork-url/');

console.log(details.title);
console.log(details.description);
console.log(details.downloadLinks);
```

### Download Methods

#### `downloadImage(imageUrl, outputPath, options)`

Download a single image from a URL.

```javascript
await scraper.downloadImage(
  'https://mdl.artvee.com/ft/503222ld.jpg',
  './downloads/image.jpg',
  { overwrite: false }
);
```

#### `downloadArtwork(artwork, downloadDir, options)`

Download an artwork with its metadata.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `includeDetails` | boolean | false | Fetch and save detailed artwork info |
| `quality` | string | 'standard' | Image quality: 'thumbnail', 'standard', 'high' |
| `overwrite` | boolean | false | Overwrite existing files |

```javascript
const result = await scraper.downloadArtwork(
  artwork,
  './downloads/single',
  {
    includeDetails: true,
    quality: 'high',
    overwrite: false
  }
);
```

#### `downloadMultipleArtworks(artworks, downloadDir, options)`

Download multiple artworks with batch processing.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `delay` | number | 1000 | Delay between downloads in milliseconds |
| `maxConcurrent` | number | 3 | Maximum concurrent downloads |
| `includeDetails` | boolean | false | Fetch and save detailed artwork info |
| `quality` | string | 'standard' | Image quality |
| `overwrite` | boolean | false | Overwrite existing files |

```javascript
const summary = await scraper.downloadMultipleArtworks(
  artworks,
  './downloads/batch',
  {
    delay: 1500,
    maxConcurrent: 3,
    quality: 'standard',
    includeDetails: true
  }
);

console.log(`Downloaded ${summary.successful} artworks`);
```

### Run Examples

```bash
npm run example      # Basic scraping examples
npm run download    # Download examples with premium support
npm run quick       # Quick start example
```

## Response Format

### `scrapeArtworks()` Response

```javascript
{
  artworks: [
    {
      title: "Artwork Title - Artist Name",
      url: "https://artvee.com/dl/artwork-url/",
      imageUrl: "https://...",
      thumbnailUrl: "https://...",
      artist: "Artist Name"
    },
    // ... more artworks
  ],
  pagination: {
    currentPage: 1,
    totalPages: 10,
    hasNextPage: true,
    hasPrevPage: false
  },
  url: "https://artvee.com/c/landscape/?filter_century=17th-century...",
  totalResults: 70,
  filters: {
    category: "landscape",
    century: "17th-century",
    orientation: "landscape",
    perPage: 70,
    page: 1
  }
}
```

### `scrapeArtworkDetails()` Response

```javascript
{
  title: "Artwork Title",
  url: "https://artvee.com/dl/artwork-url/",
  mainImage: "https://...",
  description: "Artwork description...",
  artist: "Artist Name",
  year: "1650",
  dimensions: "100x80cm",
  downloadLinks: [
    {
      text: "Download High Resolution",
      url: "https://..."
    }
  ]
}
```

## Example: Matching Your URL

To match the URL you provided:
```
https://artvee.com/c/landscape/?filter_century=17th-century&filter_orientation=landscape&query_type_orientation=or&per_row=5&shop_view=grid&per_page=70
```

Use this code:

```javascript
const results = await scraper.scrapeArtworks({
  category: 'landscape',
  century: '17th-century',
  orientation: 'landscape',
  perPage: 70
});
```

## Advanced Usage

### Scrape Multiple Pages

```javascript
async function scrapeAllPages(options) {
  const scraper = new ArtveeScraper();
  const allArtworks = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const results = await scraper.scrapeArtworks({
      ...options,
      page
    });

    allArtworks.push(...results.artworks);
    hasMore = results.pagination.hasNextPage;
    page++;

    // Be respectful - add delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return allArtworks;
}

// Usage
const allArtworks = await scrapeAllPages({
  category: 'landscape',
  century: '17th-century',
  orientation: 'landscape'
});
```

### Export to JSON

```javascript
const fs = require('fs');

const results = await scraper.scrapeArtworks({
  category: 'landscape',
  century: '17th-century',
  orientation: 'landscape',
  perPage: 70
});

fs.writeFileSync('artworks.json', JSON.stringify(results, null, 2));
```

## Rate Limiting

Please be respectful when using this scraper:
- Add delays between requests
- Don't overwhelm the server with too many concurrent requests
- Consider caching results

## Disclaimer

This scraper is for educational purposes only. Please respect Artvee.com's terms of service and robots.txt file. Always check and comply with the website's scraping policies.

## License

ISC
