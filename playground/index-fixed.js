// Fixed version - all performance issues resolved
import fs from 'fs/promises'

// Fixed: nested-loops → Build filter regex pattern for single-pass matching
function searchUsers(users, filters) {
  const results = []
  const pattern = new RegExp(filters.join('|'))

  for (const user of users) {
    if (pattern.test(user.name)) {
      results.push(user)
    }
  }

  return results
}

// Fixed: array-find-in-loop → Convert to Map before loop for O(1) lookup
function matchOrders(orders, products) {
  const productMap = new Map(products.map(p => [p.id, p]))
  const matched = []

  for (const order of orders) {
    const product = productMap.get(order.productId)
    if (product) {
      matched.push({ order, product })
    }
  }

  return matched
}

// Fixed: memory-leak-interval → Return cleanup function
function startPolling() {
  const intervalId = setInterval(() => {
    fetch('/api/status').then(r => r.json())
  }, 5000)

  return () => clearInterval(intervalId)
}

class DataPoller {
  start() {
    this.intervalId = setInterval(() => {
      this.poll()
    }, 1000)
  }

  poll() {
    console.log('polling')
  }

  // Fixed: memory-leak-interval → Add cleanup method
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
}

// Fixed: sync-file-operations → Use async fs.promises API
function loadConfig() {
  return fs.readFile('./config.json', 'utf8').then(data => JSON.parse(data))
}

function saveLog(message) {
  return fs.writeFile('./log.txt', message, 'utf8')
}

// Fixed: sequential-requests → Use Promise.all for parallel execution
async function loadUserData(userIds) {
  const promises = userIds.map(id => fetch(`/api/users/${id}`))
  return Promise.all(promises)
}

async function processItems(items) {
  const promises = items.map(item => saveToDatabase(item))
  return Promise.all(promises)
}

export { searchUsers, matchOrders, startPolling, DataPoller, loadConfig, saveLog, loadUserData, processItems }
