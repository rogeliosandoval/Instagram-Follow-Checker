const followersLoader = document.getElementById('followersLoader')
const followersButton = document.getElementById('followersButton')
const followersP = document.getElementById('followersP')
const followersCheck = document.getElementById('followersCheck')
const followersP2 = document.getElementById('followersP2')
const step1 = document.getElementById('step1')

const followingLoader = document.getElementById('followingLoader')
const followingButton = document.getElementById('followingButton')
const followingP = document.getElementById('followingP')
const followingCheck = document.getElementById('followingCheck')
const followingP2 = document.getElementById('followingP2')
const step2 = document.getElementById('step2')

const step3 = document.getElementById('step3')
const steps = document.getElementById('steps')
const finalResultsLoading = document.getElementById('finalResultsLoading')
const finalResults = document.getElementById('finalResults')
const resultsListing = document.getElementById('resultsListing')

function onInitFollowers() {
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

onInitFollowers()

function onInitFollowing() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => {
        const following = localStorage.getItem('scrapedFollowing')

        if (following) {
          return true
        } else {
          return false
        }
      },
    }, (response) => {
      if (response[0].result) {
        followingLoader.style.display = 'flex'
        followingButton.style.display = 'none'
        followingP.style.display = 'none'
        followingLoader.style.display = 'none'
        followingCheck.style.display = 'block'
        followingP2.style.display = 'block'
        step2.classList.add('disabled')
        step3.classList.remove('disabled')
      }
    })
  })
}

onInitFollowing()

document.getElementById('resetData').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => {
        localStorage.removeItem('scrapedFollowers')
        localStorage.removeItem('scrapedFollowing')
      }
    })
  })
  window.close()
})

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
    scraperFunctionFollowers()
  })
})

followingButton.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0]

    // ✅ Only run if you're on instagram.com
    if (!tab.url || !tab.url.includes('instagram.com')) {
      alert('You can\'t use this here silly :p')
      return
    }

    followingLoader.style.display = 'flex'
    followingButton.style.display = 'none'
    followingP.style.display = 'none'
    scraperFunctionFollowing()
  })
})

async function scraperFunctionFollowers() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        func: scrapeFromPage,
        args: ['Followers']
      },
      (results) => {
        followersLoader.style.display = 'none'

        const success = results?.[0]?.result
        if (success === true) {
          followersCheck.style.display = 'block'
          followersP2.style.display = 'block'
          step1.classList.add('disabled')
          step2.classList.remove('disabled')
        } else {
          // Fallback UI
          alert("Something went wrong while scraping. Please try again.")
          step1.classList.remove('disabled')
          followersButton.style.display = 'block'
          followersP.style.display = 'block'
        }
      }
    )
  })
}

async function scraperFunctionFollowing() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        func: scrapeFromPage,
        args: ['Following']
      },
      (results) => {
        followingLoader.style.display = 'none'

        const success = results?.[0]?.result
        if (success === true) {
          followingCheck.style.display = 'block'
          followingP2.style.display = 'block'
          step2.classList.add('disabled')
          step3.classList.remove('disabled')
        } else {
          // Fallback UI
          alert("Something went wrong while scraping. Please try again.")
          step2.classList.remove('disabled')
          followingButton.style.display = 'block'
          followingP.style.display = 'block'
        }
      }
    )
  })
}

// --- this runs in the page, not popup ---
async function scrapeFromPage(type) {
  try {
    const modal = document.querySelector('div[role="dialog"]')
    const titleElement = modal?.querySelector('._ac78 > div')
    const modalTitle = titleElement ? titleElement.textContent.trim() : null
  
    const scrollContainer = document.querySelector(
      'div[role="dialog"] div.x6nl9eh.x1a5l9x9.x7vuprf.x1mg3h75.x1lliihq.x1iyjqo2.xs83m0k.xz65tgg.x1rife3k.x1n2onr6'
    )
    if (!scrollContainer || modalTitle !== type) {
      alert('Please follow the instructions!')
      return false
    }
  
    // Keep scrolling
    let previousHeight = 0
    let retries = 0
    while (true) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight
      await new Promise(r => setTimeout(r, 800))
  
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
  
    if (modalTitle === 'Followers') {
      localStorage.setItem('scrapedFollowers', JSON.stringify(filteredUsernames))
    } else if (modalTitle === 'Following') {
      localStorage.setItem('scrapedFollowing', JSON.stringify(filteredUsernames))
    }
  
    console.log(`Scraped ${filteredUsernames.length} usernames from ${modalTitle}`)
    return true // ✅ signals success back to popup
  } catch (error) {
    console.log("Scrape error:", error)
    return false
  }
}

document.getElementById('showMeWho').addEventListener('click', () => {
  steps.style.display = 'none'
  finalResultsLoading.style.display = 'flex'

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => {
        const followers = localStorage.getItem('scrapedFollowers')
        const following = localStorage.getItem('scrapedFollowing')

        if (followers && following) {
          const parsedFollowers = JSON.parse(followers)
          const parsedFollowing = JSON.parse(following)
          const followersSet = new Set(parsedFollowers)
          const notFollowingBack = parsedFollowing.filter(user => !followersSet.has(user))

          return notFollowingBack   // ✅ send this back to popup
        } else {
          alert('Please make sure you scrape your followers and following before running this method.')
          return []  // return empty array so popup doesn’t break
        }
      }
    }, (response) => {
      const notFollowingBack = response[0]?.result || []

      setTimeout(() => {
        finalResultsLoading.style.display = 'none'
        finalResults.style.display = 'flex'
  
        notFollowingBack.forEach(user => {
          const li = document.createElement('li')
          li.textContent = user
          resultsListing.appendChild(li)
        })
      }, 2000)
    })
  })
})