/*
 * Copyright (c) 2026 Artvee Node Scraper Contributors
 * SPDX-License-Identifier: MIT
 */

const ArtveeScraper = require('../scraper');

/**
 * Example: Download artworks with progress bars
 * 
 * This example demonstrates the new progress bar functionality
 * for tracking download progress in real-time.
 */

async function downloadWithProgressBars() {
  console.log('🎨 Artvee Progress Bars Example\n');
  
  const scraper = new ArtveeScraper();
  
  try {
    // Scrape some artworks
    console.log('Scraping artworks...\n');
    const results = await scraper.scrapeArtworks({
      category: 'landscape',
      century: '19th-century',
      perPage: 10,
      page: 1
    });

    console.log(`Found ${results.totalResults} artworks\n`);
    
    // Example 1: Download multiple artworks with progress bars (default)
    console.log('📥 Downloading with progress bars (default behavior)...\n');
    await scraper.downloadMultipleArtworks(
      results.artworks.slice(0, 5),
      './downloads/with-progress',
      {
        quality: 'standard',
        delay: 500,
        maxConcurrent: 2,
        showProgress: true  // This is the default
      }
    );

    console.log('\n✅ Complete!\n');

    // Example 2: Download without progress bars (legacy behavior)
    console.log('📥 Downloading without progress bars...\n');
    await scraper.downloadMultipleArtworks(
      results.artworks.slice(5, 8),
      './downloads/no-progress',
      {
        quality: 'standard',
        delay: 500,
        maxConcurrent: 2,
        showProgress: false  // Disable progress bars
      }
    );

    console.log('\n✅ All downloads complete!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

/**
 * Example: Download single artwork with progress bar
 */
async function downloadSingleWithProgress() {
  console.log('🎨 Single Download with Progress Bar\n');
  
  const scraper = new ArtveeScraper();
  
  try {
    // Get one artwork
    const results = await scraper.scrapeArtworks({
      category: 'portrait',
      perPage: 1
    });

    if (results.artworks.length > 0) {
      const artwork = results.artworks[0];
      console.log(`Downloading: ${artwork.title}\n`);

      // Download with progress bar enabled
      const result = await scraper.downloadArtwork(
        artwork,
        './downloads/single',
        {
          quality: 'high',
          showProgress: true  // Show progress for single download
        }
      );

      if (result.success) {
        console.log(`\n✅ Downloaded: ${result.path}`);
        console.log(`   Size: ${result.sizeFormatted}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the examples
async function main() {
  console.log('═'.repeat(60));
  console.log('  ARTVEE PROGRESS BARS DEMONSTRATION');
  console.log('═'.repeat(60));
  console.log();

  // Uncomment the example you want to run:
  
  await downloadWithProgressBars();
  // await downloadSingleWithProgress();
}

main();
