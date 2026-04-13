const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream/promises');

class ArtveeScraper {
  /**
   * @param {Object} options - Scraper configuration
   * @param {string} options.authCookie - Authentication cookie for premium account (optional)
   * @param {Object} options.headers - Additional headers for premium access (optional)
   */
  constructor(options = {}) {
    this.baseUrl = 'https://artvee.com';
    this.authCookie = options.authCookie || null;
    this.customHeaders = options.headers || {};
    this.isPremium = !!this.authCookie;
  }

  /**
   * Get request headers with authentication if available
   */
  getHeaders() {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      ...this.customHeaders
    };

    if (this.authCookie) {
      headers['Cookie'] = this.authCookie;
    }

    return headers;
  }

  /**
   * Scrape artworks with optional filters
   * @param {Object} options - Scraping options
   * @param {string} options.category - Category (e.g., 'landscape', 'portrait', 'abstract')
   * @param {string} options.century - Century filter (e.g., '17th-century', '18th-century', '19th-century')
   * @param {string} options.orientation - Orientation filter ('landscape', 'portrait', 'square')
   * @param {number} options.perPage - Number of results per page (default: 70)
   * @param {number} options.page - Page number (default: 1)
   * @returns {Promise<Object>} Scraped artwork data
   */
  async scrapeArtworks(options = {}) {
    const {
      category = 'landscape',
      century = null,
      orientation = null,
      perPage = 70,
      page = 1
    } = options;

    const url = this.buildUrl(category, century, orientation, perPage, page);
    
    console.log(`Scraping: ${url}`);
    
    try {
      const response = await axios.get(url, {
        headers: this.getHeaders()
      });

      const $ = cheerio.load(response.data);
      const artworks = [];

      // Parse artwork items from the grid
      $('.product').each((index, element) => {
        const $element = $(element);
        const $img = $element.find('img.lazy');
        const $linkElement = $element.find('.linko[data-url]');
        const $artistLink = $element.find('.woodmart-product-brands-links a');

        const title = $img.attr('alt') || '';
        const relativeUrl = $linkElement.attr('data-url');
        const imageUrl = $img.attr('src');
        const artistText = $artistLink.text().trim();

        const artwork = {
          title: title.trim(),
          url: relativeUrl ? `${this.baseUrl}${relativeUrl}` : null,
          imageUrl: imageUrl,
          thumbnailUrl: imageUrl,
          artist: artistText || null,
        };

        artworks.push(artwork);
      });

      // Get pagination info
      const pagination = this.extractPagination($);

      return {
        artworks,
        pagination,
        url,
        totalResults: artworks.length,
        filters: {
          category,
          century,
          orientation,
          perPage,
          page
        }
      };

    } catch (error) {
      console.error('Error scraping Artvee:', error.message);
      throw error;
    }
  }

  /**
   * Build the URL with filters
   */
  buildUrl(category, century, orientation, perPage, page) {
    let url = `${this.baseUrl}/c/${category}/`;
    const params = new URLSearchParams();

    if (century) {
      params.append('filter_century', century);
    }

    if (orientation) {
      params.append('filter_orientation', orientation);
      params.append('query_type_orientation', 'or');
    }

    params.append('per_row', '5');
    params.append('shop_view', 'grid');
    params.append('per_page', perPage.toString());

    if (page > 1) {
      params.append('paged', page.toString());
    }

    const queryString = params.toString();
    return queryString ? `${url}?${queryString}` : url;
  }

  /**
   * Extract artist name from title (usually after the last comma or dash)
   */
  extractArtist(title) {
    // Try to extract artist name - common format is "Title - Artist" or "Title, Artist"
    const dashMatch = title.match(/[-–—]\s*(.+)$/);
    if (dashMatch) {
      return dashMatch[1].trim();
    }

    const commaMatch = title.match(/,\s*([^,]+)$/);
    if (commaMatch) {
      return commaMatch[1].trim();
    }

    return null;
  }

  /**
   * Extract pagination information
   */
  extractPagination($) {
    const pagination = {
      currentPage: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false
    };

    const $pagination = $('.woocommerce-pagination');
    
    if ($pagination.length) {
      const $current = $pagination.find('.page-numbers.current');
      const $pages = $pagination.find('.page-numbers:not(.next):not(.prev)');
      
      if ($current.length) {
        pagination.currentPage = parseInt($current.text()) || 1;
      }

      // Find total pages
      $pages.each((i, el) => {
        const pageNum = parseInt($(el).text());
        if (!isNaN(pageNum) && pageNum > pagination.totalPages) {
          pagination.totalPages = pageNum;
        }
      });

      pagination.hasNextPage = $pagination.find('.next').length > 0;
      pagination.hasPrevPage = $pagination.find('.prev').length > 0;
    }

    return pagination;
  }

  /**
   * Scrape detailed information from an artwork page
   * @param {string} artworkUrl - Full URL to the artwork page
   * @returns {Promise<Object>} Detailed artwork information
   */
  async scrapeArtworkDetails(artworkUrl) {
    try {
      const response = await axios.get(artworkUrl, {
        headers: this.getHeaders()
      });

      const $ = cheerio.load(response.data);

      const $title = $('h1.product_title');
      const $mainImage = $('.product-image-wrap img.wp-post-image');
      const $artistLink = $('.woodmart-product-brands-links a');
      const metaDescription = $('meta[name="description"]').attr('content');

      const details = {
        title: $title.text().trim(),
        url: artworkUrl,
        mainImage: $mainImage.attr('src'),
        imageAlt: $mainImage.attr('alt'),
        description: metaDescription || '',
        artist: $artistLink.text().trim() || null,
        year: null,
        dimensions: null,
        downloadLinks: []
      };

      // Extract download links - look for links containing "download" text
      $('a').each((i, el) => {
        const $link = $(el);
        const text = $link.text().trim();
        const href = $link.attr('href');
        
        if (text.toLowerCase().includes('download') && href && href.startsWith('http')) {
          details.downloadLinks.push({
            text: text,
            url: href
          });
        }
      });

      return details;

    } catch (error) {
      console.error('Error scraping artwork details:', error.message);
      throw error;
    }
  }

  /**
   * Get all available centuries for filtering
   * @returns {Array<string>} List of century values
   */
  getAvailableCenturies() {
    return [
      '15th-century',
      '16th-century',
      '17th-century',
      '18th-century',
      '19th-century',
      '20th-century',
      '21st-century'
    ];
  }

  /**
   * Get all available orientations for filtering
   * @returns {Array<string>} List of orientation values
   */
  getAvailableOrientations() {
    return ['landscape', 'portrait', 'square', 'panorama'];
  }

  /**
   * Get all available categories
   * @returns {Array<string>} List of category values
   */
  getAvailableCategories() {
    return [
      'abstract',
      'figurative',
      'landscape',
      'posters',
      'illustration',
      'religion',
      'mythology',
      'drawings',
      'still-life',
      'plants-animals4'
    ];
  }

  /**
   * Download an image from a URL
   * @param {string} imageUrl - URL of the image to download
   * @param {string} outputPath - Path where the image should be saved
   * @param {Object} options - Download options
   * @param {boolean} options.overwrite - Overwrite existing file (default: false)
   * @returns {Promise<Object>} Download result with path and size
   */
  async downloadImage(imageUrl, outputPath, options = {}) {
    const { overwrite = false } = options;

    // Check if file already exists
    if (!overwrite && fs.existsSync(outputPath)) {
      return {
        success: true,
        path: outputPath,
        skipped: true,
        message: 'File already exists'
      };
    }

    try {
      // Create directory if it doesn't exist
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Download the image
      const response = await axios({
        method: 'GET',
        url: imageUrl,
        responseType: 'stream',
        headers: this.getHeaders()
      });

      // Save to file
      await pipeline(response.data, fs.createWriteStream(outputPath));

      const stats = fs.statSync(outputPath);

      return {
        success: true,
        path: outputPath,
        size: stats.size,
        sizeFormatted: this.formatBytes(stats.size),
        skipped: false
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        path: outputPath
      };
    }
  }

  /**
   * Download artwork with its metadata
   * @param {Object} artwork - Artwork object from scrapeArtworks
   * @param {string} downloadDir - Directory to save images (default: './downloads')
   * @param {Object} options - Download options
   * @param {boolean} options.includeDetails - Fetch and save detailed artwork info (default: false)
   * @param {boolean} options.quality - Image quality: 'thumbnail', 'standard', 'high' (default: 'standard')
   * @param {boolean} options.overwrite - Overwrite existing files (default: false)
   * @returns {Promise<Object>} Download result
   */
  async downloadArtwork(artwork, downloadDir = './downloads', options = {}) {
    const { 
      includeDetails = false, 
      quality = 'standard',
      overwrite = false 
    } = options;

    try {
      // Sanitize filename
      const sanitizedTitle = this.sanitizeFilename(artwork.title || 'artwork');
      const filename = `${sanitizedTitle}.jpg`;
      const imagePath = path.join(downloadDir, filename);
      const metadataPath = path.join(downloadDir, `${sanitizedTitle}.json`);

      let imageUrl = artwork.imageUrl;

      // Get appropriate quality image URL
      if (quality !== 'thumbnail') {
        // For standard and high quality, fetch download links from detail page
        const details = await this.scrapeArtworkDetails(artwork.url);
        
        if (quality === 'standard') {
          // Use standard download link (typically sdl - standard download)
          if (details.downloadLinks.length > 0) {
            // First download link is usually the standard download
            imageUrl = details.downloadLinks[0].url;
          } else {
            // Fallback to main image if no download links found
            imageUrl = details.mainImage || artwork.imageUrl;
          }
        } else if (quality === 'high') {
          // For high quality, try to find the highest resolution download
          if (this.isPremium && details.downloadLinks.length > 1) {
            // Premium accounts may have access to multiple quality options
            // Look for high/HD quality link, otherwise use last (usually highest)
            const highQualityLink = details.downloadLinks.find(link => 
              link.text.toLowerCase().includes('high') || 
              link.text.toLowerCase().includes('hd')
            ) || details.downloadLinks[details.downloadLinks.length - 1];
            
            imageUrl = highQualityLink.url;
          } else if (details.downloadLinks.length > 0) {
            // Use the best available download link
            imageUrl = details.downloadLinks[0].url;
          } else {
            imageUrl = details.mainImage || artwork.imageUrl;
          }
        }
        
        // Save details if we fetched them
        if (includeDetails) {
          const metadata = {
            ...artwork,
            details,
            downloadedAt: new Date().toISOString(),
            quality,
            localPath: imagePath
          };
          // Save metadata alongside image (do this after download succeeds)
          this._pendingMetadata = { path: metadataPath, data: metadata };
        }
      }

      // Download the image
      const downloadResult = await this.downloadImage(imageUrl, imagePath, { overwrite });

      // Save metadata if it was prepared during detail fetching
      if (this._pendingMetadata && downloadResult.success && !downloadResult.skipped) {
        fs.writeFileSync(this._pendingMetadata.path, JSON.stringify(this._pendingMetadata.data, null, 2));
        delete this._pendingMetadata;
      }

      return {
        ...downloadResult,
        artwork: artwork.title,
        url: artwork.url,
        imageUrl
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        artwork: artwork.title,
        url: artwork.url
      };
    }
  }

  /**
   * Download multiple artworks
   * @param {Array} artworks - Array of artwork objects
   * @param {string} downloadDir - Directory to save images
   * @param {Object} options - Download options
   * @param {number} options.delay - Delay between downloads in ms (default: 1000)
   * @param {number} options.maxConcurrent - Max concurrent downloads (default: 3)
   * @returns {Promise<Array>} Array of download results
   */
  async downloadMultipleArtworks(artworks, downloadDir = './downloads', options = {}) {
    const { 
      delay = 1000, 
      maxConcurrent = 3,
      ...downloadOptions 
    } = options;

    const results = [];
    const chunks = [];

    // Split into chunks for concurrent downloading
    for (let i = 0; i < artworks.length; i += maxConcurrent) {
      chunks.push(artworks.slice(i, i + maxConcurrent));
    }

    console.log(`Starting download of ${artworks.length} artworks...`);

    for (const chunk of chunks) {
      const chunkPromises = chunk.map(artwork => 
        this.downloadArtwork(artwork, downloadDir, downloadOptions)
      );

      const chunkResults = await Promise.all(chunkPromises);
      results.push(...chunkResults);

      // Log progress
      const successCount = results.filter(r => r.success).length;
      console.log(`Progress: ${results.length}/${artworks.length} (${successCount} successful)`);

      // Delay before next chunk (except for last chunk)
      if (chunks.indexOf(chunk) < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    const summary = {
      total: artworks.length,
      successful: results.filter(r => r.success).length,
      skipped: results.filter(r => r.skipped).length,
      failed: results.filter(r => !r.success).length,
      results
    };

    console.log(`\nDownload complete: ${summary.successful} successful, ${summary.skipped} skipped, ${summary.failed} failed`);

    return summary;
  }

  /**
   * Sanitize filename for safe file system usage
   * @private
   */
  sanitizeFilename(filename) {
    return filename
      .replace(/[<>:"/\\|?*]/g, '-')
      .replace(/\s+/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^-+|-+$/g, '')
      .substring(0, 150); // Limit length
  }

  /**
   * Format bytes to human-readable format
   * @private
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}

module.exports = ArtveeScraper;
