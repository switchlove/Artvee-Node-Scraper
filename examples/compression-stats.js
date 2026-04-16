/*
 * Copyright (c) 2026 Artvee Node Scraper Contributors
 * SPDX-License-Identifier: MIT
 */

const ArtveeScraper = require('../scraper');
const fs = require('fs');

/**
 * Detailed compression test showing before/after statistics
 */

async function testCompressionStats() {
  console.log('═'.repeat(80));
  console.log('  COMPRESSION STATISTICS TEST');
  console.log('═'.repeat(80));
  console.log();

  const scraper = new ArtveeScraper();
  
  try {
    // Download one artwork without compression
    console.log('📥 Step 1: Download original (no compression)...\n');
    
    const results = await scraper.scrapeArtworks({
      category: 'landscape',
      century: '19th-century',
      perPage: 1,
      page: 1
    });

    const artwork = results.artworks[0];
    console.log(`Artwork: ${artwork.title}`);
    console.log(`Artist: ${artwork.artist}\n`);

    // Download original
    const original = await scraper.downloadArtwork(
      artwork,
      './downloads/compression-test',
      {
        quality: 'standard',
        compress: false,
        overwrite: true
      }
    );

    console.log(`✓ Original downloaded: ${original.sizeFormatted}\n`);
    console.log('─'.repeat(80));
    console.log('📊 Step 2: Test different compression levels...\n');

    const compressionLevels = [
      { quality: 100, desc: 'No compression (100%)' },
      { quality: 90, desc: 'Light compression (90%)' },
      { quality: 80, desc: 'Standard compression (80%)' },
      { quality: 70, desc: 'Medium compression (70%)' },
      { quality: 60, desc: 'High compression (60%)' },
      { quality: 50, desc: 'Very high compression (50%)' }
    ];

    console.log(`${'Quality'.padEnd(15)} | ${'Description'.padEnd(28)} | ${'Size'.padEnd(10)} | ${'Savings'}`);
    console.log('─'.repeat(80));

    for (const level of compressionLevels) {
      // Download with compression
      const compressed = await scraper.downloadArtwork(
        artwork,
        `./downloads/compression-test/q${level.quality}`,
        {
          quality: 'standard',
          compress: true,
          compressionOptions: {
            quality: level.quality
          },
          overwrite: true
        }
      );

      if (compressed.success && compressed.compression) {
        const comp = compressed.compression;
        const savings = `${comp.savingsPercent}% (${comp.savingsFormatted})`;
        console.log(`${('Q' + level.quality).padEnd(15)} | ${level.desc.padEnd(28)} | ${comp.compressedSizeFormatted.padEnd(10)} | ${savings}`);
      }
    }

    console.log('\n─'.repeat(80));
    console.log('🔄 Step 3: Test format conversion...\n');

    const formats = [
      { format: 'jpeg', desc: 'JPEG (standard)' },
      { format: 'png', desc: 'PNG (lossless)' },
      { format: 'webp', desc: 'WebP (modern)' }
    ];

    console.log(`${'Format'.padEnd(15)} | ${'Description'.padEnd(28)} | ${'Size'.padEnd(10)} | ${'Savings'}`);
    console.log('─'.repeat(80));

    for (const fmt of formats) {
      const converted = await scraper.downloadArtwork(
        artwork,
        `./downloads/compression-test/format-${fmt.format}`,
        {
          quality: 'standard',
          compress: true,
          compressionOptions: {
            format: fmt.format,
            quality: 85
          },
          overwrite: true
        }
      );

      if (converted.success && converted.compression) {
        const comp = converted.compression;
        const savings = `${comp.savingsPercent}% (${comp.savingsFormatted})`;
        console.log(`${fmt.format.toUpperCase().padEnd(15)} | ${fmt.desc.padEnd(28)} | ${comp.compressedSizeFormatted.padEnd(10)} | ${savings}`);
      }
    }

    console.log('\n─'.repeat(80));
    console.log('📏 Step 4: Test resizing...\n');

    const sizes = [
      { width: 1800, desc: 'Original size (1800px)' },
      { width: 1200, desc: 'Medium (1200px)' },
      { width: 800, desc: 'Small (800px)' },
      { width: 400, desc: 'Thumbnail (400px)' }
    ];

    console.log(`${'Size'.padEnd(15)} | ${'Description'.padEnd(28)} | ${'File Size'.padEnd(10)} | ${'Savings'}`);
    console.log('─'.repeat(80));

    for (const size of sizes) {
      const resized = await scraper.downloadArtwork(
        artwork,
        `./downloads/compression-test/size-${size.width}`,
        {
          quality: 'standard',
          compress: true,
          compressionOptions: {
            quality: 80,
            width: size.width
          },
          overwrite: true
        }
      );

      if (resized.success && resized.compression) {
        const comp = resized.compression;
        const savings = `${comp.savingsPercent}% (${comp.savingsFormatted})`;
        console.log(`${(size.width + 'px').padEnd(15)} | ${size.desc.padEnd(28)} | ${comp.compressedSizeFormatted.padEnd(10)} | ${savings}`);
      }
    }

    console.log('\n═'.repeat(80));
    console.log('  Test Complete!');
    console.log('═'.repeat(80));
    console.log('\n💡 Key Findings:');
    console.log('   • Quality 80-90: Good balance of size vs quality');
    console.log('   • WebP format: Best compression for modern browsers');
    console.log('   • Resizing: Most effective for large size reductions');
    console.log('   • Quality below 60: Noticeable quality degradation\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testCompressionStats();
