# FAQ

Frequently asked questions about the Artvee Scraper.

## General Questions

### What is this scraper for?

The Artvee Scraper is a Node.js tool that allows you to:
- Scrape artwork metadata from Artvee.com
- Download high-quality public domain artworks
- Filter by category, century, and orientation
- Build custom art collections

### Is it legal to scrape Artvee?

Artvee provides public domain artworks. However:
- ✅ Personal use is generally acceptable
- ✅ Educational purposes
- ⚠️ Always check Artvee's current Terms of Service
- ⚠️ Be respectful with request rates
- ❌ Don't overwhelm their servers

Always review and comply with [Artvee's Terms of Service](https://artvee.com/terms-of-service/).

### Do I need a premium account?

No. The scraper works with free accounts. Premium offers:
- Higher resolution downloads (7000px+ vs 1800px)
- Potentially faster speeds
- Commercial usage rights (check terms)

See [Premium Account](Premium-Account) guide for setup.

---

## Installation & Setup

### What version of Node.js do I need?

**Minimum**: Node.js 14.x  
**Recommended**: Node.js 18.x or higher

Check your version:
```bash
node --version
```

### npm install fails. What should I do?

Try these steps:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Can I use this on Windows/Mac/Linux?

Yes! The scraper works on all platforms:
- ✅ Windows 10/11
- ✅ macOS
- ✅ Linux (Ubuntu, Debian, etc.)

---

## Usage Questions

### How many artworks can I scrape at once?

- Maximum per page: **70 artworks**
- Recommendation: Use pagination for larger collections
- Total artworks available: **100,000+** across all categories

### What image quality should I use?

| Quality | Resolution | Size | Use Case |
|---------|-----------|------|----------|
| `thumbnail` | ~500px | 50-100 KB | Previews, testing |
| `standard` | 1800px | 1-3 MB | **Recommended** for most uses |
| `high` | 4000-7000px+ | 10-30 MB | Printing, professional use |

### How do I download all artworks from a category?

See [Example 9](Examples#example-9-download-all-pages-from-category) for complete code:

```javascript
async function downloadAllPages(category, century) {
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const results = await scraper.scrapeArtworks({
      category, century, page, perPage: 70
    });

    await scraper.downloadMultipleArtworks(results.artworks, './downloads');
    hasMore = results.pagination.hasNextPage;
    page++;
  }
}
```

### Can I filter by artist name?

Artvee doesn't have artist filtering in URLs, but you can filter results:

```javascript
const results = await scraper.scrapeArtworks({ category: 'landscape' });
const rembrandtWorks = results.artworks.filter(art =>
  art.artist && art.artist.includes('Rembrandt')
);
```

---

## Download Questions

### Why are my downloads only 500px instead of 1800px?

Make sure you're using `quality: 'standard'` or `quality: 'high'`:

```javascript
await scraper.downloadArtwork(artwork, './downloads', {
  quality: 'standard'  // Not 'thumbnail'
});
```

### Downloads are very slow. How can I speed them up?

Increase concurrent downloads (but be respectful):

```javascript
{
  maxConcurrent: 5,  // Default is 3
  delay: 1000        // Reduce delay (carefully)
}
```

Note: Downloading too aggressively may get you rate-limited or blocked.

### How much disk space do I need?

Estimates per 1000 artworks:
- **Thumbnail**: ~75 MB
- **Standard**: ~2 GB
- **High**: ~20 GB

Always check available space before large batch downloads.

### Can I resume failed downloads?

Yes! The scraper skips existing files by default:

```javascript
// Re-run the same download - it will skip existing files
await scraper.downloadMultipleArtworks(artworks, './downloads', {
  overwrite: false  // Default - skips existing files
});

// Or only retry failures
const summary = await scraper.downloadMultipleArtworks(...);
const failed = summary.results.filter(r => !r.success);
// Retry failed downloads
```

---

## Technical Questions

### What data format does the scraper return?

JSON objects. See [API Reference](API-Reference#type-definitions) for complete schemas.

Example:
```javascript
{
  artworks: [...],
  pagination: {...},
  filters: {...}
}
```

### Can I export results to CSV/Excel?

Yes! See [Example 11](Examples#example-11-export-to-csv):

```javascript
const csv = results.artworks.map(art =>
  `"${art.title}","${art.artist}","${art.url}"`
).join('\n');

fs.writeFileSync('artworks.csv', csv);
```

### How do I get image dimensions before downloading?

The scraper includes image-size:

```javascript
const { imageSize } = require('image-size');

// After downloading
const dimensions = imageSize('./path/to/image.jpg');
console.log(`${dimensions.width} x ${dimensions.height}`);
```

### Can I use this in a web app?

Yes, but consider:
- Run scraper on the backend (Node.js server)
- Don't expose your auth cookies to frontend
- Cache results to reduce scraping frequency
- Consider rate limiting

---

## Error Messages

### "TypeError: ArtveeScraper is not a constructor"

**Problem**: Incorrect require path

**Solution**:
```javascript
// Correct
const ArtveeScraper = require('./scraper');

// Or if in examples folder
const ArtveeScraper = require('../scraper');
```

### "ECONNREFUSED" or "ETIMEDOUT"

**Problem**: Network connection issues

**Solutions**:
- Check internet connection
- Verify Artvee.com is accessible
- Check firewall/proxy settings
- Try again later

### "Error scraping Artvee: Invalid URL"

**Problem**: Malformed artwork URL

**Solution**: Ensure URLs are from Artvee.com:
```javascript
// Valid
https://artvee.com/dl/artwork-name/

// Invalid
https://example.com/...
```

### "ENOSPC: no space left on device"

**Problem**: Insufficient disk space

**Solution**:
- Free up disk space
- Download fewer artworks at once
- Use `thumbnail` quality for testing

---

## Best Practices

### How often should I scrape?

Recommendations:
- **Testing**: Every few minutes is OK
- **Regular use**: Daily or weekly
- **Large batches**: Add 2-3 second delays between requests
- **Continuous**: Don't run 24/7 scrapers

### What's a reasonable download rate?

Safe defaults:
```javascript
{
  delay: 1500,       // 1.5 seconds between batches
  maxConcurrent: 3   // 3 simultaneous downloads
}
```

This gives ~120 artworks/hour

### Should I cache results?

**Yes!** Cache to:
- Reduce unnecessary scraping
- Speed up your application
- Be respectful to Artvee's servers

```javascript
const fs = require('fs');
const cacheFile = 'cache.json';

// Check cache first
if (fs.existsSync(cacheFile)) {
  const cache = JSON.parse(fs.readFileSync(cacheFile));
  if (Date.now() - cache.timestamp < 24 * 60 * 60 * 1000) {
    return cache.data; // Use cached data if < 24 hours old
  }
}

// Otherwise scrape and cache
const results = await scraper.scrapeArtworks(...);
fs.writeFileSync(cacheFile, JSON.stringify({
  timestamp: Date.now(),
  data: results
}));
```

---

## Troubleshooting

### My script hangs / doesn't complete

Common causes:
1. **Network timeout**: Increase timeout in axios config
2. **Infinite loop**: Check pagination logic
3. **Memory leak**: Process too many artworks at once

**Solution**: Add timeouts and process in batches

### Images are corrupt or won't open

Possible issues:
1. **Incomplete download**: Check file size
2. **Network interruption**: Enable `overwrite` and re-download
3. **Disk full**: Free up space

**Verify downloads**:
```javascript
const { imageSize } = require('image-size');
try {
  const dimensions = imageSize('./image.jpg');
  console.log('✓ Valid image');
} catch (error) {
  console.log('✗ Corrupt image');
}
```

---

## Need More Help?

- Check [Troubleshooting](Troubleshooting) guide
- Review [Examples](Examples)
- Read [API Reference](API-Reference)
- Submit an issue on GitHub
