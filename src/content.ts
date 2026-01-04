// Content script for Tingly Deepwiki extension

console.log('Tingly Deepwiki content script loaded')

// Listen for messages from background or popup
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === 'GET_CURRENT_URL') {
    sendResponse({ url: window.location.href })
  }
  if (request.type === 'IS_DEEPWIKI_PAGE') {
    sendResponse({ isDeepwiki: checkIsDeepwikiPage() })
  }
  if (request.type === 'GET_PAGE_INFO') {
    sendResponse(getPageInfo())
  }
})

function getPageInfo() {
  // Try to get description from meta tags
  const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content')
  const ogDescription = document.querySelector('meta[property="og:description"]')?.getAttribute('content')

  // For GitHub pages, try to get repo description from the page
  let description = metaDescription || ogDescription || ''

  // Specific handling for GitHub repo pages
  if (window.location.hostname.includes('github.com')) {
    const repoDescElement = document.querySelector('[itemprop="about"]')
    if (repoDescElement) {
      description = repoDescElement.textContent?.trim() || description
    }
  }

  return {
    description,
    title: document.title,
    url: window.location.href
  }
}

function checkIsDeepwikiPage(): boolean {
  // Check if current page is a deepwiki result page
  const url = window.location.href
  return url.includes('deepwiki.example.com') || url.includes('deepwiki')
}
