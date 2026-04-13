# Basic Usage

## Getting Started

### 1. Import the Scraper

```javascript
const ArtveeScraper = require('./scraper');
const scraper = new ArtveeScraper();
```

### 2. Scrape Artworks

```javascript
const results = await scraper.scrapeArtworks({
  category: 'landscape',
  century: '17th-century',
  orientation: 'landscape',
  perPage: 20,
  page: 1
});

console.log(results.artworks);
```

## Scraping Options

### Basic Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `category` | string | 'landscape' | Category to filter |
| `century` | string | null | Century filter (e.g., '17th-century') |
| `orientation` | string | null | Orientation filter |
| `perPage` | number | 70 | Results per page (max: 70) |
| `page` | number | 1 | Page number |

### Available Categories

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
- `drawings`
- `plants-animals`

### Available Centuries

- `15th-century`
- `16th-century`
- `17th-century`
- `18th-century`
- `19th-century`
- `20th-century`
- `21st-century`

### Available Orientations

- `landscape` - Horizontal images
- `portrait` - Vertical images
- `square` - Square images
- `panorama` - Wide panoramic images

## Response Format

### Scraped Results Object

```javascript
{
  artworks: [
    {
      title: "Artwork Title",
      url: "https://artvee.com/dl/artwork-url/",
      imageUrl: "https://mdl.artvee.com/ft/503222ld.jpg",
      thumbnailUrl: "https://...",
      artist: "Artist Name"
    },
    // ... more artworks
  ],
  pagination: {
    currentPage: 1,
    totalPages: 115,
    hasNextPage: true,
    hasPrevPage: false
  },
  url: "https://artvee.com/c/landscape/...",
  totalResults: 20,
  filters: {
    category: "landscape",
    century: "17th-century",
    orientation: "landscape",
    perPage: 20,
    page: 1
  }
}
```

## Common Use Cases

### 1. Filter by Century

```javascript
// Get 19th century artworks
const results = await scraper.scrapeArtworks({
  century: '19th-century',
  perPage: 50
});
```

### 2. Filter by Category and Orientation

```javascript
// Get portrait-oriented figurative art
const results = await scraper.scrapeArtworks({
  category: 'figurative',
  orientation: 'portrait',
  perPage: 30
});
```

### 3. Paginate Through Results

```javascript
// Get page 5 of landscape artworks
const results = await scraper.scrapeArtworks({
  category: 'landscape',
  perPage: 70,
  page: 5
});

console.log(`Viewing page ${results.pagination.currentPage} of ${results.pagination.totalPages}`);
```

### 4. Get All Pages

```javascript
async function getAllPages(options) {
  let allArtworks = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const results = await scraper.scrapeArtworks({
      ...options,
      page: page
    });

    allArtworks.push(...results.artworks);
    hasMore = results.pagination.hasNextPage;
    page++;

    // Be respectful - add delay
    await new Promise(r => setTimeout(r, 2000));
  }

  return allArtworks;
}

// Usage
const all17thCentury = await getAllPages({
  category: 'landscape',
  century: '17th-century'
});
```

## Get Artwork Details

For detailed information about a specific artwork:

```javascript
const artwork = results.artworks[0];
const details = await scraper.scrapeArtworkDetails(artwork.url);

console.log(details.title);
console.log(details.artist);
console.log(details.description);
console.log(details.mainImage);
console.log(details.downloadLinks);
```

## Helper Methods

### Get Available Filters

```javascript
// Get all available categories
const categories = scraper.getAvailableCategories();
console.log(categories);

// Get all available centuries
const centuries = scraper.getAvailableCenturies();
console.log(centuries);

// Get all available orientations
const orientations = scraper.getAvailableOrientations();
console.log(orientations);
```

## Export Results

### Save as JSON

```javascript
const fs = require('fs');

const results = await scraper.scrapeArtworks({
  category: 'abstract',
  century: '20th-century'
});

fs.writeFileSync('artworks.json', JSON.stringify(results, null, 2));
```

### Save as CSV

```javascript
const fs = require('fs');

const csv = 'Title,Artist,URL,ImageURL\n' + 
  results.artworks.map(art =>
    `"${art.title}","${art.artist}","${art.url}","${art.imageUrl}"`
  ).join('\n');

fs.writeFileSync('artworks.csv', csv);
```

## Best Practices

1. **Use delays**: Add delays between requests to be respectful
2. **Handle errors**: Wrap scraping calls in try-catch blocks
3. **Check pagination**: Use `hasNextPage` to avoid empty requests
4. **Limit results**: Don't scrape more than you need
5. **Cache results**: Save results to avoid redundant scraping

## Next Steps

- Learn how to [download images](Download-Guide)
- See more [examples](Examples)
- Check the complete [API Reference](API-Reference)
