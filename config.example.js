// Configuration file for Artvee Scraper
// Copy this file to config.js and fill in your credentials

module.exports = {
  // Premium Account Settings (Optional)
  // If you have an Artvee premium account, you can add authentication here
  premium: {
    enabled: false,
    
    // To get your authentication cookie:
    // 1. Log in to artvee.com in your browser
    // 2. Open DevTools (F12)
    // 3. Go to Application/Storage > Cookies
    // 4. Copy the cookie values
    // 5. Format as a cookie string: "cookie1=value1; cookie2=value2"
    authCookie: '',
    
    // Additional headers if needed
    headers: {
      // 'X-Custom-Header': 'value'
    }
  },

  // Download Settings
  download: {
    // Default directory for downloads
    defaultDir: './downloads',
    
    // Default quality: 'thumbnail', 'standard', or 'high'
    defaultQuality: 'standard',
    
    // Delay between downloads (milliseconds) - be respectful to the server
    delay: 1500,
    
    // Maximum concurrent downloads
    maxConcurrent: 3,
    
    // Overwrite existing files
    overwrite: false,
    
    // Save metadata JSON files alongside images
    saveMetadata: true
  },

  // Scraping Settings
  scraping: {
    // Default results per page
    perPage: 70,
    
    // User-Agent string
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  }
};
