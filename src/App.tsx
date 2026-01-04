import { useState, useEffect } from 'react'
import { useToast } from './Toast'

interface SavedDeepwiki {
  id: string
  url: string
  displayUrl: string
  title: string
  description?: string
  savedAt: string
}

export default function App() {
  const { showToast } = useToast()
  const [currentUrl, setCurrentUrl] = useState('')
  const [isDeepwiki, setIsDeepwiki] = useState(false)
  const [isGithub, setIsGithub] = useState(false)
  const [scannedUrls, setScannedUrls] = useState<string[]>([])
  const [savedDeepwikis, setSavedDeepwikis] = useState<SavedDeepwiki[]>([])
  const [activeTab, setActiveTab] = useState<'switch' | 'scan' | 'saved'>('switch')
  const [scanning, setScanning] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getCurrentTab()
    loadSavedDeepwikis()
  }, [])

  const getCurrentTab = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    let isGithubPage = false
    let isGithubRepo = false
    if (tab.url) {
      setCurrentUrl(tab.url)
      // Check if it's a GitHub page
      try {
        const urlObj = new URL(tab.url)
        isGithubPage = urlObj.hostname === 'github.com' || urlObj.hostname === 'www.github.com'
        setIsGithub(isGithubPage)
        // Check if it's a standard repo format: github.com/owner/repo
        if (isGithubPage) {
          const pathParts = urlObj.pathname.split('/').filter(Boolean)
          isGithubRepo = pathParts.length === 2
        }
      } catch {
        setIsGithub(false)
      }
    }
    chrome.tabs.sendMessage(tab.id!, { type: 'IS_DEEPWIKI_PAGE' }, (response) => {
      if (response) {
        const deepwiki = response.isDeepwiki
        setIsDeepwiki(deepwiki)
        // Set default tab based on page type
        if (deepwiki) {
          setActiveTab('switch')
        } else if (isGithubRepo) {
          setActiveTab('switch')
        } else if (isGithubPage) {
          setActiveTab('scan')
        } else {
          setActiveTab('saved')
        }
      }
    })
  }

  const loadSavedDeepwikis = () => {
    chrome.runtime.sendMessage({ type: 'GET_SAVED_DEEPWIKIS' }, (response) => {
      console.log('Loaded saved deepwikis:', response)
      if (response) {
        setSavedDeepwikis(response)
      }
    })
  }

  const handleSwitchToDeepwiki = () => {
    chrome.runtime.sendMessage({ type: 'SWITCH_TO_DEEPWIKI', url: currentUrl })
    window.close()
  }

  const handleScanPage = async () => {
    setScanning(true)
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    chrome.runtime.sendMessage({ type: 'SCAN_PAGE_URLS', tabId: tab.id }, (response) => {
      console.log('Scan result:', response)
      if (response && response.urls) {
        setScannedUrls(response.urls)
      }
      setScanning(false)
    })
  }

  const handleOpenUrl = (url: string) => {
    const deepwikiUrl = convertToDeepwikiUrl(url)
    chrome.tabs.create({ url: deepwikiUrl })
    window.close()
  }

  const handleSaveDeepwiki = async () => {
    setSaving(true)
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

    // For GitHub, save the deepwiki URL instead of the GitHub URL
    const urlToSave = isGithub ? convertToDeepwikiUrl(currentUrl) : currentUrl

    // Try to get description from the page
    chrome.tabs.sendMessage(tab.id!, { type: 'GET_PAGE_INFO' }, (pageInfo) => {
      const description = pageInfo?.description || ''

      chrome.runtime.sendMessage({
        type: 'SAVE_DEEPWIKI',
        data: { url: urlToSave, title: currentUrl, description }
      }, (response) => {
        console.log('Save response:', response)
        loadSavedDeepwikis()
        setSaving(false)
        showToast(isGithub ? 'GitHub repo saved to Deepwiki!' : 'Deepwiki page saved!')
      })
    })
  }

  const handleSaveFromScan = (url: string) => {
    const urlToSave = convertToDeepwikiUrl(url)
    chrome.runtime.sendMessage({
      type: 'SAVE_DEEPWIKI',
      data: { url: urlToSave, title: url, description: '' }
    }, (response) => {
      console.log('Save response:', response)
      loadSavedDeepwikis()
      showToast('GitHub repo saved to Deepwiki!')
    })
  }

  const handleDelete = (id: string) => {
    chrome.runtime.sendMessage({ type: 'DELETE_DEEPWIKI', id }, (response) => {
      console.log('Delete response:', response)
      loadSavedDeepwikis()
      showToast('Deleted successfully')
    })
  }

  const convertToDeepwikiUrl = (url: string): string => {
    try {
      const urlObj = new URL(url)

      // For GitHub URLs, preserve the owner/repo path
      if (urlObj.hostname === 'github.com' || urlObj.hostname === 'www.github.com') {
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

  return (
    <div className="popup-container">
      <header className="popup-header">
        <h1>Tingly Deepwiki</h1>
      </header>

      <nav className="popup-nav">
        <button className={activeTab === 'switch' ? 'active' : ''} onClick={() => setActiveTab('switch')}>Switch</button>
        <button className={activeTab === 'scan' ? 'active' : ''} onClick={() => setActiveTab('scan')}>Scan</button>
        <button className={activeTab === 'saved' ? 'active' : ''} onClick={() => setActiveTab('saved')}>Saved</button>
      </nav>

      <main className="popup-content">
        {activeTab === 'switch' && (
          <div className="tab-content">
            <p className="current-url">{currentUrl.length > 50 ? currentUrl.slice(0, 50) + '...' : currentUrl}</p>
            <button className="primary-btn" onClick={handleSwitchToDeepwiki}>Open in Deepwiki</button>
            {(isDeepwiki || isGithub) && (
              <button className="secondary-btn" onClick={handleSaveDeepwiki} disabled={saving}>
                {saving ? 'Saving...' : isGithub ? 'Save to Deepwiki' : 'Save This Deepwiki'}
              </button>
            )}
          </div>
        )}

        {activeTab === 'scan' && (
          <div className="tab-content">
            <button className="primary-btn" onClick={handleScanPage} disabled={scanning}>
              {scanning ? 'Scanning...' : 'Scan Current Page'}
            </button>
            {scannedUrls.length > 0 && (
              <div className="url-list">
                <h3>Found URLs ({scannedUrls.length})</h3>
                <ul>
                  {scannedUrls.map((url, i) => {
                    const isGithubUrl = url.includes('github.com')
                    return (
                      <li key={i}>
                        <span className="url-text">{url}</span>
                        <button onClick={() => handleOpenUrl(url)}>Open</button>
                        {isGithubUrl && (
                          <button onClick={() => handleSaveFromScan(url)}>Save</button>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="tab-content">
            <h3>Saved Deepwikis ({savedDeepwikis.length})</h3>
            {savedDeepwikis.length === 0 ? (
              <p className="empty-state">No saved deepwikis yet</p>
            ) : (
              <ul className="saved-list">
                {savedDeepwikis.map((item, i) => (
                  <li key={i}>
                    <div className="saved-item">
                      <span className="saved-title">{item.title}</span>
                      {item.description && (
                        <span className="saved-description">{item.description}</span>
                      )}
                      <span className="saved-date">{new Date(item.savedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="saved-actions">
                      <a href={item.url} target="_blank" rel="noopener noreferrer">Open</a>
                      <button className="delete-btn" onClick={() => handleDelete(item.id)}>Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
