# Architecture Overview

This document describes the high-level architecture of Artvee Node Scraper.

## Goals

- Provide a simple Node.js API for scraping Artvee metadata
- Download images reliably with retry and resume support
- Keep the design dependency-light and easy to maintain
- Handle untrusted remote content safely (filename/path validation)

## High-Level Components

1. Scraper Core (`ArtveeScraper` class in `scraper.js`)
- Entry point for all user operations
- Coordinates HTTP requests, parsing, and file operations

2. HTTP Layer
- Uses `axios` for all network requests
- Applies headers and optional premium auth cookie
- Implements retry with exponential backoff and jitter

3. Parsing Layer
- Uses `cheerio` to parse HTML responses from Artvee
- Extracts artwork metadata, URLs, and pagination details

4. Download Layer
- Streams image content to local files
- Supports resume behavior for partial downloads
- Validates output paths to prevent path traversal

5. Optional Compression Layer
- Uses `sharp` when installed
- Performs format conversion and quality-based compression
- Gracefully degrades when `sharp` is unavailable

6. Testing and Quality Layer
- Unit/integration tests with `jest`
- Property-based fuzz tests with `fast-check`
- CI checks for syntax and security scanning

## Data Flow

1. User creates `ArtveeScraper` with options
2. User calls scrape method (e.g., `scrapeArtworks`)
3. HTTP layer fetches remote pages
4. Parsing layer extracts metadata records
5. User optionally calls download methods
6. Download layer writes files safely to disk
7. Optional compression transforms downloaded images

## Security Design

- Input validation on user-supplied options
- Filename sanitization and safe path resolution
- Regex strategy designed to reduce ReDoS risk
- Cryptographically secure random jitter via Node `crypto.randomBytes`
- Private vulnerability disclosure workflow in `SECURITY.md`

## Operational Boundaries

What the project does:
- Scrapes publicly available artwork metadata and files from Artvee
- Provides local download and processing utilities

What the project does not do:
- Host remote content
- Store user credentials in repository code
- Provide account/session management services
- Guarantee uninterrupted availability of third-party endpoints

## External Dependencies

Runtime dependencies include:
- `axios` (HTTP)
- `cheerio` (HTML parsing)
- `cli-progress` (terminal progress)
- `sharp` (optional image processing)

## Deployment Model

- Published as an npm package
- Used as a local library/script dependency
- No always-on backend service operated by this project

## Evolution

Architecture changes are proposed through GitHub Issues and Pull Requests and
approved using the governance process described in `GOVERNANCE.md`.
