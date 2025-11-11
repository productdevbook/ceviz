import fs from 'node:fs'

// Clean code with no performance issues
async function processDataOptimized(items, users) {
  // Using Map for O(1) lookups instead of nested loops
  const userMap = new Map(users.map(u => [u.id, u]))

  const results = items.map(item => ({
    item,
    user: userMap.get(item.userId),
  }))

  return results
}

// Async file operations
async function loadConfigAsync() {
  const data = await fs.promises.readFile('./config.json', 'utf8')
  return JSON.parse(data)
}

// Proper interval cleanup
function startPolling() {
  const intervalId = setInterval(() => {
    console.log('polling')
  }, 1000)

  return () => clearInterval(intervalId)
}

// Parallel async operations
async function loadDataParallel(ids) {
  const promises = ids.map(id => fetch(`/api/data/${id}`))
  return Promise.all(promises)
}

// Simple operations that are fine
function simpleLoop(items) {
  for (const item of items) {
    console.log(item)
  }
}

function sumArray(items) {
  let total = 0
  for (const item of items) {
    total += item
  }
  return total
}
