# Installation Guide

## Prerequisites

- **Node.js**: Version 20.0.0 or higher ([Download](https://nodejs.org/))
- **npm**: Comes with Node.js
- **Operating System**: Windows, macOS, or Linux

> **Note**: Node.js 20+ is required due to the File API dependency in axios/undici.

## Step 1: Clone or Download

### Option A: Clone with Git
```bash
git clone https://github.com/switchlove/artvee-node-scraper.git
cd artvee-node-scraper
```

### Option B: Download ZIP
1. Download the repository as ZIP
2. Extract to your desired location
3. Navigate to the folder in terminal

## Step 2: Install Dependencies

```bash
npm install
```

This will install the following packages:
- **axios** - HTTP client for making requests
- **cheerio** - HTML parsing for web scraping
- **image-size** - Image dimension detection

## Step 3: Verify Installation

Run the scraper test:
```bash
npm run test-scrape
```

You should see output showing scraped artworks from Artvee.com.

## Step 4: Test Download Functionality

```bash
npm run test-download
```

This will download 3 sample artworks to `./downloads/test/`

## Configuration (Optional)

### Create Config File

Copy the example configuration:
```bash
cp config.example.js config.js
```

Edit `config.js` to customize:
- Default download directory
- Download quality preferences
- Rate limiting settings

### Example Configuration
```javascript
module.exports = {
  download: {
    defaultDir: './downloads',
    defaultQuality: 'standard',
    delay: 1500,
    maxConcurrent: 3
  }
};
```

## Troubleshooting

### npm install fails

**Issue**: Dependency installation errors

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Try installing again
npm install
```

### Permission denied errors

**Issue**: Insufficient permissions

**Solution**:
```bash
# On Linux/macOS
sudo npm install

# Or change ownership
sudo chown -R $USER /usr/local/lib/node_modules
```

### Node version too old

**Issue**: "Unsupported engine" error

**Solution**: Update Node.js
```bash
# Check current version
node --version

# Update Node.js (using nvm)
nvm install 18
nvm use 18
```

## Next Steps

- Read the [Basic Usage](Usage) guide
- Explore [Examples](Examples)
- Set up a [Premium Account](Premium-Account) (optional)

## Getting Help

If you encounter issues:
1. Check the [Troubleshooting](Troubleshooting) guide
2. Review [FAQ](FAQ)
3. Submit an issue on GitHub
