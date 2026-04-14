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
3. **Test thoroughly** - ensure all examples still work
4. **Update documentation** if you're changing functionality
5. **Submit a PR** with a clear description of your changes

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

Before submitting:

```bash
# Test scraping
npm run test-scrape

# Test downloads
npm run test-download
```

## Respect Rate Limits

When contributing features that make requests to Artvee:
- Use reasonable delays (minimum 1000ms recommended)
- Limit concurrent requests (maximum 5)
- Be respectful of their servers

## Questions?

Feel free to open an issue for questions or discussion!

## Code of Conduct

Be respectful, constructive, and welcoming to all contributors.
