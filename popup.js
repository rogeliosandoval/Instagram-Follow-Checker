const followersLoader = document.getElementById('followersLoader')
const followersButton = document.getElementById('followersButton')
const followersP = document.getElementById('followersP')
const followersCheck = document.getElementById('followersCheck')
const followersP2 = document.getElementById('followersP2')
const step1 = document.getElementById('step1')
const step2 = document.getElementById('step2')

function onInit() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => {
        const followers = localStorage.getItem('scrapedFollowers')

        if (followers) {
          return true
        } else {
          return false
        }
      },
    }, (response) => {
      if (response[0].result) {
        followersLoader.style.display = 'flex'
        followersButton.style.display = 'none'
        followersP.style.display = 'none'
        followersLoader.style.display = 'none'
        followersCheck.style.display = 'block'
        followersP2.style.display = 'block'
        step1.classList.add('disabled')
        step2.classList.remove('disabled')
      }
    })
  })
}

onInit()

followersButton.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0]

    // ✅ Only run if you're on instagram.com
    if (!tab.url || !tab.url.includes('instagram.com')) {
      alert('You can\'t use this here silly :p')
      return
    }

    followersLoader.style.display = 'flex'
    followersButton.style.display = 'none'
    followersP.style.display = 'none'
    scraperFunction()
  })
})

async function scraperFunction() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        func: scrapeFromPage
      },
      (results) => {
        // ✅ Only update popup DOM here
        followersLoader.style.display = 'none'
        followersCheck.style.display = 'block'
        followersP2.style.display = 'block'
        step1.classList.add('disabled')
        step2.classList.remove('disabled')

        console.log("Scraping complete:", results[0].result)
      }
    )
  })
}

// --- this runs in the page, not popup ---
async function scrapeFromPage() {
  const scrollContainer = document.querySelector(
    'div[role="dialog"] div.x6nl9eh.x1a5l9x9.x7vuprf.x1mg3h75.x1lliihq.x1iyjqo2.xs83m0k.xz65tgg.x1rife3k.x1n2onr6'
  )
  if (!scrollContainer) {
    alert('Please open the popup first!')
    return false
  }

  // Keep scrolling
  let previousHeight = 0
  let retries = 0
  while (true) {
    scrollContainer.scrollTop = scrollContainer.scrollHeight
    await new Promise(r => setTimeout(r, 1000))

    const currentHeight = scrollContainer.scrollHeight
    if (currentHeight === previousHeight) {
      retries++
      if (retries >= 3) break
    } else {
      retries = 0
      previousHeight = currentHeight
    }
  }

  // Grab users
  const children = scrollContainer.children
  const realUsersContainer = children[0]
  if (!realUsersContainer) {
    return false
  }

  const userLinks = realUsersContainer.querySelectorAll('a[href^="/"]')
  const usernames = []
  userLinks.forEach(link => {
    const href = link.getAttribute('href')
    if (href && /^\/[^/]+\/$/.test(href)) usernames.push(href.slice(1, -1))
  })

  const filteredUsernames = [...new Set(usernames)]

  // Modal title
  const modal = document.querySelector('div[role="dialog"]')
  const titleElement = modal?.querySelector('._ac78 > div')
  const modalTitle = titleElement ? titleElement.textContent.trim() : null

  if (modalTitle === 'Followers') {
    localStorage.setItem('scrapedFollowers', JSON.stringify(filteredUsernames))
  } else if (modalTitle === 'Following') {
    localStorage.setItem('scrapedFollowing', JSON.stringify(filteredUsernames))
  }

  console.log(`Scraped ${filteredUsernames.length} usernames from ${modalTitle}`)
  return true // ✅ signals success back to popup
}

document.getElementById('cacheButton').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => {
        const followers = localStorage.getItem('scrapedFollowers')
        const following = localStorage.getItem('scrapedFollowing')

        if (followers || following) {
          const parsedFollowers = JSON.parse(followers)
          const parsedFollowing = JSON.parse(following)

          console.log('Cached Followers:', parsedFollowers)
          console.log('Cached Following:', parsedFollowing)
        } else {
          console.log('Nothing in the cache')
        }
      }
    })
  })
  window.close()
})

// document.getElementById('showMeWho').addEventListener('click', () => {
//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//     chrome.scripting.executeScript({
//       target: { tabId: tabs[0].id },
//       func: () => {
//         const followers = localStorage.getItem('scrapedFollowers')
//         const following = localStorage.getItem('scrapedFollowing')

//         if (followers && following) {
//           const parsedFollowers = JSON.parse(followers)
//           const parsedFollowing = JSON.parse(following)
//           const followersSet = new Set(parsedFollowers)
//           const notFollowingBack = parsedFollowing.filter(user => !followersSet.has(user))
  
//           console.log('These people are not following me back:', notFollowingBack)
//         } else {
//           alert('Please make sure you scrape your followers and following before running this method.')
//         }

//       }
//     })
//   })
//   window.close()
// })