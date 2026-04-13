# Troubleshooting

Common issues and solutions for the Artvee Scraper.

## Installation Issues

### npm install fails with EACCES error

**Problem**: Permission denied during installation

**Solution (Linux/Mac)**:
```bash
sudo npm install
```

**Better solution**: Fix npm permissions
```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

**Solution (Windows)**:
Run PowerShell as Administrator or use:
```powershell
npm install --no-optional
```

### Module not found errors

**Problem**: `Cannot find module './scraper'`

**Solution**: Check your require path
```javascript
// If in root directory
const ArtveeScraper = require('./scraper');

// If in examples folder
const ArtveeScraper = require('../scraper');

// If in subdirectory
const ArtveeScraper = require('../../scraper');
```

### node-gyp build errors

**Problem**: Native module compilation fails

**Solution (Windows)**:
```powershell
npm install --global windows-build-tools
npm install
```

**Solution (Linux)**:
```bash
sudo apt-get install build-essential
npm install
```

**Solution (Mac)**:
```bash
xcode-select --install
npm install
```

---

## Scraping Issues

### Empty results / No artworks found

**Problem**: Scraping returns empty array

**Possible causes**:
1. Invalid parameters
2. Category/century combination has no results
3. Artvee changed their HTML structure

**Solution**:
```javascript
// Test with known working parameters
const results = await scraper.scrapeArtworks({
  category: 'landscape',
  century: '17th-century',
  perPage: 20
});

if (results.totalResults === 0) {
  console.log('No results found - check filters');
  console.log('Available categories:', scraper.getAvailableCategories());
}
```

### Scraping is very slow

**Problem**: Each request takes too long

**Possible causes**:
1. Slow internet connection
2. Artvee server is slow
3. Too many concurrent requests

**Solution**:
```javascript
// Reduce concurrent operations
// Add progress logging
console.log('Scraping page 1...');
const results = await scraper.scrapeArtworks({
  category: 'landscape',
  perPage: 20  // Start small
});
console.log(`Got ${results.totalResults} results`);
```

### "Error scraping Artvee" messages

**Problem**: Generic scraping error

**Debug steps**:
```javascript
try {
  const results = await scraper.scrapeArtworks({
    category: 'landscape'
  });
} catch (error) {
  console.error('Full error:', error);
  console.error('Error message:', error.message);
  console.error('Stack trace:', error.stack);
}
```

**Common fixes**:
1. Check internet connection
2. Verify Artvee.com is accessible
3. Update scraper to latest version
4. Check if Artvee changed their HTML

---

## Download Issues

### Downloads getting 500px images instead of 1800px

**Problem**: Wrong quality being downloaded

**Solution**: Ensure you're using 'standard' or 'high' quality
```javascript
await scraper.downloadArtwork(artwork, './downloads', {
  quality: 'standard'  // Not 'thumbnail'!
});
```

**Verify download**:
```javascript
const { imageSize } = require('image-size');
const dimensions = imageSize('./downloads/image.jpg');
console.log(`Downloaded: ${dimensions.width}x${dimensions.height}`);
// Should show 1800x... for standard quality
```

### Download fails with "ENOTFOUND" error

**Problem**: DNS/network error

**Solutions**:
1. **Check internet connection**
2. **Test connectivity**:
   ```bash
   ping artvee.com
   curl https://artvee.com
   ```
3. **Check firewall**
4. **Try different DNS** (e.g., 8.8.8.8)
5. **Disable VPN** temporarily

### Download hangs / never completes

**Problem**: Download process stalls

**Solution**: Add timeout
```javascript
// In scraper.js, modify downloadImage method
const response = await axios({
  method: 'GET',
  url: imageUrl,
  responseType: 'stream',
  headers: this.getHeaders(),
  timeout: 30000  // 30 second timeout
});
```

### "ENOSPC: no space left on device"

**Problem**: Disk full

**Solutions**:
1. **Check disk space**:
   ```bash
   # Linux/Mac
   df -h

   # Windows
   Get-PSDrive
   ```

2. **Free up space**:
   - Delete old downloads
   - Use external drive
   - Download fewer artworks

3. **Use thumbnail quality for testing**:
   ```javascript
   quality: 'thumbnail'  // Much smaller files
   ```

### Files won't open / Corrupt images

**Problem**: Downloaded images are broken

**Diagnose**:
```javascript
const fs = require('fs');
const { imageSize } = require('image-size');

function verifyImage(path) {
  try {
    const stats = fs.statSync(path);
    console.log(`File size: ${stats.size} bytes`);

    if (stats.size < 1000) {
      console.log('⚠️ File too small - likely corrupt');
      return false;
    }

    const dimensions = imageSize(path);
    console.log(`✓ Valid: ${dimensions.width}x${dimensions.height}`);
    return true;
  } catch (error) {
    console.log(`✗ Corrupt: ${error.message}`);
    return false;
  }
}

verifyImage('./downloads/image.jpg');
```

**Solution**: Re-download with overwrite
```javascript
await scraper.downloadArtwork(artwork, './downloads', {
  overwrite: true  // Force re-download
});
```

---

## Premium Account Issues

### Premium authentication not working

**Problem**: Premium features not accessible

**Debug authentication**:
```javascript
const scraper = new ArtveeScraper({
  authCookie: 'your_cookie_here'
});

