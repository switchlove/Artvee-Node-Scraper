# Examples

Practical code examples for common use cases.

## Table of Contents

- [Basic Scraping](#basic-scraping)
- [Download Examples](#download-examples)
- [Advanced Filtering](#advanced-filtering)
- [Batch Processing](#batch-processing)
- [Data Export](#data-export)
- [Premium Features](#premium-features)

---

## Basic Scraping

### Example 1: Scrape 17th Century Landscape Art

```javascript
const ArtveeScraper = require('./scraper');
const scraper = new ArtveeScraper();

async function scrape17thCentury() {
  const results = await scraper.scrapeArtworks({
    category: 'landscape',
    century: '17th-century',
    orientation: 'landscape',
    perPage: 70,
    page: 1
  });

  console.log(`Found ${results.totalResults} artworks`);
  console.log(`Page ${results.pagination.currentPage} of ${results.pagination.totalPages}`);

  results.artworks.forEach((artwork, index) => {
    console.log(`${index + 1}. ${artwork.title}`);
    console.log(`   Artist: ${artwork.artist || 'Unknown'}`);
    console.log(`   URL: ${artwork.url}`);
  });
}

scrape17thCentury();
```

### Example 2: Browse All Categories

```javascript
async function browseAllCategories() {
  const scraper = new ArtveeScraper();
  const categories = scraper.getAvailableCategories();

  for (const category of categories) {
    console.log(`\nCategory: ${category}`);
    console.log('─'.repeat(50));

    const results = await scraper.scrapeArtworks({
      category,
      perPage: 5
    });

    results.artworks.forEach(art => {
      console.log(`- ${art.title}`);
    });

    // Delay between requests
    await new Promise(r => setTimeout(r, 2000));
  }
}

browseAllCategories();
```

### Example 3: Search by Artist

```javascript
async function findArtistWorks(artistName) {
  const scraper = new ArtveeScraper();
  const allArtworks = [];

  // Search across multiple categories
  const categories = ['landscape', 'figurative', 'still-life'];

  for (const category of categories) {
    const results = await scraper.scrapeArtworks({
      category,
      perPage: 70
    });

    const artistWorks = results.artworks.filter(art =>
      art.artist && art.artist.toLowerCase().includes(artistName.toLowerCase())
    );

    allArtworks.push(...artistWorks);
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log(`Found ${allArtworks.length} artworks by ${artistName}`);
  return allArtworks;
}

findArtistWorks('Rembrandt');
```

---

## Download Examples

### Example 4: Download Specific Artworks

```javascript
async function downloadSpecificArtworks() {
  const scraper = new ArtveeScraper();

  const results = await scraper.scrapeArtworks({
    category: 'landscape',
    century: '18th-century',
    perPage: 20
  });

  // Download only first 5 artworks
  const toDownload = results.artworks.slice(0, 5);

  const summary = await scraper.downloadMultipleArtworks(
    toDownload,
    './downloads/selected',
    {
      quality: 'standard',
      includeDetails: true,
      delay: 1500,
      maxConcurrent: 2
    }
  );

  console.log(`Downloaded ${summary.successful} of ${summary.total} artworks`);
}

downloadSpecificArtworks();
```

### Example 5: Download by File Size

```javascript
const fs = require('fs');
const { imageSize } = require('image-size');

async function downloadLargeArtworks(minWidth = 2000) {
  const scraper = new ArtveeScraper();

  const results = await scraper.scrapeArtworks({
    category: 'landscape',
    perPage: 50
  });

  for (const artwork of results.artworks) {
    // Get details to check image size
    const details = await scraper.scrapeArtworkDetails(artwork.url);

    // Download temporarily to check dimensions
    const tempPath = './temp-check.jpg';
    await scraper.downloadImage(details.mainImage, tempPath);

    const dimensions = imageSize(tempPath);

    if (dimensions.width >= minWidth) {
      console.log(`✓ ${artwork.title}: ${dimensions.width}px - Keeping`);
      // Move to permanent location
      fs.renameSync(tempPath, `./downloads/large/${artwork.title}.jpg`);
    } else {
      console.log(`✗ ${artwork.title}: ${dimensions.width}px - Skipping`);
      fs.unlinkSync(tempPath);
    }

    await new Promise(r => setTimeout(r, 2000));
  }
}

downloadLargeArtworks(2000);
```

### Example 6: Download with Progress Bar

```javascript
async function downloadWithProgress() {
  const scraper = new ArtveeScraper();

  const results = await scraper.scrapeArtworks({
    category: 'abstract',
    century: '20th-century',
    perPage: 20
  });

  console.log(`Downloading ${results.totalResults} artworks...\n`);

  let completed = 0;

  for (const artwork of results.artworks) {
    const result = await scraper.downloadArtwork(
      artwork,
      './downloads/progress',
      `{ quality: 'standard' }
    );

    completed++;
    const percent = Math.round((completed / results.totalResults) * 100);
    const bar = '█'.repeat(Math.floor(percent / 2)) + '░'.repeat(50 - Math.floor(percent / 2));

    process.stdout.write(`\r[${bar}] ${percent}% (${completed}/${results.totalResults})`);

    await new Promise(r => setTimeout(r, 1500));
  }

  console.log('\n\n✓ Download complete!');
}

downloadWithProgress();
```

---

## Advanced Filtering

### Example 7: Multi-Century Collection

```javascript
async function downloadMultiCenturyCollection() {
  const scraper = new ArtveeScraper();
  const centuries = ['17th-century', '18th-century', '19th-century'];

  for (const century of centuries) {
    console.log(`\nProcessing ${century}...`);

    const results = await scraper.scrapeArtworks({
      category: 'landscape',
      century,
      perPage: 30
    });

    await scraper.downloadMultipleArtworks(
      results.artworks,
      `./downloads/by-century/${century}`,
      {
        quality: 'standard',
        includeDetails: true,
        delay: 2000,
        maxConcurrent: 2
      }
    );

    await new Promise(r => setTimeout(r, 5000));
  }
}

downloadMultiCenturyCollection();
```

### Example 8: Filter by Orientation

```javascript
async function downloadByOrientation() {
  const scraper = new ArtveeScraper();
  const orientations = ['landscape', 'portrait', 'square'];

  for (const orientation of orientations) {
    console.log(`\nDownloading ${orientation} artworks...`);

    const results = await scraper.scrapeArtworks({
      category: 'figurative',
      century: '19th-century',
      orientation,
      perPage: 20
    });

    await scraper.downloadMultipleArtworks(
      results.artworks,
      `./downloads/by-orientation/${orientation}`,
      {
        quality: 'standard',
        delay: 1500
      }
    );
  }
}

downloadByOrientation();
```

---

## Batch Processing

### Example 9: Download All Pages from Category

```javascript
async function downloadAllPagesFromCategory(category, century) {
  const scraper = new ArtveeScraper();
  let page = 1;
  let hasMore = true;
  let totalDownloaded = 0;

  while (hasMore) {
    console.log(`\nProcessing page ${page}...`);

    const results = await scraper.scrapeArtworks({
      category,
      century,
      perPage: 70,
      page
    });

    const summary = await scraper.downloadMultipleArtworks(
      results.artworks,
      `./downloads/${category}/${century}`,
      {
        quality: 'standard',
        delay: 2000,
        maxConcurrent: 3,
        includeDetails: true
      }
    );

    totalDownloaded += summary.successful;
    console.log(`Page ${page} complete: ${summary.successful} downloaded`);

    hasMore = results.pagination.hasNextPage;
    page++;

    // Extra delay between pages
    if (hasMore) {
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  console.log(`\n✓ Total downloaded: ${totalDownloaded} artworks`);
}

downloadAllPagesFromCategory('landscape', '17th-century');
```

### Example 10: Parallel Category Downloads

```javascript
async function parallelCategoryDownloads() {
  const scraper = new ArtveeScraper();
  const categories = ['abstract', 'landscape', 'still-life'];

  const downloadPromises = categories.map(async (category) => {
    const results = await scraper.scrapeArtworks({
      category,
      perPage: 20
    });

    return scraper.downloadMultipleArtworks(
      results.artworks,
      `./downloads/${category}`,
      {
        quality: 'standard',
        delay: 2000,
        maxConcurrent: 1 // Keep low to avoid overwhelming server
      }
    );
  });

  const summaries = await Promise.all(downloadPromises);

  summaries.forEach((summary, index) => {
    console.log(`${categories[index]}: ${summary.successful} downloaded`);
  });
}

parallelCategoryDownloads();
```

---

## Data Export

### Example 11: Export to CSV

```javascript
const fs = require('fs');

async function exportToCSV() {
  const scraper = new ArtveeScraper();

  const results = await scraper.scrapeArtworks({
    category: 'landscape',
    century: '17th-century',
    perPage: 70
  });

  const csv = [
    ['Title', 'Artist', 'URL', 'Image URL', 'Thumbnail URL'],
    ...results.artworks.map(art => [
      `"${art.title || ''}"`,
      `"${art.artist || ''}"`,
      `"${art.url || ''}"`,
      `"${art.imageUrl || ''}"`,
      `"${art.thumbnailUrl || ''}"`
    ])
  ];

  const csvContent = csv.map(row => row.join(',')).join('\n');
  fs.writeFileSync('artworks.csv', csvContent);

  console.log(`✓ Exported ${results.totalResults} artworks to artworks.csv`);
}

exportToCSV();
```

### Example 12: Create Artwork Database

```javascript
const fs = require('fs');

async function createArtworkDatabase() {
  const scraper = new ArtveeScraper();
  const categories = scraper.getAvailableCategories();
  const database = [];

  for (const category of categories) {
    console.log(`Scanning ${category}...`);

    const results = await scraper.scrapeArtworks({
      category,
      perPage: 70
    });

    for (const artwork of results.artworks) {
      const details = await scraper.scrapeArtworkDetails(artwork.url);

      database.push({
        ...artwork,
        category,
        description: details.description,
        downloadLinks: details.downloadLinks,
        scrapedAt: new Date().toISOString()
      });

      await new Promise(r => setTimeout(r, 1000));
    }

    await new Promise(r => setTimeout(r, 3000));
  }

  fs.writeFileSync('artwork-database.json', JSON.stringify(database, null, 2));
  console.log(`\n✓ Created database with ${database.length} artworks`);
}

createArtworkDatabase();
```

---

## Premium Features

### Example 13: Premium High-Quality Downloads

```javascript
async function premiumHighQualityDownload() {
  const premiumScraper = new ArtveeScraper({
    authCookie: process.env.ARTVEE_COOKIE
  });

  if (!premiumScraper.isPremium) {
    console.error('❌ Premium account not configured');
    return;
  }

  const results = await premiumScraper.scrapeArtworks({
    category: 'landscape',
    century: '18th-century',
    perPage: 10
  });

  await premiumScraper.downloadMultipleArtworks(
    results.artworks,
    './downloads/premium-hq',
    {
      quality: 'high',  // Highest quality available
      includeDetails: true,
      delay: 2000,
      maxConcurrent: 2
    }
  );

  console.log('✓ Premium high-quality downloads complete');
}

premiumHighQualityDownload();
```

### Example 14: Compare Free vs Premium Quality

```javascript
async function compareFreeVsPremium(artworkUrl) {
  const freeScraper = new ArtveeScraper();
  const premiumScraper = new ArtveeScraper({
    authCookie: process.env.ARTVEE_COOKIE
  });

  // Get details with both accounts
  const freeDetails = await freeScraper.scrapeArtworkDetails(artworkUrl);
  const premiumDetails = await premiumScraper.scrapeArtworkDetails(artworkUrl);

  console.log('Free Account Downloads:');
  freeDetails.downloadLinks.forEach(link => {
    console.log(`- ${link.text}: ${link.url}`);
  });

  console.log('\nPremium Account Downloads:');
  premiumDetails.downloadLinks.forEach(link => {
    console.log(`- ${link.text}: ${link.url}`);
  });
}

compareFreeVsPremium('https://artvee.com/dl/skating-on-the-frozen-amstel-river');
```

---

## Next Steps

- Review [API Reference](API-Reference) for detailed documentation
- Check [Download Guide](Download-Guide) for more download options
- See [Premium Account](Premium-Account) setup guide
