# API Reference

Complete API documentation for the Artvee Scraper.

## Class: ArtveeScraper

### Constructor

```javascript
new ArtveeScraper([options])
```

Creates a new scraper instance.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `options` | Object | Optional configuration |
| `options.authCookie` | string | Authentication cookie for premium account |
| `options.headers` | Object | Additional HTTP headers |

#### Example

```javascript
// Basic scraper
const scraper = new ArtveeScraper();

// Premium scraper with authentication
const premiumScraper = new ArtveeScraper({
  authCookie: 'your_cookie_string',
  headers: {
    'X-Custom-Header': 'value'
  }
});
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `baseUrl` | string | Base URL for Artvee.com |
| `authCookie` | string\|null | Authentication cookie |
| `customHeaders` | Object | Additional headers |
| `isPremium` | boolean | Whether premium account is active |

---

## Methods

### scrapeArtworks(options)

Scrape artworks from Artvee.com with filters.

```javascript
async scrapeArtworks(options)
```

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `options.category` | string | 'landscape' | Category to filter |
| `options.century` | string | null | Century filter (e.g., '17th-century') |
| `options.orientation` | string | null | Orientation filter |
| `options.perPage` | number | 70 | Results per page (max: 70) |
| `options.page` | number | 1 | Page number |

#### Returns

Promise\<Object\> - Scraped results object

```javascript
{
  artworks: Array<Artwork>,
  pagination: PaginationInfo,
  url: string,
  totalResults: number,
  filters: FilterOptions
}
```

#### Example

```javascript
const results = await scraper.scrapeArtworks({
  category: 'landscape',
  century: '17th-century',
  orientation: 'landscape',
  perPage: 20,
  page: 1
});
```

---

### scrapeArtworkDetails(artworkUrl)

Get detailed information for a specific artwork.

```javascript
async scrapeArtworkDetails(artworkUrl)
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `artworkUrl` | string | Full URL to artwork page |

#### Returns

Promise\<ArtworkDetails\>

```javascript
{
  title: string,
  url: string,
  mainImage: string,
  imageAlt: string,
  description: string,
  artist: string | null,
  downloadLinks: Array<DownloadLink>
}
```

#### Example

```javascript
const details = await scraper.scrapeArtworkDetails(
  'https://artvee.com/dl/skating-on-the-frozen-amstel-river'
);
```

---

### downloadImage(imageUrl, outputPath, [options])

Download a single image from a URL.

```javascript
async downloadImage(imageUrl, outputPath, options)
```

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `imageUrl` | string | - | URL of image to download |
| `outputPath` | string | - | Local path to save image |
| `options.overwrite` | boolean | false | Overwrite if exists |

#### Returns

Promise\<DownloadResult\>

```javascript
{
  success: boolean,
  path: string,
  size?: number,
  sizeFormatted?: string,
  skipped?: boolean,
  error?: string
}
```

#### Example

```javascript
const result = await scraper.downloadImage(
  'https://mdl.artvee.com/sdl/503222ldsdl.jpg',
  './downloads/image.jpg',
  { overwrite: false }
);
```

---

### downloadArtwork(artwork, downloadDir, [options])

Download an artwork with metadata.

```javascript
async downloadArtwork(artwork, downloadDir, options)
```

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `artwork` | Artwork | - | Artwork object |
| `downloadDir` | string | './downloads' | Download directory |
| `options.quality` | string | 'standard' | 'thumbnail', 'standard', or 'high' |
| `options.includeDetails` | boolean | false | Save metadata JSON |
| `options.overwrite` | boolean | false | Overwrite existing files |

#### Returns

Promise\<DownloadResult\>

#### Example

```javascript
const result = await scraper.downloadArtwork(
  artwork,
  './downloads/single',
  {
    quality: 'standard',
    includeDetails: true,
    overwrite: false
  }
);
```

---

### downloadMultipleArtworks(artworks, downloadDir, [options])

Download multiple artworks in batch.

