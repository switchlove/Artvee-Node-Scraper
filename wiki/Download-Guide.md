# Download Guide

Complete guide to downloading artwork images from Artvee.com.

## Quick Start

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
    includeDetails: true
  }
);
```

## Quality Levels

### Thumbnail
- **Resolution**: ~500px width
- **File Size**: 50-100 KB
- **Use Case**: Quick previews, thumbnails
- **Downloads instantly from listing page**

```javascript
quality: 'thumbnail'
```

### Standard (Recommended)
- **Resolution**: 1800px width
- **File Size**: 1-3 MB
- **Use Case**: General use, digital viewing
- **Free to download**

```javascript
quality: 'standard'  // Default
```

### High
- **Resolution**: Up to 7000px+ width
- **File Size**: 10-30 MB
- **Use Case**: Printing, professional use
- **May require premium account**

```javascript
quality: 'high'
```

## Download Methods

### 1. Download Single Artwork

```javascript
const artwork = results.artworks[0];

const result = await scraper.downloadArtwork(
  artwork,
  './downloads/single',
  {
    quality: 'standard',
    includeDetails: true,
    overwrite: false
  }
);

if (result.success) {
  console.log(`Downloaded: ${result.path}`);
  console.log(`Size: ${result.sizeFormatted}`);
}
```

### 2. Download Multiple Artworks

```javascript
const summary = await scraper.downloadMultipleArtworks(
  results.artworks,
  './downloads/batch',
  {
    quality: 'standard',
    includeDetails: true,
    delay: 1500,
    maxConcurrent: 3,
    overwrite: false
  }
);

console.log(`Success: ${summary.successful}`);
console.log(`Failed: ${summary.failed}`);
console.log(`Skipped: ${summary.skipped}`);
```

### 3. Download Single Image URL

```javascript
await scraper.downloadImage(
  'https://mdl.artvee.com/sdl/503222ldsdl.jpg',
  './downloads/custom-image.jpg',
  { overwrite: false }
);
```

## Download Options

### downloadArtwork Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `quality` | string | 'standard' | Image quality level |
| `includeDetails` | boolean | false | Save metadata JSON |
| `overwrite` | boolean | false | Overwrite existing files |

### downloadMultipleArtworks Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `quality` | string | 'standard' | Image quality level |
| `includeDetails` | boolean | false | Save metadata JSON |
| `delay` | number | 1000 | Delay between batches (ms) |
| `maxConcurrent` | number | 3 | Concurrent downloads |
| `overwrite` | boolean | false | Overwrite existing files |

## Organize Downloads

### By Category and Century

```javascript
const category = 'landscape';
const century = '17th-century';
const downloadPath = `./downloads/${category}/${century}`;

await scraper.downloadMultipleArtworks(
  results.artworks,
  downloadPath,
  { quality: 'standard' }
);
```

### By Artist

```javascript
for (const artwork of results.artworks) {
  if (artwork.artist) {
    const artistPath = `./downloads/by-artist/${artwork.artist}`;
    await scraper.downloadArtwork(artwork, artistPath, {
      quality: 'standard'
    });
  }
}
```

## Download All Pages

```javascript
async function downloadAllPages(category, century) {
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const results = await scraper.scrapeArtworks({
      category,
      century,
      perPage: 70,
      page
    });

    await scraper.downloadMultipleArtworks(
      results.artworks,
      `./downloads/${category}/${century}/page-${page}`,
      {
        quality: 'standard',
        delay: 2000,
        maxConcurrent: 2
      }
    );

    hasMore = results.pagination.hasNextPage;
    page++;

    // Be extra respectful when downloading many pages
    await new Promise(r => setTimeout(r, 3000));
  }
}

// Usage
await downloadAllPages('landscape', '17th-century');
```

## Metadata Files

When `includeDetails: true`, a JSON file is saved alongside each image:

```json
{
  "title": "Skating on the Frozen Amstel River",
  "url": "https://artvee.com/dl/skating-on-the-frozen-amstel-river",
  "artist": "Adam van Breen",
  "imageUrl": "https://...",
  "details": {
    "title": "Skating on the Frozen Amstel River",
    "description": "...",
    "mainImage": "https://...",
    "downloadLinks": [...]
  },
  "downloadedAt": "2026-04-12T10:30:00.000Z",
  "quality": "standard",
  "localPath": "./downloads/Skating_on_the_Frozen_Amstel_River.jpg"
}
```

## Error Handling

```javascript
const summary = await scraper.downloadMultipleArtworks(
  artworks,
  './downloads',
  { quality: 'standard' }
);

// Check for failures
if (summary.failed > 0) {
  console.log('Failed downloads:');
  summary.results
    .filter(r => !r.success)
    .forEach(r => {
      console.log(`- ${r.artwork}: ${r.error}`);
    });
}
```

## Download Progress

```javascript
const artworks = results.artworks;
let completed = 0;

for (const artwork of artworks) {
  const result = await scraper.downloadArtwork(
    artwork,
    './downloads',
    { quality: 'standard' }
  );

  completed++;
  console.log(`Progress: ${completed}/${artworks.length} (${Math.round(completed/artworks.length*100)}%)`);

  // Delay between downloads
  await new Promise(r => setTimeout(r, 1500));
}
```

## Best Practices

### 1. Be Respectful

```javascript
// Good: Reasonable delays
await scraper.downloadMultipleArtworks(artworks, './downloads', {
  delay: 1500,
  maxConcurrent: 3
});

// Bad: Too aggressive
await scraper.downloadMultipleArtworks(artworks, './downloads', {
  delay: 0,
  maxConcurrent: 10  // Don't do this!
});
```

### 2. Check Disk Space

```javascript
const fs = require('fs');

function checkDiskSpace(path) {
  // Implementation depends on your OS
  // Consider using 'check-disk-space' package
}
```

### 3. Resume Failed Downloads

```javascript
// Load previous results
const previousResults = JSON.parse(fs.readFileSync('download-log.json'));
const failedArtworks = previousResults.results
  .filter(r => !r.success)
  .map(r => r.artwork);

// Retry failed downloads
if (failedArtworks.length > 0) {
  console.log(`Retrying ${failedArtworks.length} failed downloads...`);
  await scraper.downloadMultipleArtworks(
    failedArtworks,
    './downloads',
    { overwrite: true }
  );
}
```

### 4. Verify Downloads

```javascript
const { imageSize } = require('image-size');

for (const result of summary.results) {
  if (result.success) {
    const dimensions = imageSize(result.path);
    console.log(`${result.artwork}: ${dimensions.width}x${dimensions.height}`);
  }
}
```

## Troubleshooting

### Download fails with timeout

**Solution**: Increase delay and reduce concurrent downloads
```javascript
{
  delay: 3000,
  maxConcurrent: 1
}
```

### Out of disk space

**Solution**: Download in batches and archive
```javascript
// Download only 100 at a time
const batch = results.artworks.slice(0, 100);
await scraper.downloadMultipleArtworks(batch, './downloads', options);
```

### Image quality lower than expected

**Solution**: Use 'high' quality or check premium account
```javascript
{
  quality: 'high',
  includeDetails: true
}
```

## Next Steps

- Set up a [Premium Account](Premium-Account) for highest quality
- See [Examples](Examples) for more use cases
- Check [Troubleshooting](Troubleshooting) for common issues
