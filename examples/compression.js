/*
 * Copyright (c) 2026 Artvee Node Scraper Contributors
 * SPDX-License-Identifier: MIT
 */

const ArtveeScraper = require('../scraper');

/**
 * Image Compression Examples
 * 
 * Demonstrates various compression options to reduce file sizes
 * while maintaining quality.
 */

async function basicCompression() {
  console.log('═'.repeat(70));
  console.log('  IMAGE COMPRESSION EXAMPLES');
  console.log('═'.repeat(70));
  console.log();

  const scraper = new ArtveeScraper();
  
  try {
    // Get some artworks to download
    console.log('📥 Scraping artworks...\n');
    const results = await scraper.scrapeArtworks({
      category: 'abstract',
      century: '20th-century',
      perPage: 3,
      page: 1
    });

    console.log(`Found ${results.totalResults} artworks\n`);

    // Example 1: Basic compression with default settings (80% quality)
    console.log('─'.repeat(70));
    console.log('Example 1: Basic Compression (80% quality)');
    console.log('─'.repeat(70));
    console.log();

    await scraper.downloadArtwork(
      results.artworks[0],
      './downloads/compressed-basic',
      {
        quality: 'standard',
        compress: true,
        overwrite: true
      }
    );

    console.log('✓ Downloaded with 80% quality compression\n');

    // Example 2: High compression for smaller file sizes (60% quality)
    console.log('─'.repeat(70));
    console.log('Example 2: High Compression (60% quality)');
    console.log('─'.repeat(70));
    console.log();

    await scraper.downloadArtwork(
      results.artworks[1],
      './downloads/compressed-high',
      {
        quality: 'standard',
        compress: true,
        compressionOptions: {
          quality: 60
        },
        overwrite: true
      }
    );

    console.log('✓ Downloaded with 60% quality compression\n');

    // Example 3: Resize and compress
    console.log('─'.repeat(70));
    console.log('Example 3: Resize + Compress (1200px width, 80% quality)');
    console.log('─'.repeat(70));
    console.log();

    await scraper.downloadArtwork(
      results.artworks[2],
      './downloads/compressed-resized',
      {
        quality: 'standard',
        compress: true,
        compressionOptions: {
          quality: 80,
          width: 1200  // Resize to 1200px width (maintains aspect ratio)
        },
        overwrite: true
      }
    );

    console.log('✓ Downloaded, resized to 1200px, and compressed\n');

    // Example 4: Convert to WebP format (best compression)
    console.log('─'.repeat(70));
    console.log('Example 4: Convert to WebP (Modern format, best compression)');
    console.log('─'.repeat(70));
    console.log();

    await scraper.downloadArtwork(
      results.artworks[0],
      './downloads/compressed-webp',
      {
        quality: 'standard',
        compress: true,
        compressionOptions: {
          format: 'webp',
          quality: 85
        },
        overwrite: true
      }
    );

    console.log('✓ Downloaded and converted to WebP format\n');

    console.log('═'.repeat(70));
    console.log('  All Compression Examples Complete!');
    console.log('═'.repeat(70));
    console.log();

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n⚠️  Note: Image compression requires the \'sharp\' package.');
    console.error('   Install it with: npm install sharp\n');
  }
}

async function batchCompression() {
  console.log('\n🔄 Batch Download with Compression\n');

  const scraper = new ArtveeScraper();
  
  try {
    const results = await scraper.scrapeArtworks({
      category: 'landscape',
      century: '17th-century',
      perPage: 5,
      page: 1
    });

    // Download multiple artworks with compression
    await scraper.downloadMultipleArtworks(
      results.artworks,
      './downloads/batch-compressed',
      {
        quality: 'standard',
        compress: true,
        compressionOptions: {
          quality: 75,
          width: 1600  // Resize all to 1600px width
        },
        delay: 500,
        maxConcurrent: 2,
        showProgress: true,
        overwrite: true
      }
    );

    console.log('\n✅ Batch compression complete!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function compressionComparison() {
  console.log('\n📊 Compression Quality Comparison\n');

  const scraper = new ArtveeScraper();
  
  try {
    const results = await scraper.scrapeArtworks({
      category: 'portrait',
      perPage: 1,
      page: 1
    });

    const artwork = results.artworks[0];
    const qualities = [100, 90, 80, 70, 60, 50];

    console.log('Downloading same artwork with different compression levels...\n');

    for (const q of qualities) {
      const result = await scraper.downloadArtwork(
        artwork,
        `./downloads/comparison/q${q}`,
        {
          quality: 'standard',
          compress: true,
          compressionOptions: {
            quality: q
          },
          overwrite: true
        }
      );

      if (result.success && result.compression) {
        const comp = result.compression;
        console.log(`Quality ${q}%: ${comp.compressedSizeFormatted} (saved ${comp.savingsPercent}%)`);
      }
    }

    console.log('\n✅ Comparison complete! Check ./downloads/comparison/ folder\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run examples
async function main() {
  // Uncomment the example you want to run:
  
  await basicCompression();
  // await batchCompression();
  // await compressionComparison();
}

main();
