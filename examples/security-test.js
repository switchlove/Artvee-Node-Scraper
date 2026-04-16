/*
 * Copyright (c) 2026 Artvee Node Scraper Contributors
 * SPDX-License-Identifier: MIT
 */

const ArtveeScraper = require('../scraper');
const path = require('path');

/**
 * Test path traversal security fixes
 * Verifies that malicious filenames are properly sanitized
 */

function testSanitization() {
  console.log('═'.repeat(70));
  console.log('  PATH TRAVERSAL SECURITY TEST');
  console.log('═'.repeat(70));
  console.log();

  const scraper = new ArtveeScraper();

  // Test cases with potentially malicious input
  const testCases = [
    {
      input: '../../etc/passwd',
      desc: 'Parent directory traversal',
      shouldNotContain: ['..']
    },
    {
      input: '..\\..\\windows\\system32\\config',
      desc: 'Windows path traversal',
      shouldNotContain: ['..', '\\', 'system32']
    },
    {
      input: '/etc/passwd',
      desc: 'Absolute path (Unix)',
      shouldNotContain: ['/etc']
    },
    {
      input: 'C:\\Windows\\System32\\drivers',
      desc: 'Absolute path (Windows)',
      shouldNotContain: ['C:', '\\', 'Windows']
    },
    {
      input: 'normal/../../../etc/shadow',
      desc: 'Mixed normal and traversal',
      shouldNotContain: ['..', '/', 'etc']
    },
    {
      input: '.bashrc',
      desc: 'Hidden file (leading dot)',
      shouldNotContain: null  // Leading dot should be removed
    },
    {
      input: 'file\x00.jpg',
      desc: 'Null byte injection',
      shouldNotContain: ['\x00']
    },
    {
      input: 'normal_file_name.jpg',
      desc: 'Normal safe filename',
      shouldMatch: /^[a-zA-Z0-9_\-]+$/
    },
    {
      input: 'My Artwork Title!',
      desc: 'Spaces and punctuation',
      shouldMatch: /^[a-zA-Z_]+$/
    },
    {
      input: '',
      desc: 'Empty string',
      shouldBe: 'artwork'
    },
    {
      input: null,
      desc: 'Null input',
      shouldBe: 'artwork'
    },
    {
      input: '....',
      desc: 'Only dots',
      shouldBe: 'artwork'
    }
  ];

  console.log('Testing sanitizeFilename() method:\n');
  console.log(`${'Input'.padEnd(35)} | ${'Sanitized'.padEnd(30)} | Result`);
  console.log('─'.repeat(70));

  let passed = 0;
  let failed = 0;

  for (const test of testCases) {
    const sanitized = scraper.sanitizeFilename(test.input);
    let result = '✓ PASS';
    let issues = [];

    // Check if it should not contain certain strings
    if (test.shouldNotContain) {
      for (const bad of test.shouldNotContain) {
        if (sanitized.includes(bad)) {
          issues.push(`contains "${bad}"`);
        }
      }
    }

    // Check if it should match a pattern
    if (test.shouldMatch && !test.shouldMatch.test(sanitized)) {
      issues.push(`doesn't match pattern`);
    }

    // Check if it should be a specific value
    if (test.shouldBe && sanitized !== test.shouldBe) {
      issues.push(`expected "${test.shouldBe}"`);
    }

    // Check that leading dot is removed
    if (test.input && test.input.startsWith('.') && sanitized.startsWith('.')) {
      issues.push('still has leading dot');
    }

    if (issues.length > 0) {
      result = `✗ FAIL: ${issues.join(', ')}`;
      failed++;
    } else {
      passed++;
    }

    const displayInput = test.input === null ? 'null' : 
                        test.input === '' ? '(empty)' : 
                        test.input.replace(/\0/g, '\\0');
    
    console.log(`${displayInput.substring(0, 35).padEnd(35)} | ${sanitized.substring(0, 30).padEnd(30)} | ${result}`);
  }

  console.log('─'.repeat(70));
  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);

  // Test path.join with sanitized filenames
  console.log('═'.repeat(70));
  console.log('Testing safePath() validation:\n');

  const dangerousInputs = [
    '../../etc/passwd',
    '../../../windows/system32',
    'normal/../../../etc/shadow',
    'legitimate_file.jpg'
  ];

  for (const dangerous of dangerousInputs) {
    const sanitized = scraper.sanitizeFilename(dangerous);
    
    try {
      const safePath = scraper.safePath('./downloads', sanitized + '.jpg');
      const normalized = path.normalize(safePath);
      
      console.log(`Input:      ${dangerous}`);
      console.log(`Sanitized:  ${sanitized}`);
      console.log(`Safe Path:  ${safePath}`);
      console.log(`Normalized: ${normalized}`);
      
      // Check if the normalized path stays within ./downloads
      const downloadDir = path.resolve('./downloads');
      if (normalized.startsWith(downloadDir)) {
        console.log(`Status:     ✓ VALIDATED - Path stays within downloads directory`);
      } else {
        console.log(`Status:     ✗ ERROR - Path escapes downloads directory!`);
      }
    } catch (error) {
      console.log(`Input:      ${dangerous}`);
      console.log(`Status:     ✓ BLOCKED - ${error.message}`);
    }
    console.log();
  }

  console.log('═'.repeat(70));
  console.log('✅ Security Test Complete!');
  console.log('═'.repeat(70));
  console.log();

  if (failed === 0) {
    console.log('🎉 All tests passed! Path traversal attacks are mitigated.\n');
  } else {
    console.log(`⚠️  ${failed} tests failed. Review sanitization logic.\n`);
  }
}

testSanitization();
