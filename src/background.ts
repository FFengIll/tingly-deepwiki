// Background service worker for Tingly Deepwiki extension

console.log('Tingly Deepwiki background service worker initialized')

// Listen for messages from content script and popup
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  console.log('Background received message:', request.type)

  if (request.type === 'SWITCH_TO_DEEPWIKI') {
    handleSwitchToDeepwiki(request.url)
  } else if (request.type === 'SCAN_PAGE_URLS') {
    handleScanPageUrls(request.tabId).then((urls) => {
      sendResponse({ urls })
    })
    return true // Keep message channel open for async response
  } else if (request.type === 'SAVE_DEEPWIKI') {
    handleSaveDeepwiki(request.data).then(() => {
      sendResponse({ success: true })
    })
    return true // Keep message channel open for async response
  } else if (request.type === 'GET_SAVED_DEEPWIKIS') {
    getSavedDeepwikis().then((data) => {
      sendResponse(data)
    })
    return true // Keep message channel open for async response
  } else if (request.type === 'DELETE_DEEPWIKI') {
    deleteDeepwiki(request.id).then(() => {
      sendResponse({ success: true })
    })
    return true // Keep message channel open for async response
  }
})

function handleSwitchToDeepwiki(url: string) {
  const deepwikiUrl = convertToDeepwikiUrl(url)
  chrome.tabs.create({ url: deepwikiUrl })
}

function convertToDeepwikiUrl(url: string): string {
  try {
    const urlObj = new URL(url)

    // For GitHub URLs, preserve the owner/repo path
    if (isGithubUrl(url)) {
      const pathParts = urlObj.pathname.split('/').filter(Boolean)
      if (pathParts.length >= 2) {
        const [owner, repo] = pathParts
        return `https://deepwiki.com/${owner}/${repo}`
      }
    }

    // For other URLs, use hostname only
    return `https://deepwiki.com/${urlObj.hostname}`
  } catch {
    return url
  }
}

async function handleScanPageUrls(tabId?: number): Promise<string[]> {
  console.log('Scanning page URLs, tabId:', tabId)
  if (!tabId) return []

  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: scanPageUrls
    })

    const urls = results[0]?.result || []
    console.log('Found URLs:', urls.length)
    return urls
  } catch (error) {
    console.error('Failed to scan page:', error)
    return []
  }
}

function scanPageUrls(): string[] {
  function isGithubRepoUrl(url: string): boolean {
    try {
      const urlObj = new URL(url)
      if (urlObj.hostname !== 'github.com' && urlObj.hostname !== 'www.github.com') {
        return false
      }
      const pathParts = urlObj.pathname.split('/').filter(Boolean)
      // Standard repo format: /owner/repo (exactly 2 parts, not more like /owner/repo/tree/main)
      return pathParts.length === 2
    } catch {
      return false
    }
  }

  function cleanGithubUrl(url: string): string {
    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/').filter(Boolean)
      if (pathParts.length >= 2) {
        const [owner, repo] = pathParts
        // Return clean URL without query params or hash
        return `https://github.com/${owner}/${repo}`
      }
      return url
    } catch {
      return url
    }
  }

  const links = document.querySelectorAll('a[href]')
  const urlSet = new Set<string>()

  links.forEach((link) => {
    const href = (link as HTMLAnchorElement).href
    if (isGithubRepoUrl(href)) {
      const cleanUrl = cleanGithubUrl(href)
      urlSet.add(cleanUrl)
    }
  })

  return Array.from(urlSet)
}

function isSupportedUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'https:' || urlObj.protocol === 'http:'
  } catch {
    return false
  }
}

function isGithubUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname === 'github.com' || urlObj.hostname === 'www.github.com'
  } catch {
    return false
  }
}

function isDeepwikiUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.includes('deepwiki')
  } catch {
    return false
  }
}

function extractGithubRepoInfo(url: string): string {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/').filter(Boolean)
    if (pathParts.length >= 2) {
      const [owner, repo] = pathParts
      return `${owner}/${repo}`
    }
    return urlObj.hostname
  } catch {
    return url
  }
}

async function handleSaveDeepwiki(data: { url: string; title: string; description?: string }) {
  console.log('Saving deepwiki:', data)
  const saved = await getSavedDeepwikis()

  const isGithub = isGithubUrl(data.url) || isGithubUrl(data.title)
  const isDeepwikiPage = isDeepwikiUrl(data.url)

  let url = data.url
  let displayUrl = data.url
  let title = data.title
  let description = data.description

  if (isGithub) {
    // For GitHub: save deepwiki URL for navigation, but keep GitHub URL for display
    // If url is already deepwiki, use it; otherwise convert from title
    if (isDeepwikiUrl(data.url)) {
      url = data.url
      displayUrl = data.title
      title = data.title
    } else {
      url = convertToDeepwikiUrl(data.url)
      displayUrl = data.url
      title = data.url
    }
    // GitHub sidebar project description - would need to be fetched or passed in
    // For now, use the URL as placeholder
    description = data.description || extractGithubRepoInfo(displayUrl)
  } else if (isDeepwikiPage) {
    // For deepwiki: save the deepwiki URL and description
    url = data.url
    displayUrl = data.url
    title = data.title
    description = data.description
  }

  saved.push({
    id: crypto.randomUUID(),
    url,
    displayUrl,
    title,
    description,
    savedAt: new Date().toISOString()
  })
  await chrome.storage.local.set({ savedDeepwikis: saved })
  console.log('Saved successfully, total:', saved.length)
}

async function deleteDeepwiki(id: string) {
  console.log('Deleting deepwiki:', id)
  const saved = await getSavedDeepwikis()
  const filtered = saved.filter((item: any) => item.id !== id)
  await chrome.storage.local.set({ savedDeepwikis: filtered })
  console.log('Deleted successfully, remaining:', filtered.length)
}

async function getSavedDeepwikis() {
  const result = await chrome.storage.local.get('savedDeepwikis')
  return result.savedDeepwikis || []
}
