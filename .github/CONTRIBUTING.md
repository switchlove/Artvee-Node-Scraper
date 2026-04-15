# Contributing to Artvee Scraper

Thank you for your interest in contributing! Here are some guidelines to help you get started.

## Developer Certificate of Origin (DCO)

By contributing to this project, you agree to the [Developer Certificate of Origin (DCO)](https://developercertificate.org/). This certifies that you have the legal right to make your contributions.

To indicate your agreement, add a `Signed-off-by` line to all your commit messages:

```bash
git commit -s -m "Your commit message"
```

This will automatically add:
```
Signed-off-by: Your Name <your.email@example.com>
```

The DCO requires that you certify:
1. You created the contribution or have the right to submit it under the project's open source license
2. You understand and agree that your contribution is public
3. Your submission complies with any employer agreements or other third-party rights

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

### Static Analysis

The project uses automated static analysis for security and code quality:

- **njsscan** - Node.js security scanner runs on every push, PR, and weekly schedule
- **CodeQL** - GitHub Code Scanning Default Setup analyzes code for vulnerabilities
- **Node.js syntax checker** - `node --check` validates syntax in CI

All medium and higher severity issues are fixed before release. View security findings at:
- https://github.com/switchlove/Artvee-Node-Scraper/security/code-scanning

### Dynamic Analysis

The project includes dynamic testing with assertions:

- **Property-based fuzzing** - fast-check runs 300-500 randomized test cases per property
- **Unit tests** - 114 Jest tests with extensive `expect()` assertions
- **Integration tests** - Real-world usage validation via example scripts

Run fuzzing tests locally:
```bash
npm run fuzz
```

## Security Best Practices

### Secure Development Knowledge

Project maintainers are knowledgeable about:

- **Common vulnerabilities**: Path traversal, XSS, injection attacks, ReDoS
- **Secure design patterns**: Input validation, output encoding, least privilege
- **Mitigation techniques**: All implemented in codebase (see below)

### Security Features

The following security measures are implemented:

1. **Path Traversal Prevention**
   - `sanitizeFilename()`: Removes `..`, null bytes, and path separators
   - `safePath()`: Validates resolved paths stay within target directory
   - Uses `path.basename()` for defense-in-depth

2. **ReDoS Prevention**
   - `extractArtist()`: Uses String methods instead of complex regex
   - Avoids backtracking-prone regex patterns

3. **Cryptographically Secure Random Numbers**
   - Uses Node.js built-in `crypto.randomBytes()` for jitter generation
   - Never uses `Math.random()` for security-sensitive operations

4. **Input Validation**
   - Filename sanitization enforces 150-character limit
   - URL validation via native URL parser
   - Type checking on all public method parameters

### Cryptographic Practices

This project is a web scraper and **does not implement cryptography**. When cryptographic operations are needed:

- Uses Node.js built-in `crypto` module (FIPS 140-2 validated)
- Only for non-cryptographic purposes (secure random jitter)
- No custom cryptographic algorithms or key management

### Vulnerability Management

- All publicly known vulnerabilities tracked in GitHub Security Advisories
- Medium/high severity vulnerabilities fixed within 60 days
- Critical vulnerabilities fixed rapidly (target: within 7 days)
- Security scanning via njsscan and CodeQL runs continuously

### Credential Security

- **No credentials in code**: Project does not store passwords or API keys
- Authentication (when used) is user-provided via constructor options
- Secrets must be managed externally (environment variables, secret managers)

## Respect Rate Limits

When contributing features that make requests to Artvee:
- Use reasonable delays (minimum 1000ms recommended)
- Limit concurrent requests (maximum 5)
- Be respectful of their servers

## Questions?

Feel free to open an issue for questions or discussion!

## Code of Conduct

This project follows the Contributor Covenant Code of Conduct:
- [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md)

By participating, you agree to be respectful, constructive, and welcoming to all contributors.
