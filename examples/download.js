const ArtveeScraper = require('../scraper');
const fs = require('fs');
const path = require('path');
const { imageSize } = require('image-size');

async function quickDownloadTest() {
  console.log('🎨 Artvee Quick Download Test\n');
  
  // Initialize scraper (without premium for this test)
  const scraper = new ArtveeScraper();
  
  try {
    // Scrape 3 artworks
    console.log('Scraping 3 artworks from 17th century...\n');
    const results = await scraper.scrapeArtworks({
      category: 'landscape',
      century: '17th-century',
      orientation: 'landscape',
      perPage: 3,
      page: 1
    });

    console.log(`✓ Found ${results.totalResults} artworks\n`);
    
    // Show what we'll download
    console.log('Artworks to download:');
    results.artworks.forEach((art, i) => {
      console.log(`${i + 1}. ${art.title}`);
      console.log(`   Artist: ${art.artist}`);
    });
    
    // Download them
    console.log('\n📥 Starting download...\n');
    const downloadResults = await scraper.downloadMultipleArtworks(
      results.artworks,
      './downloads/test',
      {
        quality: 'standard',
        includeDetails: true, // Save metadata JSON files
        delay: 1000,
        maxConcurrent: 2,
        overwrite: true // Force re-download to test full-size images
      }
    );

    console.log('\n✅ Download Complete!\n');
    console.log('Summary:');
    console.log(`  Total: ${downloadResults.total}`);
    console.log(`  Successful: ${downloadResults.successful}`);
    console.log(`  Skipped: ${downloadResults.skipped}`);
    console.log(`  Failed: ${downloadResults.failed}`);
    
    console.log('\n📁 Files saved to: ./downloads/test/');
    
    // Display file details (size and resolution)
    console.log('\n📊 Downloaded Images Details:\n');
    console.log('─'.repeat(80));
    
    downloadResults.results.forEach((result, index) => {
      if (result.success && result.path) {
        try {
          const stats = fs.statSync(result.path);
          const buffer = fs.readFileSync(result.path);
          const dimensions = imageSize(buffer);
          const sizeKB = (stats.size / 1024).toFixed(2);
          const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
          const sizeDisplay = stats.size > 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`;
          
          console.log(`${index + 1}. ${result.artwork}`);
          console.log(`   📏 Resolution: ${dimensions.width} × ${dimensions.height} pixels`);
          console.log(`   💾 File Size: ${sizeDisplay} (${stats.size.toLocaleString()} bytes)`);
          console.log(`   📁 Path: ${path.basename(result.path)}`);
          console.log('');
        } catch (error) {
          console.log(`${index + 1}. ${result.artwork}`);
          console.log(`   ⚠️  Could not read file details: ${error.message}`);
          console.log('');
        }
      }
    });
    
    console.log('─'.repeat(80));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// To use with premium account, create this instead:
async function premiumExample() {
  console.log('\n🌟 Premium Account Example\n');
  
  // Replace with your actual cookie from artvee.com
  const YOUR_AUTH_COOKIE = 'your_cookie_here';
  
  if (YOUR_AUTH_COOKIE === 'your_cookie_here') {
    console.log('⚠️  Premium cookie not set.');
    console.log('\nTo use premium features:');
    console.log('1. Log in to artvee.com');
    console.log('2. Open DevTools (F12) > Application > Cookies');
    console.log('3. Copy your cookie string');
    console.log('4. Replace YOUR_AUTH_COOKIE in this file\n');
    return;
  }
  
  const premiumScraper = new ArtveeScraper({
    authCookie: YOUR_AUTH_COOKIE
  });
  
  console.log('✓ Premium account enabled\n');
  
  const results = await premiumScraper.scrapeArtworks({
    category: 'landscape',
    century: '18th-century',
    perPage: 2
  });
  
  await premiumScraper.downloadMultipleArtworks(
    results.artworks,
    './downloads/premium-test',
    {
      quality: 'high', // Premium gets high quality
      includeDetails: true
    }
  );
  
  console.log('✓ Premium downloads complete!');
}

// Run the test
quickDownloadTest()
  .then(() => {
    console.log('\n💡 Tip: To download with premium quality, see premiumExample() function');
  })
  .catch(console.error);
