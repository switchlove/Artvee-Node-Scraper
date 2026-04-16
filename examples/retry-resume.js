/*
 * Copyright (c) 2026 Artvee Node Scraper Contributors
 * SPDX-License-Identifier: MIT
 */

const ArtveeScraper = require('../scraper');

/**
 * Demonstrate retry logic and resume capability
 */
async function demo() {
  // Create scraper with retry configuration
  const scraper = new ArtveeScraper({
    maxRetries: 3,        // Retry up to 3 times on failure
    retryDelay: 1000,     // Start with 1 second delay
    enableResume: true    // Enable resume for interrupted downloads
  });

  console.log('🔄 Retry and Resume Demo\n');
  console.log('This demo shows:');
  console.log('1. Automatic retry with exponential backoff on failures');
  console.log('2. Resume capability for interrupted downloads');
  console.log('3. .partial markers for tracking incomplete downloads\n');

  // Example 1: Download with retry (will retry on network issues)
  console.log('═'.repeat(70));
  console.log('Example 1: Download with automatic retry\n');

  const result = await scraper.scrapeArtworks({
    page: 1
  });
  const artworks = result.artworks.slice(0, 3);

  if (artworks.length > 0) {
    console.log(`Found ${artworks.length} artworks, downloading first one...\n`);
    
    const result = await scraper.downloadArtwork(artworks[0], './downloads', {
      quality: 'standard',
      showProgress: true,
      maxRetries: 3,      // Override default if needed
      retryDelay: 500     // Faster retry for this download
    });

    if (result.success) {
      console.log(`\n✓ Download successful: ${result.path}`);
      console.log(`  Size: ${result.sizeFormatted}`);
      if (result.resumed) {
        console.log(`  🔄 Resumed from previous partial download`);
      }
    }
  }

  // Example 2: Demonstrate resume capability
  console.log('\n' + '═'.repeat(70));
  console.log('Example 2: Resume interrupted download\n');
  console.log('To test resume:');
  console.log('1. Start a large download');
  console.log('2. Interrupt it (Ctrl+C)');
  console.log('3. Run this script again');
  console.log('4. The download will resume from where it stopped\n');
  console.log('Look for files with .partial extension - these mark incomplete downloads');

  if (artworks.length > 1) {
    const result = await scraper.downloadArtwork(artworks[1], './downloads', {
      quality: 'high',     // Larger file to demonstrate resume
      showProgress: true,
      resume: true         // Enable resume (default)
    });

    if (result.success && result.resumed) {
      console.log(`\n✓ Resume successful! Download was continued from partial file`);
    }
  }

  // Example 3: Batch download with retry
  console.log('\n' + '═'.repeat(70));
  console.log('Example 3: Batch download with automatic retry\n');

  const batchResults = await scraper.downloadMultipleArtworks(
    artworks.slice(0, 3),
    './downloads',
    {
      showProgress: true,
      concurrency: 2,
      quality: 'standard',
      maxRetries: 2       // Each download will retry up to 2 times
    }
  );

  console.log('\n📊 Batch Download Summary:');
  console.log(`   Total: ${batchResults.total}`);
  console.log(`   ✓ Successful: ${batchResults.successful}`);
  console.log(`   ⊘ Skipped: ${batchResults.skipped}`);
  console.log(`   ✗ Failed: ${batchResults.failed}`);

  // Example 4: Disable resume for a download
  console.log('\n' + '═'.repeat(70));
  console.log('Example 4: Download without resume (fresh download)\n');

  if (artworks.length > 2) {
    const result = await scraper.downloadArtwork(artworks[2], './downloads', {
      quality: 'standard',
      showProgress: true,
      resume: false,      // Disable resume - always start fresh
      overwrite: true     // Overwrite any existing file
    });

    console.log(`\n✓ Fresh download complete: ${result.path}`);
  }

  // Example 5: Custom retry configuration
  console.log('\n' + '═'.repeat(70));
  console.log('Example 5: Custom retry configuration\n');

  const aggressiveScraper = new ArtveeScraper({
    maxRetries: 5,        // More aggressive retry
    retryDelay: 500,      // Shorter initial delay
    enableResume: true
  });

  console.log('Created scraper with aggressive retry:');
  console.log('  - Max retries: 5');
  console.log('  - Base delay: 500ms');
  console.log('  - Exponential backoff: 500ms, 1s, 2s, 4s, 8s\n');

  // Show retry behavior
  console.log('If a download fails, you will see:');
  console.log('  ⚠️  Download failed (attempt 1/5): Network error');
  console.log('     Retrying in 0.5s...');
  console.log('  ⚠️  Download failed (attempt 2/5): Network error');
  console.log('     Retrying in 1.0s...');
  console.log('  etc.\n');

  console.log('✅ Demo complete!\n');
  console.log('Key Features:');
  console.log('  • Automatic retry with exponential backoff (prevents server overload)');
  console.log('  • Resume interrupted downloads using HTTP Range headers');
  console.log('  • .partial markers track incomplete downloads');
  console.log('  • Configurable retry attempts and delays');
  console.log('  • Works with both individual and batch downloads');
}

demo().catch(console.error);