```javascript
async downloadMultipleArtworks(artworks, downloadDir, options)
```

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `artworks` | Array\<Artwork\> | - | Array of artwork objects |
| `downloadDir` | string | './downloads' | Download directory |
| `options.quality` | string | 'standard' | Image quality |
| `options.includeDetails` | boolean | false | Save metadata JSON |
| `options.delay` | number | 1000 | Delay between batches (ms) |
| `options.maxConcurrent` | number | 3 | Max concurrent downloads |
| `options.overwrite` | boolean | false | Overwrite existing files |

#### Returns

Promise\<DownloadSummary\>

```javascript
{
  total: number,
  successful: number,
  skipped: number,
  failed: number,
  results: Array<DownloadResult>
}
```

#### Example

```javascript
const summary = await scraper.downloadMultipleArtworks(
  artworks,
  './downloads/batch',
  {
    quality: 'standard',
    delay: 1500,
    maxConcurrent: 3
  }
);
```

---

### getAvailableCategories()

Get list of available category filters.

```javascript
getAvailableCategories()
```

#### Returns

Array\<string\> - List of category names

#### Example

```javascript
const categories = scraper.getAvailableCategories();
// ['abstract', 'figurative', 'landscape', ...]
```

---

### getAvailableCenturies()

Get list of available century filters.

```javascript
getAvailableCenturies()
```

#### Returns

Array\<string\> - List of century values

#### Example

```javascript
const centuries = scraper.getAvailableCenturies();
// ['15th-century', '16th-century', ...]
```

---

### getAvailableOrientations()

Get list of available orientation filters.

```javascript
getAvailableOrientations()
```

#### Returns

Array\<string\> - List of orientation values

#### Example

```javascript
const orientations = scraper.getAvailableOrientations();
// ['landscape', 'portrait', 'square', 'panorama']
```

---

## Type Definitions

### Artwork

```typescript
interface Artwork {
  title: string;
  url: string;
  imageUrl: string;
  thumbnailUrl: string;
  artist: string | null;
}
```

### ArtworkDetails

```typescript
interface ArtworkDetails {
  title: string;
  url: string;
  mainImage: string;
  imageAlt: string;
  description: string;
  artist: string | null;
  year: string | null;
  dimensions: string | null;
  downloadLinks: DownloadLink[];
}
```

### DownloadLink

```typescript
interface DownloadLink {
  text: string;
  url: string;
}
```

### PaginationInfo

```typescript
interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
```

### DownloadResult

```typescript
interface DownloadResult {
  success: boolean;
  path: string;
  size?: number;
  sizeFormatted?: string;
  skipped?: boolean;
  error?: string;
  artwork?: string;
  url?: string;
  imageUrl?: string;
}
```

### DownloadSummary

```typescript
interface DownloadSummary {
  total: number;
  successful: number;
  skipped: number;
  failed: number;
  results: DownloadResult[];
}
```

---

## Internal Methods

These methods are used internally and typically don't need to be called directly.

### getHeaders()

Returns HTTP headers including authentication if available.

### buildUrl(category, century, orientation, perPage, page)

Builds the Artvee.com URL with query parameters.

### extractArtist(title)

Extracts artist name from artwork title.

### extractPagination($)

Extracts pagination information from page HTML.

### sanitizeFilename(filename)

Sanitizes a string for use as a filename.

### formatBytes(bytes)

Formats byte count to human-readable string.

---

## Error Handling

All async methods may throw errors. Wrap calls in try-catch:

```javascript
try {
  const results = await scraper.scrapeArtworks({
    category: 'landscape'
  });
} catch (error) {
  console.error('Scraping failed:', error.message);
}
```

Common error scenarios:
- Network errors (timeouts, connection failures)
- Invalid URLs or parameters
- Blocked/rate-limited requests
- File system errors (disk full, permissions)

---

## Next Steps

- See [Usage](Usage) guide for practical examples
- Check [Download Guide](Download-Guide) for downloading artwork
- Review [Examples](Examples) for common patterns
