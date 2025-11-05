// Test file with intentional performance issues
import { readFileSync } from 'fs'

// Issue 1: O(n²) nested loops
function findMatches(users: any[], posts: any[]) {
  const results = []
  for (const user of users) {
    for (const post of posts) {
      if (post.userId === user.id) {
        results.push({ user, post })
      }
    }
  }
  return results
}

// Issue 2: Array.find() in loop
function filterItems(items: any[], categories: any[]) {
  return items.filter(item => {
    const category = categories.find(cat => cat.id === item.categoryId)
    return category && category.active
  })
}

// Issue 3: Synchronous file operation
function loadConfig() {
  const data = readFileSync('./config.json', 'utf-8')
  return JSON.parse(data)
}

// Issue 4: Memory leak - interval without cleanup
let interval: any
function startPolling() {
  interval = setInterval(() => {
    console.log('Polling...')
  }, 1000)
  // No clearInterval!
}

// Issue 5: Sequential async operations
async function fetchData() {
  const user = await fetch('/api/user')
  const posts = await fetch('/api/posts')
  const comments = await fetch('/api/comments')
  return { user, posts, comments }
}

export { findMatches, filterItems, loadConfig, startPolling, fetchData }
