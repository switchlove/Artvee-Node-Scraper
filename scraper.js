const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { pipeline } = require('stream/promises');
const cliProgress = require('cli-progress');

// Optional sharp dependency for image compression
let sharp = null;
try {
  sharp = require('sharp');
} catch (err) {
  // sharp is optional - compression features will be disabled if not installed
}

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
    
    // Retry and resume configuration
    this.maxRetries = options.maxRetries !== undefined ? options.maxRetries : 3;
    this.retryDelay = options.retryDelay || 1000; // Base delay in ms
    this.enableResume = options.enableResume !== undefined ? options.enableResume : true;
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
    // Use String methods to avoid ReDoS vulnerabilities
    
    // Try en-dash (–), em-dash (—), and hyphen (-)
    const dashChars = ['–', '—', '-'];
    for (const dash of dashChars) {
      const lastIndex = title.lastIndexOf(dash);
      if (lastIndex !== -1) {
        const artist = title.substring(lastIndex + 1).trim();
        if (artist.length > 0) {
          return artist;
        }
      }
    }

    // Try comma
    const lastCommaIndex = title.lastIndexOf(',');
    if (lastCommaIndex !== -1) {
      const artist = title.substring(lastCommaIndex + 1).trim();
      if (artist.length > 0) {
        return artist;
      }
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
   * @param {boolean} options.resume - Resume interrupted download (default: true)
   * @param {number} options.maxRetries - Maximum retry attempts (default: from constructor)
   * @param {number} options.retryDelay - Base retry delay in ms (default: from constructor)
   * @returns {Promise<Object>} Download result with path and size
   */
  async downloadImage(imageUrl, outputPath, options = {}) {
    const { 
      overwrite = false, 
      showProgress = false, 
      progressBar = null,
      compress = false,
      compressionOptions = {},
      resume = this.enableResume,
      maxRetries = this.maxRetries,
      retryDelay = this.retryDelay
    } = options;

    // Check if file already exists and is complete
    let existingSize = 0;
    let isPartialDownload = false;
    
    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      existingSize = stats.size;
      
      // Check if .partial marker exists (indicates incomplete download)
      const partialMarker = `${outputPath}.partial`;
      isPartialDownload = fs.existsSync(partialMarker);
      
      if (!overwrite && !isPartialDownload) {
        // File exists and is complete - skip download
        if (progressBar) {
          const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
          progressBar.update(100, { size: `${sizeMB} MB (cached)` });
        }
        return {
          success: true,
          path: outputPath,
          skipped: true,
          size: stats.size,
          message: 'File already exists'
        };
      }
      
      if (isPartialDownload && !resume) {
        // Remove partial file if resume is disabled
        fs.unlinkSync(outputPath);
        fs.unlinkSync(partialMarker);
        existingSize = 0;
      }
    }

    // Wrap the download in retry logic
    return this._retryWithBackoff(async () => {
      return await this._downloadImageInternal(imageUrl, outputPath, {
        showProgress,
        progressBar,
        compress,
        compressionOptions,
        existingSize,
        resume: resume && isPartialDownload
      });
    }, {
      maxRetries,
      retryDelay,
      onRetry: (attempt, maxAttempts, delay, error) => {
        console.log(`\n⚠️  Download failed (attempt ${attempt}/${maxAttempts}): ${error.message}`);
        console.log(`   Retrying in ${(delay / 1000).toFixed(1)}s...`);
      }
    });
  }

  /**
   * Internal download implementation with resume support
   * @private
   */
  async _downloadImageInternal(imageUrl, outputPath, options) {
    const { 
      showProgress,
      progressBar,
      compress,
      compressionOptions,
      existingSize = 0,
      resume = false
    } = options;

    try {
      // Create directory if it doesn't exist
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Prepare headers for range request if resuming
      const headers = this.getHeaders();
      if (resume && existingSize > 0) {
        headers['Range'] = `bytes=${existingSize}-`;
      }

      // Download the image
      const response = await axios({
        method: 'GET',
        url: imageUrl,
        responseType: 'stream',
        headers
      });

      // Check if server supports range requests
      const acceptsRanges = response.headers['accept-ranges'] === 'bytes';
      const contentRange = response.headers['content-range'];
      const isResuming = resume && existingSize > 0 && (response.status === 206 || contentRange);

      let totalSize = parseInt(response.headers['content-length'], 10);
      if (contentRange) {
        // Parse content-range: "bytes 1000-2000/3000"
        const match = contentRange.match(/bytes (\d+)-(\d+)\/(\d+)/);
        if (match) {
          totalSize = parseInt(match[3], 10);
        }
      }

      let downloadedSize = isResuming ? existingSize : 0;
      const partialMarker = `${outputPath}.partial`;

      // Create partial marker for incomplete downloads
      if (!fs.existsSync(partialMarker)) {
        fs.writeFileSync(partialMarker, JSON.stringify({
          url: imageUrl,
          totalSize,
          startedAt: new Date().toISOString()
        }));
      }

      // Create a single progress bar if enabled and not provided
      let bar = null;
      let shouldStopBar = false;
      
      if (showProgress && !bar && totalSize) {
        const filename = path.basename(outputPath).substring(0, 35).padEnd(35);
        const resumeIndicator = isResuming ? '↻' : '📥';
        bar = new cliProgress.SingleBar({
          format: `${resumeIndicator} ${filename} │{bar}│ {percentage}% │ {size} │ ETA: {eta}s`,
          barCompleteChar: '█',
          barIncompleteChar: '░',
          hideCursor: true,
          barsize: 30,
          formatValue: (v, options, type) => {
            if (type === 'percentage') {
              return String(Math.floor(v)).padStart(3);
            }
            return v;
          }
        });
        bar.start(totalSize, downloadedSize, { 
          size: isResuming ? `${(downloadedSize / (1024 * 1024)).toFixed(2)} MB (resuming)` : '0 MB'
        });
        shouldStopBar = true;
      }

      // Track progress
      if (bar && totalSize) {
        response.data.on('data', (chunk) => {
          downloadedSize += chunk.length;
          const sizeMB = (downloadedSize / (1024 * 1024)).toFixed(2);
          const totalMB = (totalSize / (1024 * 1024)).toFixed(2);
          
          // Update with actual byte progress
          bar.update(downloadedSize, { size: `${sizeMB}/${totalMB} MB` });
        });
      } else if (progressBar && totalSize) {
        // For multibar, update as percentage
        response.data.on('data', (chunk) => {
          downloadedSize += chunk.length;
          const percentage = Math.floor((downloadedSize / totalSize) * 100);
          const sizeMB = (downloadedSize / (1024 * 1024)).toFixed(2);
          const totalMB = (totalSize / (1024 * 1024)).toFixed(2);
          progressBar.update(percentage, { size: `${sizeMB}/${totalMB} MB` });
        });
      }

      // Save to file (append if resuming)
      const writeStream = fs.createWriteStream(outputPath, {
        flags: isResuming ? 'a' : 'w'
      });
      
      await pipeline(response.data, writeStream);

      // Stop progress bar if we created it
      if (shouldStopBar && bar) {
        bar.stop();
      }

      // Remove partial marker - download is complete
      if (fs.existsSync(partialMarker)) {
        fs.unlinkSync(partialMarker);
      }

      let stats = fs.statSync(outputPath);
      let compressionResult = null;

      // Compress image if requested
      if (compress && sharp) {
        compressionResult = await this.compressImage(outputPath, null, compressionOptions);
        if (compressionResult.success) {
          stats = fs.statSync(outputPath);
        }
      }

      return {
        success: true,
        path: outputPath,
        size: stats.size,
        sizeFormatted: this.formatBytes(stats.size),
        skipped: false,
        resumed: isResuming,
        compressed: compress && compressionResult?.success,
        compression: compressionResult
      };
    } catch (error) {
      // Keep partial marker for potential resume
      throw error;
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
   * @param {boolean} options.showProgress - Show progress bar for download (default: false)
   * @param {Object} options.progressBar - Custom progress bar instance (for multi-downloads)
   * @param {boolean} options.compress - Compress image after download (default: false)
   * @param {Object} options.compressionOptions - Options for image compression
   * @param {string} options.compressionOptions.format - Output format: 'jpeg', 'png', 'webp'
   * @param {number} options.compressionOptions.quality - Quality level 1-100 (default: 80)
   * @param {number} options.compressionOptions.width - Resize width in pixels
   * @param {number} options.compressionOptions.height - Resize height in pixels
   * @param {boolean} options.resume - Resume interrupted download (default: true)
   * @param {number} options.maxRetries - Maximum retry attempts (default: from constructor)
   * @param {number} options.retryDelay - Base retry delay in ms (default: from constructor)
   * @returns {Promise<Object>} Download result
   */
  async downloadArtwork(artwork, downloadDir = './downloads', options = {}) {
    const { 
      includeDetails = false, 
      quality = 'standard',
      overwrite = false,
      showProgress = false,
      progressBar = null,
      compress = false,
      compressionOptions = {},
      resume = this.enableResume,
      maxRetries = this.maxRetries,
      retryDelay = this.retryDelay
    } = options;

    try {
      // Sanitize filename to prevent path traversal attacks
      const sanitizedTitle = this.sanitizeFilename(artwork.title || 'artwork');
      const filename = `${sanitizedTitle}.jpg`;
      
      // Use path.basename to ensure we only get the filename component
      const safeFilename = path.basename(filename);
      
      // Validate paths stay within target directory (defense-in-depth)
      const imagePath = this.safePath(downloadDir, safeFilename);
      const metadataPath = this.safePath(downloadDir, `${path.basename(sanitizedTitle)}.json`);

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
      const downloadResult = await this.downloadImage(imageUrl, imagePath, { 
        overwrite, 
        showProgress, 
        progressBar,
        compress,
        compressionOptions,
        resume,
        maxRetries,
        retryDelay
      });

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
   * @param {boolean} options.showProgress - Show progress bars for downloads (default: true)
   * @returns {Promise<Array>} Array of download results
   */
  async downloadMultipleArtworks(artworks, downloadDir = './downloads', options = {}) {
    const { 
      delay = 1000, 
      maxConcurrent = 3,
      showProgress = true,
      ...downloadOptions 
    } = options;

    const results = [];
    const chunks = [];

    // Split into chunks for concurrent downloading
    for (let i = 0; i < artworks.length; i += maxConcurrent) {
      chunks.push(artworks.slice(i, i + maxConcurrent));
    }

    console.log(`Starting download of ${artworks.length} artworks...`);

    // Create multi-bar for progress tracking
    let multibar = null;
    if (showProgress) {
      multibar = new cliProgress.MultiBar({
        clearOnComplete: false,
        hideCursor: true,
        format: '📥 {filename} │{bar}│ {percentage}% │ {size}',
        barCompleteChar: '█',
        barIncompleteChar: '░',
        barsize: 25,
        formatValue: (v, options, type) => {
          if (type === 'percentage') {
            return String(Math.floor(v)).padStart(3);
          }
          return v;
        }
      });
    }

    for (const chunk of chunks) {
      const chunkPromises = chunk.map(async (artwork) => {
        // Create a progress bar for this artwork if multibar exists
        let bar = null;
        if (multibar) {
          const filename = this.sanitizeFilename(artwork.title || 'artwork').substring(0, 40).padEnd(40);
          bar = multibar.create(100, 0, { filename, size: '0.00 MB' });
        }

        const result = await this.downloadArtwork(artwork, downloadDir, {
          ...downloadOptions,
          showProgress: false, // Disable individual progress since we're using multibar
          progressBar: bar
        });

        // Ensure progress bar shows complete with final size
        if (bar && result.success) {
          const sizeMB = (result.size / (1024 * 1024)).toFixed(2);
          const status = result.skipped ? `${sizeMB} MB (cached)` : `${sizeMB} MB`;
          bar.update(100, { size: status });
        } else if (bar && !result.success) {
          bar.update(100, { size: 'Failed' });
        }

        return result;
      });

      const chunkResults = await Promise.all(chunkPromises);
      results.push(...chunkResults);

      // Log progress
      const successCount = results.filter(r => r.success).length;
      if (!showProgress) {
        console.log(`Progress: ${results.length}/${artworks.length} (${successCount} successful)`);
      }

      // Delay before next chunk (except for last chunk)
      if (chunks.indexOf(chunk) < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // Stop the multibar
    if (multibar) {
      multibar.stop();
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
   * Sleep helper for retry delays
   * @private
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Retry a function with exponential backoff
   * @private
   */
  async _retryWithBackoff(fn, context = {}) {
    let lastError;
    const maxRetries = context.maxRetries !== undefined ? context.maxRetries : this.maxRetries;
    const baseDelay = context.retryDelay !== undefined ? context.retryDelay : this.retryDelay;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        // Don't retry on last attempt
        if (attempt === maxRetries) {
          break;
        }

        // Calculate exponential backoff: baseDelay * 2^attempt
        const delay = baseDelay * Math.pow(2, attempt);
        // Use crypto for random jitter to avoid security warnings
        const randomValue = crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF;
        const jitter = randomValue * 0.3 * delay; // Add 0-30% jitter
        const totalDelay = delay + jitter;

        if (context.onRetry) {
          context.onRetry(attempt + 1, maxRetries, totalDelay, error);
        }

        await this._sleep(totalDelay);
      }
    }

    throw lastError;
  }

  /**
   * Sanitize filename for safe file system usage
   * Prevents path traversal attacks and ensures valid filenames
   * @private
   */
  sanitizeFilename(filename) {
    if (!filename || typeof filename !== 'string') {
      return 'artwork';
    }

    return filename
      // Remove null bytes
      .replace(/\0/g, '')
      // Remove path separators and parent directory references
      .replace(/\.\./g, '')
      .replace(/[<>:"/\\|?*]/g, '-')
      // Replace whitespace with underscores
      .replace(/\s+/g, '_')
      // Collapse multiple underscores
      .replace(/_{2,}/g, '_')
      // Remove leading/trailing dots and dashes (security: prevent hidden files and path issues)
      .replace(/^[.\-]+/, '')
      .replace(/[.\-]+$/, '')
      // Ensure we have at least some content
      .trim() || 'artwork'
      // Limit length (filesystem limitations)
      .substring(0, 150);
  }

  /**
   * Safely join paths and validate the result stays within the target directory
   * Prevents path traversal attacks with defense-in-depth validation
   * @private
   */
  safePath(targetDir, filename) {
    // Resolve to absolute paths
    const resolvedDir = path.resolve(targetDir);
    const resolvedPath = path.resolve(targetDir, filename);
    
    // Verify the resolved path is within the target directory
    if (!resolvedPath.startsWith(resolvedDir + path.sep) && resolvedPath !== resolvedDir) {
      throw new Error('Path traversal attempt detected');
    }
    
    return resolvedPath;
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

  /**
   * Compress an image file
   * @param {string} inputPath - Path to input image
   * @param {string} outputPath - Path to save compressed image (optional, defaults to input)
   * @param {Object} options - Compression options
   * @param {string} options.format - Output format: 'jpeg', 'png', 'webp' (default: keep original)
   * @param {number} options.quality - Quality level 1-100 (default: 80)
   * @param {number} options.width - Resize width in pixels (maintains aspect ratio)
   * @param {number} options.height - Resize height in pixels (maintains aspect ratio)
   * @param {boolean} options.progressive - Use progressive encoding (JPEG only)
   * @returns {Promise<Object>} Compression result
   */
  async compressImage(inputPath, outputPath = null, options = {}) {
    if (!sharp) {
      throw new Error('Image compression requires the \'sharp\' package. Install it with: npm install sharp');
    }

    const {
      format = null,
      quality = 80,
      width = null,
      height = null,
      progressive = true
    } = options;

    try {
      const output = outputPath || inputPath;
      const originalStats = fs.statSync(inputPath);
      
      let transformer = sharp(inputPath);

      // Resize if dimensions specified
      if (width || height) {
        transformer = transformer.resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      // Apply format and compression
      if (format === 'jpeg' || format === 'jpg') {
        transformer = transformer.jpeg({ quality, progressive });
      } else if (format === 'png') {
        transformer = transformer.png({ quality, compressionLevel: 9 });
      } else if (format === 'webp') {
        transformer = transformer.webp({ quality });
      } else {
        // Keep original format but apply quality
        const metadata = await sharp(inputPath).metadata();
        if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
          transformer = transformer.jpeg({ quality, progressive });
        } else if (metadata.format === 'png') {
          transformer = transformer.png({ quality, compressionLevel: 9 });
        } else if (metadata.format === 'webp') {
          transformer = transformer.webp({ quality });
        }
      }

      await transformer.toFile(output + '.tmp');
      
      // Replace original with compressed version
      fs.renameSync(output + '.tmp', output);
      
      const compressedStats = fs.statSync(output);
      const savings = originalStats.size - compressedStats.size;
      const savingsPercent = ((savings / originalStats.size) * 100).toFixed(1);

      return {
        success: true,
        path: output,
        originalSize: originalStats.size,
        compressedSize: compressedStats.size,
        originalSizeFormatted: this.formatBytes(originalStats.size),
        compressedSizeFormatted: this.formatBytes(compressedStats.size),
        savings: savings,
        savingsFormatted: this.formatBytes(savings),
        savingsPercent: savingsPercent
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        path: outputPath || inputPath
      };
    }
  }
}

module.exports = ArtveeScraper;
