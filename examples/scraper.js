const ArtveeScraper = require('../scraper');

async function main() {
  const scraper = new ArtveeScraper();

  console.log('=== Artvee Scraper Examples ===\n');

  // Example 1: Scrape landscape artworks from 17th century with landscape orientation
  console.log('Example 1: 17th Century Landscape Artworks');
  console.log('-------------------------------------------');
  try {
    const results = await scraper.scrapeArtworks({
      category: 'landscape',
      century: '17th-century',
      orientation: 'landscape',
      perPage: 20,
      page: 1
    });

    console.log(`Found ${results.totalResults} artworks`);
    console.log(`Page ${results.pagination.currentPage} of ${results.pagination.totalPages}`);
    console.log('\nFirst 5 artworks:');
    
    results.artworks.slice(0, 5).forEach((artwork, index) => {
      console.log(`\n${index + 1}. ${artwork.title}`);
      console.log(`   Artist: ${artwork.artist || 'Unknown'}`);
      console.log(`   URL: ${artwork.url}`);
      console.log(`   Image: ${artwork.imageUrl}`);
    });

  } catch (error) {
    console.error('Error in Example 1:', error.message);
  }

  console.log('\n\n');

  // Example 2: Scrape 19th century portraits
  console.log('Example 2: 19th Century Portrait Artworks');
  console.log('-------------------------------------------');
  try {
    const results = await scraper.scrapeArtworks({
      category: 'figurative',
      century: '19th-century',
      orientation: 'portrait',
      perPage: 10,
      page: 1
    });

    console.log(`Found ${results.totalResults} artworks`);
    console.log(`\nFirst 3 artworks:`);
    
    results.artworks.slice(0, 3).forEach((artwork, index) => {
      console.log(`\n${index + 1}. ${artwork.title}`);
      console.log(`   URL: ${artwork.url}`);
    });

  } catch (error) {
    console.error('Error in Example 2:', error.message);
  }

  console.log('\n\n');

  // Example 3: Get artwork details
  console.log('Example 3: Get Detailed Artwork Information');
  console.log('-------------------------------------------');
  try {
    // First get a list of artworks
    const results = await scraper.scrapeArtworks({
      category: 'landscape',
      century: '18th-century',
      perPage: 5
    });

    if (results.artworks.length > 0) {
      const firstArtwork = results.artworks[0];
      console.log(`Fetching details for: ${firstArtwork.title}\n`);

      const details = await scraper.scrapeArtworkDetails(firstArtwork.url);
      
      console.log(`Title: ${details.title}`);
      console.log(`Description: ${details.description.substring(0, 200)}...`);
      console.log(`Main Image: ${details.mainImage}`);
      console.log(`Download Links: ${details.downloadLinks.length} available`);
    }

  } catch (error) {
    console.error('Error in Example 3:', error.message);
  }

  console.log('\n\n');

  // Example 4: Show available filters
  console.log('Example 4: Available Filters');
  console.log('----------------------------');
  console.log('Categories:', scraper.getAvailableCategories().join(', '));
  console.log('Centuries:', scraper.getAvailableCenturies().join(', '));
  console.log('Orientations:', scraper.getAvailableOrientations().join(', '));
}

// Run examples
main().catch(console.error);
