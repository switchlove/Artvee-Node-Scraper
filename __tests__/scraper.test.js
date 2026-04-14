const ArtveeScraper = require('../scraper.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream/promises');

jest.mock('axios');
jest.mock('fs');
jest.mock('stream/promises', () => ({
  pipeline: jest.fn()
}));

describe('ArtveeScraper', () => {
  let scraper;

  beforeEach(() => {
    scraper = new ArtveeScraper();
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    test('should create instance with default options', () => {
      expect(scraper).toBeInstanceOf(ArtveeScraper);
      expect(scraper).toBeDefined();
    });

    test('should create instance with custom options', () => {
      const customScraper = new ArtveeScraper({ 
        authCookie: 'test-cookie',
        maxRetries: 5
      });
      expect(customScraper).toBeInstanceOf(ArtveeScraper);
      expect(customScraper.maxRetries).toBe(5);
    });

    test('should set retry options', () => {
      const retryScraper = new ArtveeScraper({ 
        maxRetries: 5, 
        retryDelay: 2000 
      });
      expect(retryScraper.maxRetries).toBe(5);
      expect(retryScraper.retryDelay).toBe(2000);
    });

    test('should set resume option', () => {
      const resumeScraper = new ArtveeScraper({ enableResume: false });
      expect(resumeScraper.enableResume).toBe(false);
    });
  });

  describe('sanitizeFilename', () => {
    test('should remove invalid characters from filename', () => {
      const result = scraper.sanitizeFilename('test/file:name*.jpg');
      expect(result).not.toContain('/');
      expect(result).not.toContain(':');
      expect(result).not.toContain('*');
    });

    test('should handle empty title', () => {
      const result = scraper.sanitizeFilename('');
      expect(result).toBe('artwork');
    });

    test('should preserve extension', () => {
      const result = scraper.sanitizeFilename('Test Image.png');
      expect(result).toMatch(/\.png$/);
    });

    test('should remove path traversal attempts', () => {
      const result = scraper.sanitizeFilename('../../../etc/passwd');
      expect(result).not.toContain('..');
    });

    test('should remove leading dots', () => {
      const result = scraper.sanitizeFilename('.hidden-file.jpg');
      expect(result).not.toMatch(/^\./);
    });
  });

  describe('buildUrl', () => {
    test('should build URL with category', () => {
      const url = scraper.buildUrl('landscape', null, null, 20);
      expect(url).toContain('/c/landscape/');
    });

    test('should build URL with filters', () => {
      const url = scraper.buildUrl('landscape', '19th-century', 'portrait', 20);
      expect(url).toContain('filter_century=19th-century');
      expect(url).toContain('filter_orientation=portrait');
    });

    test('should build URL with pagination', () => {
      const url = scraper.buildUrl('landscape', null, null, 20, 2);
      expect(url).toContain('paged=2');
    });

    test('should build URL with per_page parameter', () => {
      const url = scraper.buildUrl('landscape', null, null, 50);
      expect(url).toContain('per_page=50');
    });
  });

  describe('_sleep', () => {
    test('should resolve after specified delay', async () => {
      const startTime = Date.now();
      await scraper._sleep(100);
      const endTime = Date.now();
      expect(endTime - startTime).toBeGreaterThanOrEqual(90);
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors gracefully', async () => {
      axios.get.mockRejectedValue(new Error('Network error'));
      
      await expect(
        scraper.scrapeArtworks({ category: 'landscape' })
      ).rejects.toThrow('Network error');
    });
  });

  describe('Security', () => {
    test('should validate safe filenames', () => {
      const validFilename = 'test-artwork.jpg';
      expect(scraper.sanitizeFilename(validFilename)).toBeTruthy();
    });

    test('should reject path traversal in filenames', () => {
      const dangerousPath = '../../../etc/passwd';
      const result = scraper.sanitizeFilename(dangerousPath);
      expect(result).not.toContain('..');
    });
  });

  describe('extractArtist', () => {
    test('should extract artist from title with dash', () => {
      const artist = scraper.extractArtist('Landscape - Van Gogh');
      expect(artist).toBe('Van Gogh');
    });

    test('should extract artist from title with en-dash', () => {
      const artist = scraper.extractArtist('Starry Night – Vincent van Gogh');
      expect(artist).toBe('Vincent van Gogh');
    });

    test('should extract artist from title with comma', () => {
      const artist = scraper.extractArtist('The Kiss, Gustav Klimt');
      expect(artist).toBe('Gustav Klimt');
    });

    test('should return null if no artist found', () => {
      const artist = scraper.extractArtist('Just A Title');
      expect(artist).toBeNull();
    });

    test('should return null for empty artist', () => {
      const artist = scraper.extractArtist('Title -');
      expect(artist).toBeNull();
    });
  });

  describe('getHeaders', () => {
    test('should return basic headers when no auth cookie', () => {
      const headers = scraper.getHeaders();
      expect(headers['User-Agent']).toContain('Mozilla');
      expect(headers['User-Agent']).toContain('Chrome');
    });

    test('should include auth cookie when provided', () => {
      const authScraper = new ArtveeScraper({ authCookie: 'test-cookie-value' });
      const headers = authScraper.getHeaders();
      expect(headers.Cookie).toBe('test-cookie-value');
    });

    test('should merge custom headers', () => {
      const customScraper = new ArtveeScraper({ 
        headers: { 'Custom-Header': 'value' } 
      });
      const headers = customScraper.getHeaders();
      expect(headers['Custom-Header']).toBe('value');
    });
  });

  describe('scrapeArtworks', () => {
    test('should scrape artworks successfully', async () => {
      const mockHtml = `
        <html>
          <body>
            <div class="product">
              <img class="lazy" src="https://example.com/art1.jpg" alt="Artwork 1" />
              <a class="linko" data-url="/dl/artwork-1"></a>
              <div class="woodmart-product-brands-links">
                <a>Artist 1</a>
              </div>
            </div>
            <div class="product">
              <img class="lazy" src="https://example.com/art2.jpg" alt="Artwork 2" />
              <a class="linko" data-url="/dl/artwork-2"></a>
              <div class="woodmart-product-brands-links">
                <a>Artist 2</a>
              </div>
            </div>
            <div class="woocommerce-pagination">
              <span class="page-numbers current">1</span>
              <a class="page-numbers">2</a>
              <a class="next page-numbers">Next</a>
            </div>
          </body>
        </html>
      `;

      axios.get.mockResolvedValue({ data: mockHtml });

      const result = await scraper.scrapeArtworks({ category: 'landscape' });

      expect(result.artworks).toHaveLength(2);
      expect(result.artworks[0].title).toBe('Artwork 1');
      expect(result.artworks[0].artist).toBe('Artist 1');
      expect(result.artworks[0].url).toBe('https://artvee.com/dl/artwork-1');
      expect(result.pagination.currentPage).toBe(1);
      expect(result.pagination.totalPages).toBe(2);
      expect(result.pagination.hasNextPage).toBe(true);
    });

    test('should handle empty results', async () => {
      axios.get.mockResolvedValue({ data: '<html><body></body></html>' });

      const result = await scraper.scrapeArtworks({ category: 'abstract' });

      expect(result.artworks).toHaveLength(0);
      expect(result.totalResults).toBe(0);
    });
  });

  describe('extractPagination', () => {
    test('should extract pagination from HTML', () => {
      const mockHtml = `
        <div class="woocommerce-pagination">
          <span class="page-numbers current">2</span>
          <a class="page-numbers">1</a>
          <a class="page-numbers">3</a>
          <a class="page-numbers">4</a>
          <a class="prev page-numbers">Prev</a>
          <a class="next page-numbers">Next</a>
        </div>
      `;
      
      const cheerio = require('cheerio');
      const $ = cheerio.load(mockHtml);
      
      const pagination = scraper.extractPagination($);
      
      expect(pagination.currentPage).toBe(2);
      expect(pagination.totalPages).toBe(4);
      expect(pagination.hasNextPage).toBe(true);
      expect(pagination.hasPrevPage).toBe(true);
    });

    test('should return defaults when no pagination found', () => {
      const cheerio = require('cheerio');
      const $ = cheerio.load('<html><body></body></html>');
      
      const pagination = scraper.extractPagination($);
      
      expect(pagination.currentPage).toBe(1);
      expect(pagination.totalPages).toBe(1);
      expect(pagination.hasNextPage).toBe(false);
      expect(pagination.hasPrevPage).toBe(false);
    });
  });

  describe('scrapeArtworkDetails', () => {
    test('should scrape artwork details successfully', async () => {
      const mockHtml = `
        <html>
          <head>
            <meta name="description" content="Beautiful artwork description" />
          </head>
          <body>
            <h1 class="product_title">The Great Wave</h1>
            <div class="product-image-wrap">
              <img class="wp-post-image" src="https://example.com/wave.jpg" alt="Great Wave" />
            </div>
            <div class="woodmart-product-brands-links">
              <a>Hokusai</a>
            </div>
          </body>
        </html>
      `;

      axios.get.mockResolvedValue({ data: mockHtml });

      const details = await scraper.scrapeArtworkDetails('https://artvee.com/dl/great-wave');

      expect(details.title).toBe('The Great Wave');
      expect(details.artist).toBe('Hokusai');
      expect(details.mainImage).toBe('https://example.com/wave.jpg');
      expect(details.description).toBe('Beautiful artwork description');
      expect(details.url).toBe('https://artvee.com/dl/great-wave');
    });

    test('should handle missing optional fields', async () => {
      const mockHtml = `
        <html>
          <body>
            <h1 class="product_title">Unknown Work</h1>
          </body>
        </html>
      `;

      axios.get.mockResolvedValue({ data: mockHtml });

      const details = await scraper.scrapeArtworkDetails('https://artvee.com/dl/unknown');

      expect(details.title).toBe('Unknown Work');
      expect(details.artist).toBeNull();
      expect(details.description).toBe('');
    });
  });

  describe('Retry Logic', () => {
    test('should implement exponential backoff', async () => {
      const jitterSpy = jest.spyOn(Math, 'random').mockReturnValue(0.1);
      const cryptoSpy = jest.spyOn(require('crypto'), 'randomBytes').mockReturnValue({
        readUInt32BE: () => 0x80000000 // 0.5 when divided by 0xFFFFFFFF
      });

      // Mock _retryWithBackoff call
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValueOnce('Success');

      const result = await scraper._retryWithBackoff(mockFn, {});

      expect(result).toBe('Success');
      expect(mockFn).toHaveBeenCalledTimes(3);

      cryptoSpy.mockRestore();
    });
  });

  describe('SafePath validation', () => {
    test('should validate path is within allowed directory', () => {
      const targetDir = './downloads';
      const filename = 'test.jpg';
      // Should not throw
      expect(() => scraper.safePath(targetDir, filename)).not.toThrow();
    });

    test('should reject path outside allowed directory', () => {
      const targetDir = './downloads';
      const filename = '../../../etc/passwd';
      expect(() => scraper.safePath(targetDir, filename)).toThrow('Path traversal attempt detected');
    });

    test('should reject absolute paths outside download dir', () => {
      const targetDir = './downloads';
      const filename = '/etc/passwd';
      expect(() => scraper.safePath(targetDir, filename)).toThrow('Path traversal attempt detected');
    });
  });

  describe('formatBytes', () => {
    test('should format 0 bytes', () => {
      expect(scraper.formatBytes(0)).toBe('0 Bytes');
    });

    test('should format bytes', () => {
      expect(scraper.formatBytes(500)).toBe('500 Bytes');
    });

    test('should format kilobytes', () => {
      expect(scraper.formatBytes(1024)).toBe('1 KB');
      expect(scraper.formatBytes(2048)).toBe('2 KB');
    });

    test('should format megabytes', () => {
      expect(scraper.formatBytes(1048576)).toBe('1 MB');
      expect(scraper.formatBytes(2097152)).toBe('2 MB');
    });

    test('should format gigabytes', () => {
      expect(scraper.formatBytes(1073741824)).toBe('1 GB');
    });

    test('should handle decimal values', () => {
      const result = scraper.formatBytes(1536); // 1.5 KB
      expect(result).toBe('1.5 KB');
    });
  });

  describe('getAvailable methods', () => {
    test('getAvailableCenturies should return century list', () => {
      const centuries = scraper.getAvailableCenturies();
      expect(centuries).toBeInstanceOf(Array);
      expect(centuries).toContain('19th-century');
      expect(centuries).toContain('17th-century');
      expect(centuries.length).toBeGreaterThan(5);
    });

    test('getAvailableOrientations should return orientation list', () => {
      const orientations = scraper.getAvailableOrientations();
      expect(orientations).toBeInstanceOf(Array);
      expect(orientations).toContain('landscape');
      expect(orientations).toContain('portrait');
      expect(orientations).toContain('square');
      expect(orientations).toContain('panorama');
    });

    test('getAvailableCategories should return category list', () => {
      const categories = scraper.getAvailableCategories();
      expect(categories).toBeInstanceOf(Array);
      expect(categories).toContain('landscape');
      expect(categories).toContain('abstract');
      expect(categories).toContain('figurative');
      expect(categories.length).toBeGreaterThan(8);
    });
  });

  describe('downloadImage', () => {
    beforeEach(() => {
      fs.existsSync = jest.fn().mockReturnValue(false);
      fs.statSync = jest.fn();
      fs.mkdirSync = jest.fn();
      fs.createWriteStream = jest.fn().mockReturnValue({
        on: jest.fn(),
        close: jest.fn()
      });
      fs.unlinkSync = jest.fn();
      fs.writeFileSync = jest.fn();
      fs.readFileSync = jest.fn();
      jest.clearAllTimers();
    });

    test('should skip download if file exists and overwrite is false', async () => {
      // First call checks the file, second checks the .partial marker
      fs.existsSync.mockReturnValueOnce(true).mockReturnValueOnce(false);
      fs.statSync.mockReturnValue({ size: 1000 });

      const result = await scraper.downloadImage(
        'https://example.com/image.jpg',
        './downloads/image.jpg',
        { overwrite: false }
      );

      expect(result.skipped).toBe(true);
      expect(result.message).toBe('File already exists');
    }, 10000);

    test('should download image successfully', async () => {
      const mockStream = {
        pipe: jest.fn().mockReturnThis(),
        on: jest.fn((event, callback) => {
          if (event === 'finish') callback();
          return mockStream;
        })
      };

      axios.mockResolvedValue({
        data: mockStream,
        headers: { 'content-length': '1000' }
      });

      pipeline.mockResolvedValue();
      fs.existsSync.mockReturnValue(false);
      fs.statSync.mockReturnValue({ size: 1000 });

      const result = await scraper.downloadImage(
        'https://example.com/image.jpg',
        './downloads/image.jpg',
        { maxRetries: 1 }
      );

      expect(result.path).toBe('./downloads/image.jpg');
    }, 10000);

    test('should handle download errors with max retries 0', async () => {
      axios.mockRejectedValue(new Error('Network error'));
      fs.existsSync.mockReturnValue(false);

      await expect(
        scraper.downloadImage('https://example.com/image.jpg', './downloads/image.jpg', {
          maxRetries: 0
        })
      ).rejects.toThrow('Network error');
    }, 10000);
  });

  describe('compressImage', () => {
    test('should return error if input file is missing', async () => {
      const scraperNoSharp = new ArtveeScraper();
      
      const result = await scraperNoSharp.compressImage('./input.jpg', './output.jpg');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Input file is missing');
    });
  });

  describe('downloadArtwork', () => {
    beforeEach(() => {
      fs.existsSync = jest.fn().mockReturnValue(false);
      fs.statSync = jest.fn();
      fs.mkdirSync = jest.fn();
      fs.writeFileSync = jest.fn();
      jest.clearAllMocks();
    });

    test('should download artwork with metadata', async () => {
      const mockStream = {
        pipe: jest.fn().mockReturnThis(),
        on: jest.fn((event, callback) => {
          if (event === 'finish') callback();
          return mockStream;
        })
      };

      axios.mockResolvedValue({
        data: mockStream,
        headers: { 'content-length': '1000' }
      });

      pipeline.mockResolvedValue();
      fs.statSync.mockReturnValue({ size: 1000 });
      fs.existsSync.mockReturnValue(false);

      const artwork = {
        title: 'Test Artwork',
        imageUrl: 'https://example.com/image.jpg',
        artist: 'Test Artist'
      };

      const result = await scraper.downloadArtwork(
        artwork,
        './downloads',
        { quality: 'thumbnail', saveMetadata: false, maxRetries: 1 }
      );

      expect(result.success).toBe(true);
      expect(result.path).toContain('Test_Artwork');
    }, 10000);

    test('should handle missing image URL', async () => {
      const artwork = {
        title: 'Test Artwork'
        // No imageUrl
      };

      const result = await scraper.downloadArtwork(artwork, './downloads', { maxRetries: 0 });
      expect(result.success).toBe(false);
    }, 10000);
  });

  describe('downloadMultipleArtworks', () => {
    beforeEach(() => {
      fs.existsSync = jest.fn().mockReturnValue(false);
      fs.statSync = jest.fn().mockReturnValue({ size: 1000 });
      fs.mkdirSync = jest.fn();
      fs.writeFileSync = jest.fn();
      pipeline.mockResolvedValue();
    });

    test('should download multiple artworks', async () => {
      const mockStream = {
        pipe: jest.fn().mockReturnThis(),
        on: jest.fn((event, callback) => {
          if (event === 'finish') callback();
          return mockStream;
        })
      };

      axios.mockResolvedValue({
        data: mockStream,
        headers: { 'content-length': '1000' }
      });

      const artworks = [
        { title: 'Art 1', imageUrl: 'https://example.com/1.jpg' },
        { title: 'Art 2', imageUrl: 'https://example.com/2.jpg' }
      ];

      const result = await scraper.downloadMultipleArtworks(
        artworks,
        './downloads',
        { showProgress: false, maxRetries: 1 }
      );

      expect(result.successful).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.skipped).toBe(0);
    }, 15000);

    test('should handle mixed success and failures', async () => {
      const mockStream = {
        pipe: jest.fn().mockReturnThis(),
        on: jest.fn((event, cb) => {
          if (event === 'finish') cb();
          return mockStream;
        })
      };

      // First call succeeds, second fails
      axios
        .mockResolvedValueOnce({
          data: mockStream,
          headers: { 'content-length': '1000' }
        })
        .mockRejectedValueOnce(new Error('Network error'));

      pipeline.mockResolvedValue();
      fs.existsSync.mockReturnValue(false);

      const artworks = [
        { title: 'Art 1', imageUrl: 'https://example.com/1.jpg' },
        { title: 'Art 2', imageUrl: 'https://example.com/2.jpg' }
      ];

      const result = await scraper.downloadMultipleArtworks(
        artworks,
        './downloads',
        { showProgress: false, maxRetries: 0 }
      );

      expect(result.total).toBe(2);
      expect(result.successful + result.failed).toBe(2);
    }, 15000);

    test('should handle empty artwork list', async () => {
      const result = await scraper.downloadMultipleArtworks(
        [],
        './downloads'
      );

      expect(result.successful).toBe(0);
      expect(result.failed).toBe(0);
      expect(result.total).toBe(0);
    });
  });
});
