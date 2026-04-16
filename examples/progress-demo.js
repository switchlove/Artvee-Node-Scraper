/*
 * Copyright (c) 2026 Artvee Node Scraper Contributors
 * SPDX-License-Identifier: MIT
 */

const ArtveeScraper = require('../scraper');

/**
 * Comprehensive Progress Bars Demo
 * Shows all the formatting improvements with examples
 */

async function comprehensiveDemo() {
  console.log('═'.repeat(70));
  console.log('  ENHANCED PROGRESS BARS - COMPREHENSIVE DEMO');
  console.log('═'.repeat(70));
  console.log();

  const scraper = new ArtveeScraper();
  
  try {
    // Demo 1: Multi-file download with progress bars
    console.log('📚 Demo 1: Multi-file Batch Download with Alignment\n');
    const results = await scraper.scrapeArtworks({
      category: 'landscape',
      century: '17th-century',
      perPage: 5,
      page: 1
    });

    await scraper.downloadMultipleArtworks(
      results.artworks,
      './downloads/demo',
      {
        quality: 'standard',
        delay: 500,
        maxConcurrent: 3,
        showProgress: true
      }
    );

    console.log('\n' + '─'.repeat(70) + '\n');

    // Demo 2: Single file download with progress
    console.log('📥 Demo 2: Single File Download with Progress Bar\n');
    
    const artwork = results.artworks[0];
    await scraper.downloadArtwork(
      artwork,
      './downloads/demo-single',
      {
        quality: 'standard',
        showProgress: true,
        overwrite: true
      }
    );

    console.log('\n' + '─'.repeat(70) + '\n');

    // Demo 3: Show the visual improvements
    console.log('✨ Progress Bar Features:\n');
    console.log('  ✓ 40-character padded filenames for perfect alignment');
    console.log('  ✓ Format: 📥 [Filename] │[Progress]│ XX% │ X.XX MB');
    console.log('  ✓ Shows "(cached)" indicator for existing files');
    console.log('  ✓ Clean visual separators (│) instead of pipes (|)');
    console.log('  ✓ Real-time size tracking during downloads');
    console.log('  ✓ Consistent 25-character progress bar width');
    console.log('  ✓ Human-readable file sizes (MB with 2 decimals)');
    console.log();

    console.log('═'.repeat(70));
    console.log('  Demo Complete!');
    console.log('═'.repeat(70));
    console.log();

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

comprehensiveDemo();
