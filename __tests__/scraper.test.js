// Mock modules before importing scraper
jest.mock('axios');
jest.mock('fs');
jest.mock('stream/promises', () => ({
  pipeline: jest.fn()
}));

// Create a mock sharp module
const mockSharpTransform = {
  resize: jest.fn().mockReturnThis(),
  jpeg: jest.fn().mockReturnThis(),
  png: jest.fn().mockReturnThis(),
  webp: jest.fn().mockReturnThis(),
  toFile: jest.fn().mockResolvedValue({}),
  metadata: jest.fn().mockResolvedValue({ format: 'jpeg' })
};

const mockSharpFunction = jest.fn(() => mockSharpTransform);  
mockSharpFunction.mockReturnValue(mockSharpTransform);

jest.mock('sharp', () => mockSharpFunction);

// Import after mocks are set up
const ArtveeScraper = require('../scraper.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream/promises');

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

    test('should handle network errors', async () => {
      axios.get.mockRejectedValue(new Error('Network error'));

      await expect(
        scraper.scrapeArtworkDetails('https://artvee.com/dl/error')
      ).rejects.toThrow('Network error');
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
        .mockResolvedValueOnce('success');

      const result = await scraper._retryWithBackoff(mockFn, {
        maxRetries: 3,
        retryDelay: 1000
      });

      expect(mockFn).toHaveBeenCalledTimes(3);
      expect(result).toBe('success');

      cryptoSpy.mockRestore();
      jitterSpy.mockRestore();
    });

    test('should log retry attempts', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      fs.existsSync.mockReturnValue(false);
      axios
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockResolvedValueOnce({
          data: {
            pipe: jest.fn().mockReturnThis(),
            on: jest.fn((event, cb) => {
              if (event === 'finish') cb();
              return this;
            })
          },
          headers: { 'content-length': '1000' }
        });

      pipeline.mockResolvedValue();
      fs.statSync.mockReturnValue({ size: 1000 });

      await scraper.downloadImage(
        'https://example.com/image.jpg',
        './downloads/image.jpg',
        { maxRetries: 2, retryDelay: 100 }
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Download failed')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Retrying in')
      );

      consoleSpy.mockRestore();
    }, 10000);
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

    test('should update progressBar when file is cached', async () => {
      fs.existsSync.mockReturnValueOnce(true).mockReturnValueOnce(false);
      fs.statSync.mockReturnValue({ size: 2048000 }); // 2MB

      const mockProgressBar = {
        update: jest.fn()
      };

      const result = await scraper.downloadImage(
        'https://example.com/image.jpg',
        './downloads/image.jpg',
        { overwrite: false, progressBar: mockProgressBar }
      );

      expect(result.skipped).toBe(true);
      expect(mockProgressBar.update).toHaveBeenCalledWith(
        100,
        expect.objectContaining({ size: expect.stringContaining('MB (cached)') })
      );
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

    test('should remove partial file when resume is disabled', async () => {
      // First call checks the file (true), second checks .partial marker (true)
      fs.existsSync.mockReturnValueOnce(true).mockReturnValueOnce(true);
      fs.statSync.mockReturnValue({ size: 500 });
      fs.unlinkSync = jest.fn();

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

      const result = await scraper.downloadImage(
        'https://example.com/image.jpg',
        './downloads/image.jpg',
        { resume: false, maxRetries: 1 }
      );

      expect(fs.unlinkSync).toHaveBeenCalledWith('./downloads/image.jpg');
      expect(fs.unlinkSync).toHaveBeenCalledWith('./downloads/image.jpg.partial');
    }, 10000);

    test('should resume partial download', async () => {
      // File exists (true), partial marker exists (true), other checks
      const existsMock = jest.fn()
        .mockReturnValueOnce(true)  // outputPath exists
        .mockReturnValueOnce(true)  // .partial marker exists
        .mockReturnValueOnce(true); // dir check in internal
      
      fs.existsSync = existsMock;
      fs.statSync.mockReturnValue({ size: 500 });

      const mockStream = {
        pipe: jest.fn().mockReturnThis(),
        on: jest.fn((event, callback) => {
          if (event === 'finish') callback();
          if (event === 'data') {
            // Simulate data chunks
            callback(Buffer.alloc(100));
          }
          return mockStream;
        })
      };

      axios.mockResolvedValue({
        data: mockStream,
        headers: { 
          'content-length': '500',
          'content-range': 'bytes 500-999/1000',
          'accept-ranges': 'bytes'
        },
        status: 206
      });

      pipeline.mockResolvedValue();

      const result = await scraper.downloadImage(
        'https://example.com/image.jpg',
        './downloads/image.jpg',
        { resume: true, maxRetries: 1 }
      );

      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'Range': 'bytes=500-'
          })
        })
      );
      expect(result.success).toBe(true);
    }, 10000);

    test('should use progressBar when provided', async () => {
      fs.existsSync.mockReturnValue(false);
      fs.statSync.mockReturnValue({ size: 1000 });

      const mockProgressBar = {
        update: jest.fn()
      };

      const mockStream = {
        pipe: jest.fn().mockReturnThis(),
        on: jest.fn((event, callback) => {
          if (event === 'finish') callback();
          if (event === 'data') {
            // Simulate data chunk
            callback(Buffer.alloc(100));
          }
          return mockStream;
        })
      };

      axios.mockResolvedValue({
        data: mockStream,
        headers: { 'content-length': '1000' }
      });

      pipeline.mockResolvedValue();

      const result = await scraper.downloadImage(
        'https://example.com/image.jpg',
        './downloads/image.jpg',
        { progressBar: mockProgressBar, maxRetries: 1 }
      );

      expect(mockProgressBar.update).toHaveBeenCalled();
    }, 10000);

    test('should create CLI progress bar when showProgress is true', async () => {
      fs.existsSync.mockReturnValue(false);
      fs.statSync.mockReturnValue({ size: 1000 });

      const mockStream = {
        pipe: jest.fn().mockReturnThis(),
        on: jest.fn((event, callback) => {
          if (event === 'finish') callback();
          if (event === 'data') {
            callback(Buffer.alloc(250));
            callback(Buffer.alloc(250));
          }
          return mockStream;
        })
      };

      axios.mockResolvedValue({
        data: mockStream,
        headers: { 'content-length': '1000' }
      });

      pipeline.mockResolvedValue();

      const result = await scraper.downloadImage(
        'https://example.com/image.jpg',
        './downloads/image.jpg',
        { showProgress: true, maxRetries: 1 }
      );

      expect(result.path).toBe('./downloads/image.jpg');
    }, 10000);

    test('should handle compression during download', async () => {
      fs.existsSync.mockReturnValue(false);
      fs.statSync.mockReturnValue({ size: 1000 });

      const mockStream = {
        pipe: jest.fn().mockReturnThis(),
        on: jest.fn((event, callback) => {
          if (event === 'finish') callback();
          return mockStream;
        })
      };

      axios.mockResolvedValue({
        data: mockStream,
        headers: { 'content-length': '5000' }
      });

      pipeline.mockResolvedValue();

      const scraper2 = new ArtveeScraper();
      scraper2.compressImage = jest.fn().mockResolvedValue({
        success: true,
        compressedSize: 2000
      });

      const result = await scraper2.downloadImage(
        'https://example.com/image.jpg',
        './downloads/image.jpg',
        { compress: true, maxRetries: 1 }
      );

      expect(scraper2.compressImage).toHaveBeenCalled();
    }, 10000);

    test('should handle download failure and cleanup partial marker', async () => {
      fs.existsSync.mockReturnValue(false);
      fs.unlinkSync = jest.fn();

      axios.mockRejectedValue(new Error('Download failed'));

      await expect(
        scraper.downloadImage(
          'https://example.com/image.jpg',
          './downloads/image.jpg',
          { maxRetries: 0 }
        )
      ).rejects.toThrow('Download failed');
    }, 10000);

    test('should remove partial marker after successful download', async () => {
      const existsMock = jest.fn()
        .mockReturnValueOnce(false)  // Initial file check
        .mockReturnValueOnce(false)  // .partial marker check  
        .mockReturnValueOnce(true)   // dir exists
        .mockReturnValueOnce(true);  // .partial exists after download
      
      fs.existsSync = existsMock;
      fs.unlinkSync = jest.fn();
      fs.statSync.mockReturnValue({ size: 1000 });

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

      await scraper.downloadImage(
        'https://example.com/image.jpg',
        './downloads/image.jpg',
        { maxRetries: 1 }
      );

      expect(fs.unlinkSync).toHaveBeenCalledWith('./downloads/image.jpg.partial');
    }, 10000);
  });

  describe('compressImage', () => {
    beforeEach(() => {
      // Reset mock counts before each test
      jest.clearAllMocks();
      mockSharpTransform.resize.mockClear();
      mockSharpTransform.jpeg.mockClear();
      mockSharpTransform.png.mockClear();
      mockSharpTransform.webp.mockClear();
      mockSharpTransform.toFile.mockClear();
      mockSharpTransform.metadata.mockClear();
      
      // Reset default return values
      mockSharpTransform.metadata.mockResolvedValue({ format: 'jpeg' });
      mockSharpTransform.toFile.mockResolvedValue({});
    });

    test('should return error if input file is missing', async () => {
      const compressionScraper = new ArtveeScraper();
      fs.statSync = jest.fn(() => {
        throw new Error('ENOENT: no such file or directory');
      });
      
      const result = await compressionScraper.compressImage('./input.jpg', './output.jpg');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should compress JPEG with explicit format', async () => {
      fs.statSync = jest.fn()
        .mockReturnValueOnce({ size: 10000 })
        .mockReturnValueOnce({ size: 5000 });
      
      fs.renameSync = jest.fn();

      const compressionScraper = new ArtveeScraper();
      const result = await compressionScraper.compressImage(
        './input.jpg',
        './output.jpg',
        { format: 'jpeg', quality: 80, progressive: true }
      );

      expect(result.success).toBe(true);
      expect(result.originalSize).toBe(10000);
      expect(result.compressedSize).toBe(5000);
      expect(mockSharpTransform.jpeg).toHaveBeenCalledWith({ quality: 80, progressive: true });
      expect(result.savingsPercent).toBe('50.0');
    });

    test('should compress PNG with explicit format', async () => {
      fs.statSync = jest.fn()
        .mockReturnValueOnce({ size: 15000 })
        .mockReturnValueOnce({ size: 8000 });
      
      fs.renameSync = jest.fn();

      const compressionScraper = new ArtveeScraper();
      await compressionScraper.compressImage(
        './input.png',
        './output.png',
        { format: 'png', quality: 75 }
      );

      expect(mockSharpTransform.png).toHaveBeenCalledWith({ quality: 75, compressionLevel: 9 });
    });

    test('should compress WebP with explicit format', async () => {
      fs.statSync = jest.fn()
        .mockReturnValueOnce({ size: 12000 })
        .mockReturnValueOnce({ size: 6000 });
      
      fs.renameSync = jest.fn();

      const compressionScraper = new ArtveeScraper();
      await compressionScraper.compressImage(
        './input.webp',
        './output.webp',
        { format: 'webp', quality: 85 }
      );

      expect(mockSharpTransform.webp).toHaveBeenCalledWith({ quality: 85 });
    });

    test('should auto-detect JPEG format from metadata', async () => {
      mockSharpTransform.metadata.mockResolvedValue({ format: 'jpeg' });
      
      fs.statSync = jest.fn()
        .mockReturnValueOnce({ size: 20000 })
        .mockReturnValueOnce({ size: 10000 });
      
      fs.renameSync = jest.fn();

      const compressionScraper = new ArtveeScraper();
      await compressionScraper.compressImage(
        './input.jpg',
        './output.jpg',
        { quality: 90 }  // No format specified
      );

      expect(mockSharpTransform.metadata).toHaveBeenCalled();
      expect(mockSharpTransform.jpeg).toHaveBeenCalledWith({ quality: 90, progressive: true });
    });

    test('should auto-detect PNG format from metadata', async () => {
      mockSharpTransform.metadata.mockResolvedValue({ format: 'png' });
      
      fs.statSync = jest.fn()
        .mockReturnValueOnce({ size: 18000 })
        .mockReturnValueOnce({ size: 9000 });
      
      fs.renameSync = jest.fn();

      const compressionScraper = new ArtveeScraper();
      await compressionScraper.compressImage(
        './input.png',
        './output.png',
        { quality: 85 }  // No format specified
      );

      expect(mockSharpTransform.metadata).toHaveBeenCalled();
      expect(mockSharpTransform.png).toHaveBeenCalledWith({ quality: 85, compressionLevel: 9 });
    });

    test('should auto-detect WebP format from metadata', async () => {
      mockSharpTransform.metadata.mockResolvedValue({ format: 'webp' });
      
      fs.statSync = jest.fn()
        .mockReturnValueOnce({ size: 14000 })
        .mockReturnValueOnce({ size: 7000 });
      
      fs.renameSync = jest.fn();

      const compressionScraper = new ArtveeScraper();
      await compressionScraper.compressImage(
        './input.webp',
        './output.webp',
        { quality: 80 }  // No format specified
      );

      expect(mockSharpTransform.metadata).toHaveBeenCalled();
      expect(mockSharpTransform.webp).toHaveBeenCalledWith({ quality: 80 });
    });

    test('should resize and compress with dimensions', async () => {
      fs.statSync = jest.fn()
        .mockReturnValueOnce({ size: 25000 })
        .mockReturnValueOnce({ size: 8000 });
      
      fs.renameSync = jest.fn();

      const compressionScraper = new ArtveeScraper();
      const result = await compressionScraper.compressImage(
        './input.jpg',
        './output.jpg',
        { width: 1920, height: 1080, quality: 85 }
      );

      expect(mockSharpTransform.resize).toHaveBeenCalledWith(
        1920,
        1080,
        { fit: 'inside', withoutEnlargement: true }
      );
      expect(result.success).toBe(true);
    });

    test('should use input path as output if not specified', async () => {
      fs.statSync = jest.fn()
        .mockReturnValueOnce({ size: 10000 })
        .mockReturnValueOnce({ size: 5000 });
      
      fs.renameSync = jest.fn();

      const compressionScraper = new ArtveeScraper();
      const result = await compressionScraper.compressImage('./input.jpg');

      expect(result.path).toBe('./input.jpg');
      expect(fs.renameSync).toHaveBeenCalledWith('./input.jpg.tmp', './input.jpg');
    });

    test('should handle compression errors gracefully', async () => {
      mockSharpTransform.toFile.mockRejectedValue(new Error('Sharp processing failed'));
      
      fs.statSync = jest.fn().mockReturnValueOnce({ size: 10000 });

      const compressionScraper = new ArtveeScraper();
      const result = await compressionScraper.compressImage(
        './input.jpg',
        './output.jpg'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Sharp processing failed');
      expect(result.path).toBe('./output.jpg');
    });

    test('should handle jpg format as jpeg', async () => {
      fs.statSync = jest.fn()
        .mockReturnValueOnce({ size: 10000 })
        .mockReturnValueOnce({ size: 5000 });
      
      fs.renameSync = jest.fn();

      const compressionScraper = new ArtveeScraper();
      
      // Test with 'jpg' format parameter
      await compressionScraper.compressImage(
        './input.jpg',
        './output.jpg',
        { format: 'jpg', quality: 80 }
      );

      expect(mockSharpTransform.jpeg).toHaveBeenCalledWith({ quality: 80, progressive: true });
    });

    test('should auto-detect jpg format from metadata', async () => {
      mockSharpTransform.metadata.mockResolvedValue({ format: 'jpg' });
      
      fs.statSync = jest.fn()
        .mockReturnValueOnce({ size: 10000 })
        .mockReturnValueOnce({ size: 5000 });
      
      fs.renameSync = jest.fn();

      const compressionScraper = new ArtveeScraper();
      
      // No format specified, should auto-detect from metadata
      await compressionScraper.compressImage(
        './input.jpg',
        './output.jpg',
        { quality: 80 }
      );

      expect(mockSharpTransform.metadata).toHaveBeenCalled();
      expect(mockSharpTransform.jpeg).toHaveBeenCalledWith({ quality: 80, progressive: true });
    });

    test('should include formatted file sizes in result', async () => {
      fs.statSync = jest.fn()
        .mockReturnValueOnce({ size: 10485760 })  // 10 MB
        .mockReturnValueOnce({ size: 5242880 });   // 5 MB
      
      fs.renameSync = jest.fn();

      const compressionScraper = new ArtveeScraper();
      const result = await compressionScraper.compressImage(
        './input.jpg',
        './output.jpg',
        { quality: 80 }
      );

      expect(result.originalSizeFormatted).toBe('10 MB');
      expect(result.compressedSizeFormatted).toBe('5 MB');
      expect(result.savingsFormatted).toBe('5 MB');
      expect(result.savings).toBe(5242880);
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

    test('should download high quality with premium account', async () => {
      const premiumScraper = new ArtveeScraper({ isPremium: true });
      
      const mockHtml = `
        <html>
          <body>
            <h1 class="product_title">Premium Art</h1>
            <a href="https://example.com/high.jpg" class="download-link">High Quality Download</a>
            <a href="https://example.com/hd.jpg" class="download-link">HD Download</a>
          </body>
        </html>
      `;

      const mockStream = {
        pipe: jest.fn().mockReturnThis(),
        on: jest.fn((event, callback) => {
          if (event === 'finish') callback();
          return mockStream;
        })
      };

      axios.get.mockResolvedValue({ data: mockHtml });
      axios.mockResolvedValue({
        data: mockStream,
        headers: { 'content-length': '5000' }
      });

      pipeline.mockResolvedValue();
      fs.statSync.mockReturnValue({ size: 5000 });
      fs.existsSync.mockReturnValue(false);
      fs.writeFileSync = jest.fn();

      const artwork = {
        title: 'Premium Art',
        imageUrl: 'https://example.com/thumbnail.jpg',
        url: 'https://artvee.com/dl/premium-art'
      };

      const result = await premiumScraper.downloadArtwork(
        artwork,
        './downloads',
        { quality: 'high', saveMetadata: true, maxRetries: 1 }
      );

      expect(result.success).toBe(true);
      expect(fs.writeFileSync).toHaveBeenCalled();
    }, 10000);

    test('should save metadata alongside image', async () => {
      const mockStream = {
        pipe: jest.fn().mockReturnThis(),
        on: jest.fn((event, callback) => {
          if (event === 'finish') callback();
          return mockStream;
        })
      };

      const mockHtml = `
        <html>
          <head>
            <meta name="description" content="A beautiful artwork" />
          </head>
          <body>
            <h1 class="product_title">Art With Metadata</h1>
            <div class="woodmart-product-brands-links">
              <a>Famous Artist</a>
            </div>
            <div class="product-image-wrap">
              <img class="wp-post-image" src="https://example.com/main.jpg" />
            </div>
            <a href="https://example.com/download.jpg" class="download-btn">Download</a>
          </body>
        </html>
      `;

      axios.get.mockResolvedValue({ data: mockHtml });
      axios.mockResolvedValue({
        data: mockStream,
        headers: { 'content-length': '2000' }
      });

      pipeline.mockResolvedValue();
      fs.statSync.mockReturnValue({ size: 2000 });
      fs.existsSync.mockReturnValue(false);
      fs.writeFileSync = jest.fn();

      const artwork = {
        title: 'Art With Metadata',
        imageUrl: 'https://example.com/image.jpg',
        url: 'https://artvee.com/dl/art-metadata',
        artist: 'Famous Artist'
      };

      const result = await scraper.downloadArtwork(
        artwork,
        './downloads',
        { saveMetadata: true, maxRetries: 1 }
      );

      expect(result.success).toBe(true);
      expect(fs.writeFileSync).toHaveBeenCalled();
    }, 10000);

    test('should handle missing image URL', async () => {
      const artwork = {
        title: 'Test Artwork'
        // No imageUrl
      };

      const result = await scraper.downloadArtwork(artwork, './downloads', { maxRetries: 0 });
      expect(result.success).toBe(false);
    }, 10000);

    test('should handle download errors in downloadArtwork', async () => {
      axios.mockRejectedValue(new Error('Download failed'));

      const artwork = {
        title: 'Failed Art',
        imageUrl: 'https://example.com/fail.jpg'
      };

      const result = await scraper.downloadArtwork(artwork, './downloads', { maxRetries: 0 });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Download failed');
      expect(result.artwork).toBe('Failed Art');
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

    test('should handle large batch with concurrency limit', async () => {
      const mockStream = {
        pipe: jest.fn().mockReturnThis(),
        on: jest.fn((event, cb) => {
          if (event === 'finish') cb();
          return mockStream;
        })
      };

      axios.mockResolvedValue({
        data: mockStream,
        headers: { 'content-length': '1000' }
      });

      pipeline.mockResolvedValue();
      fs.existsSync.mockReturnValue(false);

      // Create 10 artworks to test concurrency
      const artworks = Array.from({ length: 10 }, (_, i) => ({
        title: `Art ${i}`,
        imageUrl: `https://example.com/${i}.jpg`
      }));

      const result = await scraper.downloadMultipleArtworks(
        artworks,
        './downloads',
        { concurrency: 3, showProgress: false, maxRetries: 1 }
      );

      expect(result.total).toBe(10);
      expect(result.successful).toBe(10);
    }, 20000);

    test('should track skipped files', async () => {
      // First file exists (will be skipped), second doesn't
      fs.existsSync
        .mockReturnValueOnce(true)   // Art 1 file check
        .mockReturnValueOnce(false)  // Art 1 .partial check
        .mockReturnValueOnce(false); // Art 2 file check
      
      fs.statSync.mockReturnValue({ size: 1000 });

      const mockStream = {
        pipe: jest.fn().mockReturnThis(),
        on: jest.fn((event, cb) => {
          if (event === 'finish') cb();
          return mockStream;
        })
      };

      axios.mockResolvedValue({
        data: mockStream,
        headers: { 'content-length': '1000' }
      });

      pipeline.mockResolvedValue();

      const artworks = [
        { title: 'Art 1', imageUrl: 'https://example.com/1.jpg' },
        { title: 'Art 2', imageUrl: 'https://example.com/2.jpg' }
      ];

      const result = await scraper.downloadMultipleArtworks(
        artworks,
        './downloads',
        { showProgress: false, overwrite: false, maxRetries: 1 }
      );

      expect(result.skipped).toBeGreaterThan(0);
    }, 15000);

    test('should show progress with multibar when showProgress is true', async () => {
      const mockStream = {
        pipe: jest.fn().mockReturnThis(),
        on: jest.fn((event, cb) => {
          if (event === 'finish') cb();
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

      const cliProgress = require('cli-progress');
      const mockMultibar = {
        create: jest.fn().mockReturnValue({
          update: jest.fn(),
          stop: jest.fn()
        }),
        stop: jest.fn()
      };

      jest.spyOn(cliProgress, 'MultiBar').mockImplementation(() => mockMultibar);

      const artworks = [
        { title: 'Art 1', imageUrl: 'https://example.com/1.jpg' },
        { title: 'Art 2', imageUrl: 'https://example.com/2.jpg' }
      ];

      const result = await scraper.downloadMultipleArtworks(
        artworks,
        './downloads',
        { showProgress: true, maxRetries: 1 }
      );

      expect(mockMultibar.create).toHaveBeenCalled();
      expect(mockMultibar.stop).toHaveBeenCalled();
    }, 15000);

    test('should handle download failures and update progress bars', async () => {
      const mockStream = {
        pipe: jest.fn().mockReturnThis(),
        on: jest.fn((event, cb) => {
          if (event === 'finish') cb();
          return mockStream;
        })
      };

      // First succeeds, second and third fail
      axios
        .mockResolvedValueOnce({
          data: mockStream,
          headers: { 'content-length': '1000' }
        })
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Timeout'));

      pipeline.mockResolvedValue();
      fs.existsSync.mockReturnValue(false);
      fs.statSync.mockReturnValue({ size: 1000 });

      const cliProgress = require('cli-progress');
      const mockBar = {
        update: jest.fn(),
        stop: jest.fn()
      };
      const mockMultibar = {
        create: jest.fn().mockReturnValue(mockBar),
        stop: jest.fn()
      };

      jest.spyOn(cliProgress, 'MultiBar').mockImplementation(() => mockMultibar);

      const artworks = [
        { title: 'Success Art', imageUrl: 'https://example.com/1.jpg' },
        { title: 'Fail Art 1', imageUrl: 'https://example.com/2.jpg' },
        { title: 'Fail Art 2', imageUrl: 'https://example.com/3.jpg' }
      ];

      const result = await scraper.downloadMultipleArtworks(
        artworks,
        './downloads',
        { showProgress: true, maxRetries: 0 }
      );

      expect(result.successful).toBe(1);
      expect(result.failed).toBe(2);
      // Check that failed items had their progress bar updated with "Failed"
      expect(mockBar.update).toHaveBeenCalledWith(100, { size: 'Failed' });
    }, 15000);

    test('should handle delay between chunks', async () => {
      const mockStream = {
        pipe: jest.fn().mockReturnThis(),
        on: jest.fn((event, cb) => {
          if (event === 'finish') cb();
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

      // Create 6 artworks to test delay (concurrency of 2 = 3 chunks)
      const artworks = Array.from({ length: 6 }, (_, i) => ({
        title: `Art ${i}`,
        imageUrl: `https://example.com/${i}.jpg`
      }));

      const result = await scraper.downloadMultipleArtworks(
        artworks,
        './downloads',
        { concurrency: 2, delay: 50, showProgress: false, maxRetries: 1 }
      );

      expect(result.total).toBe(6);
      expect(result.successful).toBe(6);
    }, 15000);
  });
});
