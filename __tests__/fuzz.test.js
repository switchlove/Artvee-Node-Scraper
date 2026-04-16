/*
 * Copyright (c) 2026 Artvee Node Scraper Contributors
 * SPDX-License-Identifier: MIT
 */

const fc = require('fast-check');
const ArtveeScraper = require('../scraper');

describe('Property-based fuzz tests', () => {
  let scraper;

  beforeEach(() => {
    scraper = new ArtveeScraper();
  });

  test('buildUrl creates valid Artvee URLs across random filter inputs', () => {
    const categoryArb = fc
      .array(fc.constantFrom('a', 'b', 'c', 'd', 'e', 'f', '-', '1', '2', '3'), {
        minLength: 1,
        maxLength: 24
      })
      .map((chars) => chars.join(''));

    const centuryArb = fc
      .array(fc.constantFrom('1', '2', '3', '4', '5', '-', 't', 'h', 'c', 'e', 'n', 'u', 'r', 'y'), {
        minLength: 1,
        maxLength: 20
      })
      .map((chars) => chars.join(''));

    fc.assert(
      fc.property(
        categoryArb,
        fc.option(centuryArb, { nil: null }),
        fc.option(fc.constantFrom('landscape', 'portrait', 'square', 'panorama'), { nil: null }),
        fc.integer({ min: 1, max: 200 }),
        fc.integer({ min: 1, max: 25 }),
        (category, century, orientation, perPage, page) => {
          const url = scraper.buildUrl(category, century, orientation, perPage, page);

          expect(() => new URL(url)).not.toThrow();
          const parsed = new URL(url);

          expect(parsed.origin).toBe('https://artvee.com');
          expect(parsed.pathname).toBe(`/c/${category}/`);
          expect(parsed.searchParams.get('per_page')).toBe(String(perPage));
          expect(parsed.searchParams.get('per_row')).toBe('5');
          expect(parsed.searchParams.get('shop_view')).toBe('grid');

          if (century) {
            expect(parsed.searchParams.get('filter_century')).toBe(century);
          } else {
            expect(parsed.searchParams.get('filter_century')).toBeNull();
          }

          if (orientation) {
            expect(parsed.searchParams.get('filter_orientation')).toBe(orientation);
            expect(parsed.searchParams.get('query_type_orientation')).toBe('or');
          } else {
            expect(parsed.searchParams.get('filter_orientation')).toBeNull();
            expect(parsed.searchParams.get('query_type_orientation')).toBeNull();
          }

          if (page > 1) {
            expect(parsed.searchParams.get('paged')).toBe(String(page));
          } else {
            expect(parsed.searchParams.get('paged')).toBeNull();
          }
        }
      ),
      { numRuns: 300 }
    );
  });

  test('extractArtist is stable across random unicode-like input', () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 200 }), (title) => {
        const result = scraper.extractArtist(title);

        expect(result === null || typeof result === 'string').toBe(true);
        if (typeof result === 'string') {
          expect(result.length).toBeGreaterThan(0);
          expect(result).toBe(result.trim());
        }
      }),
      { numRuns: 500 }
    );
  });

  test('sanitizeFilename never emits path traversal markers or separators', () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 300 }), (input) => {
        const sanitized = scraper.sanitizeFilename(input);

        expect(typeof sanitized).toBe('string');
        expect(sanitized.length).toBeGreaterThan(0);
        expect(sanitized).not.toContain('..');
        expect(sanitized).not.toContain('/');
        expect(sanitized).not.toContain('\\');
      }),
      { numRuns: 500 }
    );
  });
});
