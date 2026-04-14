const ArtveeScraper = require('../scraper.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

jest.mock('axios');
jest.mock('fs');

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
});
