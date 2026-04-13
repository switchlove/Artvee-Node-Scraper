# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it by:

1. **Do NOT** open a public issue
2. Email the maintainer or use GitHub's private vulnerability reporting
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Best Practices

### Protecting Your Credentials

- **Never commit** your `config.js` file (it's in `.gitignore`)
- **Never share** your premium account cookies publicly
- **Store credentials** in environment variables or secure config files
- **Rotate cookies** periodically

### Safe Usage

- Don't include authentication tokens in code
- Use environment variables for sensitive data:
  ```javascript
  authCookie: process.env.ARTVEE_COOKIE
  ```
- Be cautious when sharing code snippets that might contain credentials

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Dependencies

This project uses:
- `axios` - HTTP client
- `cheerio` - HTML parser
- `image-size` - Image metadata

Keep dependencies updated to get security patches:
```bash
npm audit
npm update
```
