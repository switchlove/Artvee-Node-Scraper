# Premium Account

Guide to using Artvee premium accounts for high-quality downloads.

## What is a Premium Account?

Artvee offers premium accounts that may provide:
- Access to highest resolution downloads
- Faster download speeds
- Priority access to new content
- Commercial usage rights (check Artvee's terms)

## Setting Up Premium Authentication

### Step 1: Log In to Artvee

1. Go to [Artvee.com](https://artvee.com)
2. Click "Sign In" and log in with your premium account
3. Verify you're logged in successfully

### Step 2: Extract Authentication Cookie

#### Using Chrome/Edge

1. Open **DevTools** (press `F12`)
2. Go to the **Application** tab
3. In the left sidebar, expand **Storage** > **Cookies**
4. Click on `https://artvee.com`
5. You'll see a list of cookies

#### Copy Cookie String

You need to copy all cookies in this format:
```
cookie1name=cookie1value; cookie2name=cookie2value; cookie3name=cookie3value
```

**Important cookies to include:**
- Session cookies
- Authentication tokens
- User ID cookies

#### Using Browser Extension

Alternatively, use a cookie export extension:
- [EditThisCookie](https://chrome.google.com/webstore/detail/editthiscookie/) (Chrome)
- [Cookie-Editor](https://addons.mozilla.org/en-US/firefox/addon/cookie-editor/) (Firefox)

Export in "Netscape HTTP Cookie File" format or as a header string.

### Step 3: Configure Scraper

```javascript
const ArtveeScraper = require('./scraper');

const premiumScraper = new ArtveeScraper({
  authCookie: 'your_cookie_string_here'
});

console.log('Premium enabled:', premiumScraper.isPremium); // true
```

### Step 4: Use Configuration File

Create `config.js`:

```javascript
module.exports = {
  premium: {
    enabled: true,
    authCookie: 'wordpress_logged_in_xxxxx=username%7C...; wp_user_id=12345; ...',
    headers: {
      // Additional headers if needed
    }
  }
};
```

Load in your script:

```javascript
const config = require('./config');
const ArtveeScraper = require('./scraper');

const scraper = new ArtveeScraper(config.premium.enabled ? {
  authCookie: config.premium.authCookie,
  headers: config.premium.headers
} : {});
```

## Using Premium Features

### Download High-Quality Images

```javascript
const premiumScraper = new ArtveeScraper({
  authCookie: 'your_cookie_here'
});

const results = await premiumScraper.scrapeArtworks({
  category: 'landscape',
  century: '18th-century',
  perPage: 20
});

// Download in highest quality
await premiumScraper.downloadMultipleArtworks(
  results.artworks,
  './downloads/premium',
  {
    quality: 'high',  // Highest quality available
    includeDetails: true,
    delay: 1500,
    maxConcurrent: 3
  }
);
```

### Quality Comparison

| Quality | Free Account | Premium Account |
|---------|--------------|-----------------|
| Thumbnail | 500px (~50KB) | 500px (~50KB) |
| Standard | 1800px (~2MB) | 1800px (~2MB) |
| High | Limited/None | 4000-7000px+ (~20MB) |

### Check Authentication Status

```javascript
const scraper = new ArtveeScraper({
  authCookie: process.env.ARTVEE_COOKIE
});

if (scraper.isPremium) {
  console.log('✓ Premium account active');
} else {
  console.log('⚠ No premium authentication');
}
```

## Best Practices

### 1. Keep Cookies Secure

**Don't commit cookies to Git:**

```bash
# .gitignore
config.js
.env
```

**Use environment variables:**

```javascript
require('dotenv').config();

const scraper = new ArtveeScraper({
  authCookie: process.env.ARTVEE_AUTH_COOKIE
});
```

**.env file:**
```
ARTVEE_AUTH_COOKIE=wordpress_logged_in_xxxxx=username%7C...
```

### 2. Refresh Cookies Periodically

Cookies expire! When you see authentication errors:

1. Log in to Artvee.com again
2. Extract fresh cookies
3. Update your configuration

### 3. Respect Rate Limits

Even with premium accounts, be respectful:

```javascript
await premiumScraper.downloadMultipleArtworks(
  artworks,
  './downloads',
  {
    quality: 'high',
    delay: 2000,      // 2 second delay
    maxConcurrent: 2  // Only 2 at once
  }
);
```

### 4. Test Authentication

```javascript
// Test if premium access works
async function testPremiumAccess(scraper) {
  const results = await scraper.scrapeArtworks({
    category: 'landscape',
    perPage: 1
  });

  const details = await scraper.scrapeArtworkDetails(results.artworks[0].url);

  if (details.downloadLinks.length > 0) {
    console.log('✓ Can access download links');
    console.log('Available downloads:', details.downloadLinks.length);
  } else {
    console.log('⚠ No download links found');
  }
}

testPremiumAccess(premiumScraper);
```

## Troubleshooting

### Authentication Not Working

**Problem**: Premium features not accessible

**Solutions**:

1. **Verify cookies are current**
   ```javascript
   // Cookies might have expired
   // Re-login and get fresh cookies
   ```

2. **Check cookie format**
   ```javascript
   // Should be: "name1=value1; name2=value2"
   // Not: ["name1=value1", "name2=value2"]
   ```

3. **Include all necessary cookies**
   ```javascript
   // Don't just copy one cookie
   // Copy the entire cookie string
   ```

### Download Quality Same as Free

**Problem**: High quality still downloads standard resolution

**Possible causes**:
1. Authentication not working (see above)
2. Artwork doesn't have high-res version available
3. Need to use different quality parameter

**Solution**:
```javascript
// Try different quality settings
const details = await scraper.scrapeArtworkDetails(artworkUrl);
console.log('Available downloads:', details.downloadLinks);

// Some artworks may not have high-res versions
```

### Session Expires Quickly

**Problem**: Cookies stop working after short time

**Solution**: Some cookies are session-based. Try:
1. Look for persistent cookies
2. Enable "Remember Me" when logging in
3. Refresh cookies more frequently

## Security Considerations

1. **Never share your cookie string publicly**
2. **Don't commit cookies to version control**
3. **Use environment variables for secrets**
4. **Rotate cookies regularly**
5. **Monitor account for unauthorized access**

## Example: Complete Premium Setup

```javascript
// config.js (don't commit this file!)
module.exports = {
  premium: {
    enabled: true,
    authCookie: process.env.ARTVEE_COOKIE || '',
    headers: {}
  },
  download: {
    quality: 'high',
    delay: 2000,
    maxConcurrent: 2,
    includeDetails: true
  }
};

// scraper-premium.js
const config = require('./config');
const ArtveeScraper = require('./scraper');

async function main() {
  const scraper = new ArtveeScraper(config.premium.enabled ? {
    authCookie: config.premium.authCookie
  } : {});

  if (!scraper.isPremium) {
    console.warn('⚠ Premium not enabled. Using free tier.');
  }

  const results = await scraper.scrapeArtworks({
    category: 'landscape',
    century: '17th-century',
    perPage: 10
  });

  await scraper.downloadMultipleArtworks(
    results.artworks,
    './downloads/premium',
    config.download
  );
}

main().catch(console.error);
```

## Next Steps

- Review [Download Guide](Download-Guide) for download options
- Check [API Reference](API-Reference) for detailed documentation
- See [Examples](Examples) for premium usage patterns
