document.getElementById('scrapeFollowers').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: async () => {
        const container = document.querySelector('div[role="dialog"] div.x6nl9eh.x1a5l9x9.x7vuprf.x1mg3h75.x1lliihq.x1iyjqo2.xs83m0k.xz65tgg.x1rife3k.x1n2onr6')
        if (!container) {
          return alert('Please open the followers/following modal first!')
        }

        let previousHeight = 0
        let retries = 0

        while (true) {
          // Scroll to the bottom
          container.scrollTop = container.scrollHeight
          console.log('Scrolling... current scrollTop:', container.scrollTop)

          // Wait a second for new content to load
          await new Promise(r => setTimeout(r, 1000))

          const currentHeight = container.scrollHeight
          if (currentHeight === previousHeight) {
            retries++
            if (retries >= 3) break // stop if nothing new loads after 3 tries
          } else {
            retries = 0
            previousHeight = currentHeight
          }
        }

        const userLinks = container.querySelectorAll('a[href^="/"]')
        const usernames = []
        userLinks.forEach(link => {
          const href = link.getAttribute('href')
          if (href && /^\/[^/]+\/$/.test(href)) usernames.push(href.slice(1, -1))
        })

        const filteredUsernames = [...new Set(usernames)]

        localStorage.setItem('scrapedUsernames', JSON.stringify(filteredUsernames))

        console.log('Scraped usernames:', filteredUsernames)
      }
    })
  })
})

document.getElementById('cacheButton').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => {
        const usernames = localStorage.getItem('scrapedUsernames')

        if (usernames) {
          const ness = JSON.parse(usernames)
          console.log('THIS IS THE CACHE:', ness)
        } else {
          console.log('There is nothing in the cache my boy')
        }
      }
    })
  })
})