console.log('Premium enabled:', scraper.isPremium);

// Test by getting artwork details
const results = await scraper.scrapeArtworks({ perPage: 1 });
const details = await scraper.scrapeArtworkDetails(results.artworks[0].url);
console.log('Download links:', details.downloadLinks.length);
```

**Solutions**:

1. **Refresh cookies** - They may have expired
   - Log in to Artvee.com again
   - Extract fresh cookies
   - Update configuration

2. **Check cookie format**:
   ```javascript
   // Correct format
   "cookie1=value1; cookie2=value2; cookie3=value3"

   // Incorrect
   ["cookie1=value1", "cookie2=value2"]  // Array - wrong!
   ```

3. **Include all cookies**:
   - Don't just copy one cookie
   - Copy the entire cookie string from DevTools

### High quality downloads same as standard

**Problem**: Premium high quality returns same size as standard

**Possible causes**:
1. Authentication not working (see above)
2. Artwork doesn't have high-res version
3. Need different approach

**Test**:
```javascript
// Compare download links
const details = await scraper.scrapeArtworkDetails(artworkUrl);
console.log('Available downloads:');
details.downloadLinks.forEach(link => {
  console.log(`- ${link.text}: ${link.url}`);
});
```

---

## Performance Issues

### Script uses too much memory

**Problem**: Node.js runs out of memory

**Solution 1**: Process in batches
```javascript
// Instead of loading all at once
const allPages = []; // Don't do this for 100+ pages

// Process one page at a time
async function processInBatches() {
  for (let page = 1; page <= 100; page++) {
    const results = await scraper.scrapeArtworks({ page });
    await scraper.downloadMultipleArtworks(results.artworks, './downloads');
    // results gets garbage collected after each iteration
  }
}
```

**Solution 2**: Increase Node.js memory
```bash
node --max-old-space-size=4096 your-script.js
```

### Too many concurrent downloads

**Problem**: Script crashes or downloads fail

**Solution**: Reduce concurrency
```javascript
await scraper.downloadMultipleArtworks(artworks, './downloads', {
  maxConcurrent: 1,  // One at a time
  delay: 2000        // 2 seconds between downloads
});
```

---

## Error Messages Reference

### TypeError: Cannot read property 'url' of undefined

**Cause**: Trying to access artwork that doesn't exist

**Fix**:
```javascript
// Bad
const artwork = results.artworks[999];  // Index out of bounds
await scraper.downloadArtwork(artwork, './downloads');

// Good
if (results.artworks.length > 0) {
  const artwork = results.artworks[0];
  await scraper.downloadArtwork(artwork, './downloads');
}
```

### ETIMEDOUT / ESOCKETTIMEDOUT

**Cause**: Network timeout

**Fix**: Increase timeout or retry
```javascript
async function downloadWithRetry(artwork, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await scraper.downloadArtwork(artwork, './downloads');
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(`Retry ${i + 1}/${maxRetries}...`);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}
```

### ECONNRESET

**Cause**: Connection reset by server

**Possible reasons**:
1. Too many requests (rate limiting)
2. Server issues
3. Network problems

**Fix**: Add delays and reduce concurrency
```javascript
{
  delay: 3000,       // Increase delay
  maxConcurrent: 1   // Reduce concurrency
}
```

---

## Debugging Tips

### Enable verbose logging

Add logging to track what's happening:

```javascript
console.log('Starting scrape...');
const results = await scraper.scrapeArtworks({
  category: 'landscape'
});
console.log(`Got ${results.totalResults} results`);
console.log('Pagination:', results.pagination);

for (const artwork of results.artworks) {
  console.log(`Downloading: ${artwork.title}`);
  const result = await scraper.downloadArtwork(artwork, './downloads');
  console.log(result.success ? '✓ Success' : '✗ Failed');
}
```

### Test with minimal example

Create a minimal test:

```javascript
const ArtveeScraper = require('./scraper');

async function test() {
  const scraper = new ArtveeScraper();

  console.log('Test 1: Scrape one page');
  const results = await scraper.scrapeArtworks({
    category: 'landscape',
    perPage: 5
  });
  console.log(`✓ Got ${results.totalResults} artworks`);

  console.log('\nTest 2: Download one artwork');
  const result = await scraper.downloadArtwork(
    results.artworks[0],
    './test-download',
    { quality: 'thumbnail' }
  );
  console.log(result.success ? '✓ Download OK' : '✗ Download failed');
}

test().catch(console.error);
```

### Check package versions

```bash
npm list
```

Ensure you have compatible versions:
- axios: ^1.6.0
- cheerio: ^1.0.0-rc.12
- image-size: Latest

---

## Getting Help

If you're still experiencing issues:

1. **Check existing issues** on GitHub
2. **Search the [FAQ](FAQ)**
3. **Create a minimal reproduction**
4. **Submit an issue with**:
   - Error message
   - Full stack trace
   - Node.js version (`node --version`)
   - Operating system
   - Minimal code to reproduce

---

## Still Need Help?

- Review the [Usage](Usage) guide
- Check [Examples](Examples) for working code
- Read the [API Reference](API-Reference)
- Submit an issue on GitHub
