const ArtveeScraper = require('../scraper');

/**
 * Quick test to show progress bars with fresh downloads
 */

async function testFreshDownload() {
  console.log('🎨 Testing Progress Bars with Fresh Downloads\n');
  
  const scraper = new ArtveeScraper();
  
  try {
    // Scrape different artworks each time
    const results = await scraper.scrapeArtworks({
      category: 'abstract',
      century: '20th-century',
      perPage: 3,
      page: 1
    });

    console.log(`Found ${results.totalResults} artworks\n`);
    
    // Download with progress bars and overwrite to see actual progress
    console.log('📥 Downloading with live progress tracking...\n');
    
    await scraper.downloadMultipleArtworks(
      results.artworks,
      './downloads/fresh-test',
      {
        quality: 'standard',
        delay: 500,
        maxConcurrent: 2,
        showProgress: true,
        overwrite: true  // Force fresh downloads
      }
    );

    console.log('\n✅ Test complete!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testFreshDownload();
