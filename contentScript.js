// --- Step 1: Initialization ---
const restricted_sites = new Set();
const restricted_urls = new Set();

// --- Step 2: Retrieve and process the blocked list from storage ---
chrome.storage.sync.get("blockedWebsitesArray", function (data) {
  const blockedWebsitesArray = data.blockedWebsitesArray || [];
  
  if (blockedWebsitesArray.length > 0) {
    // Populate the sets with normalized URLs
    blockedWebsitesArray.forEach((item) => {
      // Normalize the item from storage before adding it to our sets
      const normalizedItem = normalizeUrl(item);
      
      // Separate domain-only blocks from URL-with-path blocks
      if (normalizedItem.includes('/')) {
        restricted_urls.add(normalizedItem);
      } else {
        restricted_sites.add(normalizedItem);
      }
    });
    
    // Now that the sets are populated, check the current page
    check_if_restricted();
  }
});

// --- Step 3: The core normalization function ---
/**
 * Normalizes a URL for consistent comparison.
 * - Converts to lowercase.
 * - Removes protocols (http, https).
 * - Removes 'www.' prefix.
 * - Removes trailing slashes.
 * @param {string} url - The URL to normalize.
 * @returns {string} - The normalized URL.
 */
function normalizeUrl(url) {
    let normalized = url.trim().toLowerCase();
    
    // Remove protocol
    normalized = normalized.replace(/^https?:\/\//, '');
    
    // Remove www.
    normalized = normalized.replace(/^www\./, '');
    
    // Remove trailing slash
    if (normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }
    
    return normalized;
}

// --- Step 4: Blocking logic functions ---

// Checks if the current page's full path is blocked
function shouldBlockURL() {
  const currentHostname = window.location.hostname;
  const currentPathname = window.location.pathname;
  
  // Combine and normalize the current page's URL to match the stored format
  let currentPageUrl = normalizeUrl(currentHostname + currentPathname);

  for (let blockedUrl of restricted_urls) {
    // We check if the current page URL *starts with* the blocked URL.
    if (currentPageUrl.startsWith(blockedUrl)) {
      return true;
    }
  }
  return false;
}

// Checks if the current page's domain is blocked
function shouldBlockWebsite() {
  const currentHostname = normalizeUrl(window.location.hostname);
  return restricted_sites.has(currentHostname);
}

// Main checking function
function check_if_restricted() {
  // Check the more specific URL blocks first, then domain-level blocks
  if (shouldBlockURL() || shouldBlockWebsite()) {
    createBlockedPage();
  }
}

// --- Step 5: Page replacement functions ---
function createBlockedPage() {
  // Immediately stop the page from loading further resources (images, scripts)
  window.stop();
  
  // Replace the entire page's HTML with our custom block screen.
  // This is more effective than just changing document.body.
  document.documentElement.innerHTML = `
    <head>
      <meta charset="UTF-8">
      <title>Site Blocked</title>
      <style>
        html, body {
          height: 100%;
          margin: 0;
          padding: 0;
          overflow: hidden;
        }
        body {
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          background-color: #174b42 !important;
          font-family: 'Noto Serif', serif, sans-serif !important;
        }
        h1 {
          font-size: 3em !important;
          color: white !important;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <h1>Site Blocked</h1>
    </body>
  `;
}
