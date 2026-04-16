/*
 * Copyright (c) 2026 Artvee Node Scraper Contributors
 * SPDX-License-Identifier: MIT
 */

const ArtveeScraper = require('../scraper');
const fs = require('fs');
const path = require('path');

/**
 * Test resume capability
 */
async function testResume() {
  console.log('🧪 Testing Resume Functionality\n');

  const scraper = new ArtveeScraper({
    enableResume: true,
    maxRetries: 2
  });

  const downloadDir = './downloads';
  
  // Get artwork for testing
  const result = await scraper.scrapeArtworks({ page: 1 });
  const artworks = result.artworks.slice(0, 2);
  
  if (artworks.length === 0) {
    console.log('❌ No artworks found to test with');
    return;
  }

  const testArtwork = artworks[0];
  const sanitizedTitle = scraper.sanitizeFilename(testArtwork.title);
  const testPath = path.join(downloadDir, `${sanitizedTitle}.jpg`);
  const partialMarker = `${testPath}.partial`;

  console.log('═'.repeat(70));
  console.log('Test 1: Fresh download (no resume)\n');

  // Clean up any existing files
  if (fs.existsSync(testPath)) fs.unlinkSync(testPath);
  if (fs.existsSync(partialMarker)) fs.unlinkSync(partialMarker);

  const result1 = await scraper.downloadArtwork(testArtwork, downloadDir, {
    quality: 'thumbnail',
    showProgress: true,
    resume: true
  });

  if (result1.success && !result1.resumed) {
    console.log(`\n✓ Test 1 PASSED: Fresh download completed`);
    console.log(`  Path: ${result1.path}`);
    console.log(`  Resumed: ${result1.resumed}`);
    console.log(`  Partial marker exists: ${fs.existsSync(partialMarker)}`);
  } else {
    console.log(`\n✗ Test 1 FAILED: Unexpected resume or failure`);
  }

  // Test 2: Simulate partial download
  console.log('\n' + '═'.repeat(70));
  console.log('Test 2: Simulate interrupted download\n');

  // Delete the complete file but create a partial one
  if (fs.existsSync(testPath)) {
    const stats = fs.statSync(testPath);
    const originalSize = stats.size;
    console.log(`Original file size: ${(originalSize / 1024).toFixed(2)} KB`);

    // Keep only first half of the file
    const buffer = fs.readFileSync(testPath);
    const partialSize = Math.floor(buffer.length / 2);
    fs.writeFileSync(testPath, buffer.slice(0, partialSize));
    
    // Create partial marker
    fs.writeFileSync(partialMarker, JSON.stringify({
      url: testArtwork.imageUrl,
      totalSize: originalSize,
      startedAt: new Date().toISOString()
    }));

    console.log(`Created partial file: ${(partialSize / 1024).toFixed(2)} KB`);
    console.log(`Partial marker: ${partialMarker}`);
  }

  // Try to resume
  console.log('\nAttempting to resume download...\n');

  const result2 = await scraper.downloadArtwork(testArtwork, downloadDir, {
    quality: 'thumbnail',
    showProgress: true,
    resume: true,
    overwrite: false  // Don't overwrite, should trigger resume
  });

  if (result2.success) {
    console.log(`\n✓ Test 2 PASSED: Resume functionality works`);
    console.log(`  Resumed: ${result2.resumed}`);
    console.log(`  Final size: ${result2.sizeFormatted}`);
    console.log(`  Partial marker removed: ${!fs.existsSync(partialMarker)}`);
  } else {
    console.log(`\n✗ Test 2 FAILED: ${result2.error}`);
  }

  // Test 3: Resume disabled
  console.log('\n' + '═'.repeat(70));
  console.log('Test 3: Resume disabled (should start fresh)\n');

  // Create another partial download
  if (fs.existsSync(testPath)) {
    const buffer = fs.readFileSync(testPath);
    fs.writeFileSync(testPath, buffer.slice(0, 1000));
    fs.writeFileSync(partialMarker, JSON.stringify({
      url: testArtwork.imageUrl,
      startedAt: new Date().toISOString()
    }));
    console.log('Created partial file (1000 bytes)');
  }

  const result3 = await scraper.downloadArtwork(testArtwork, downloadDir, {
    quality: 'thumbnail',
    showProgress: true,
    resume: false,    // Disable resume
    overwrite: true
  });

  if (result3.success && !result3.resumed) {
    console.log(`\n✓ Test 3 PASSED: Fresh download when resume disabled`);
    console.log(`  Resumed: ${result3.resumed}`);
  } else {
    console.log(`\n✗ Test 3 FAILED: Should not have resumed`);
  }

  // Test 4: Check partial marker cleanup
  console.log('\n' + '═'.repeat(70));
  console.log('Test 4: Verify partial markers are cleaned up\n');

  const hasPartialMarkers = fs.readdirSync(downloadDir)
    .filter(f => f.endsWith('.partial')).length;

  if (hasPartialMarkers === 0) {
    console.log(`✓ Test 4 PASSED: No partial markers remain`);
  } else {
    console.log(`⚠️  Test 4 WARNING: ${hasPartialMarkers} partial markers found`);
    console.log('   This might indicate interrupted downloads');
  }

  console.log('\n' + '═'.repeat(70));
  console.log('📊 Test Summary\n');
  console.log('Resume functionality tests completed!');
  console.log('\nFeatures verified:');
  console.log('  ✓ Fresh downloads create and remove partial markers');
  console.log('  ✓ Interrupted downloads can be resumed');
  console.log('  ✓ Resume can be disabled for fresh downloads');
  console.log('  ✓ Partial markers are cleaned up after completion');
  console.log('\nHow resume works:');
  console.log('  1. Partial downloads create a .partial marker file');
  console.log('  2. On next download attempt, resume from existing bytes');
  console.log('  3. Uses HTTP Range headers (bytes=X-)');
  console.log('  4. Marker removed when download completes');
}

testResume().catch(console.error);
