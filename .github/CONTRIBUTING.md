# Contributing to Artvee Scraper

Thank you for your interest in contributing! Here are some guidelines to help you get started.

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:
- A clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Your Node.js version and OS
- Error messages or stack traces

### Suggesting Features

Feature requests are welcome! Please:
- Check existing issues first to avoid duplicates
- Describe the feature and its use case
- Explain why it would be useful to others

### Submitting Pull Requests

1. **Fork the repository** and create a new branch
2. **Make your changes** with clear, descriptive commits
3. **Add tests** for new functionality (required - see Testing section below)
4. **Run tests locally** - ensure `npm test` passes with 100% coverage
5. **Update documentation** if you're changing functionality
6. **Submit a PR** with a clear description of your changes

The CI pipeline will automatically run tests, check syntax, and verify coverage on your PR.

## Development Setup

```bash
git clone https://github.com/switchlove/Artvee-Node-Scraper.git
cd Artvee-Node-Scraper
npm install
```

## Code Style

- Use consistent indentation (2 spaces)
- Write clear, descriptive variable names
- Add comments for complex logic
- Follow the existing code structure

## Testing

**All new functionality must include automated tests.** The project maintains 100% code coverage.

### Running Tests

```bash
# Run full test suite with coverage
npm test

# Run tests in watch mode
npm run test:watch

# Run property-based fuzz tests
npm run fuzz

# Test scraping (integration test)
npm run test-scrape

# Test downloads (integration test)
npm run test-download
```

### Test Requirements

- Add unit tests for all new functions and methods
- Add integration tests for new features
- Ensure tests pass locally before submitting PR
- Maintain or improve code coverage (currently 100%)
- Tests run automatically in CI on all PRs

## Respect Rate Limits

When contributing features that make requests to Artvee:
- Use reasonable delays (minimum 1000ms recommended)
- Limit concurrent requests (maximum 5)
- Be respectful of their servers

## Questions?

Feel free to open an issue for questions or discussion!

## Code of Conduct

Be respectful, constructive, and welcoming to all contributors.
