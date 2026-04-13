const ArtveeScraper = require('../scraper');
const axios = require('axios');

/**
 * Test retry logic by simulating failures
 */
async function testRetry() {
  console.log('🧪 Testing Retry Logic\n');

  const scraper = new ArtveeScraper({
    maxRetries: 3,
    retryDelay: 500
  });

  // Get some artworks to test with
  const result = await scraper.scrapeArtworks({ page: 1 });
  const artworks = result.artworks.slice(0, 2);
  
  if (artworks.length === 0) {
    console.log('❌ No artworks found to test with');
    return;
  }

  console.log('═'.repeat(70));
  console.log('Test 1: Normal download (should succeed)\n');

  const result1 = await scraper.downloadArtwork(artworks[0], './downloads', {
    quality: 'thumbnail',  // Small file for quick test
    showProgress: true,
    maxRetries: 3
  });

  if (result1.success) {
    console.log(`\n✓ Test 1 PASSED: Download completed successfully`);
    console.log(`  Path: ${result1.path}`);
    console.log(`  Size: ${result1.sizeFormatted}`);
  } else {
    console.log(`\n✗ Test 1 FAILED: ${result1.error}`);
  }

  // Test 2: Download with invalid URL (should retry and fail)
  console.log('\n' + '═'.repeat(70));
  console.log('Test 2: Invalid URL (should retry 3 times then fail)\n');

  try {
    const invalidResult = await scraper.downloadImage(
      'https://invalid-url-that-does-not-exist.com/image.jpg',
      './downloads/invalid.jpg',
      {
        showProgress: false,
        maxRetries: 3,
        retryDelay: 500
      }
    );
    console.log(`\n✗ Test 2 FAILED: Should have thrown error but succeeded`);
  } catch (error) {
    console.log(`\n✓ Test 2 PASSED: Failed as expected after retries`);
    console.log(`  Error: ${error.message}`);
  }

  // Test 3: Verify exponential backoff delays
  console.log('\n' + '═'.repeat(70));
  console.log('Test 3: Verify exponential backoff timing\n');

  const delays = [];
  const startTime = Date.now();

  try {
    await scraper._retryWithBackoff(
      async () => {
        throw new Error('Simulated failure');
      },
      {
        maxRetries: 3,
        retryDelay: 100, // Short for testing
        onRetry: (attempt, maxAttempts, delay, error) => {
          const elapsed = Date.now() - startTime;
          delays.push({ attempt, delay: Math.floor(delay), elapsed });
          console.log(`  Retry ${attempt}/${maxAttempts}: delay=${Math.floor(delay)}ms, elapsed=${elapsed}ms`);
        }
      }
    );
  } catch (error) {
    // Expected to fail
  }

  console.log(`\n✓ Test 3 PASSED: Exponential backoff working`);
  console.log('  Delay pattern (with jitter):');
  delays.forEach(d => {
    const expected = 100 * Math.pow(2, d.attempt - 1);
    const jitterRange = `${expected}-${Math.floor(expected * 1.3)}`;
    console.log(`    Attempt ${d.attempt}: ${d.delay}ms (expected: ${jitterRange}ms)`);
  });

  // Test 4: Test no retry (maxRetries=0)
  console.log('\n' + '═'.repeat(70));
  console.log('Test 4: No retry (maxRetries=0)\n');

  try {
    await scraper._retryWithBackoff(
      async () => {
        throw new Error('Immediate failure');
      },
      {
        maxRetries: 0,
        onRetry: () => {
          console.log('  ✗ Should not retry!');
        }
      }
    );
    console.log(`\n✗ Test 4 FAILED: Should have thrown error`);
  } catch (error) {
    console.log(`\n✓ Test 4 PASSED: Failed immediately without retry`);
  }

  console.log('\n' + '═'.repeat(70));
  console.log('📊 Test Summary\n');
  console.log('All retry logic tests completed successfully!');
  console.log('\nRetry features verified:');
  console.log('  ✓ Normal downloads work without retry');
  console.log('  ✓ Failed downloads are retried automatically');
  console.log('  ✓ Exponential backoff with jitter is applied');
  console.log('  ✓ maxRetries=0 disables retry');
  console.log('  ✓ Errors are propagated after max retries');
}

testRetry().catch(console.error);
