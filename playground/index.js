import fs from 'fs'

function searchUsers(users, filters) {
  const results = []

  for (let i = 0; i < users.length; i++) {
    for (let j = 0; j < filters.length; j++) {
      if (users[i].name.includes(filters[j])) {
        results.push(users[i])
      }
    }
  }

  return results
}

function matchOrders(orders, products) {
  const matched = []

  for (let i = 0; i < orders.length; i++) {
    const product = products.find(p => p.id === orders[i].productId)
    if (product) {
      matched.push({ order: orders[i], product })
    }
  }

  return matched
}

function startPolling() {
  setInterval(() => {
    fetch('/api/status').then(r => r.json())
  }, 5000)
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
}

function loadConfig() {
  const data = fs.readFileSync('./config.json', 'utf8')
  return JSON.parse(data)
}

function saveLog(message) {
  fs.writeFileSync('./log.txt', message, 'utf8')
}

async function loadUserData(userIds) {
  const results = []
  for (const id of userIds) {
    const user = await fetch(`/api/users/${id}`)
    results.push(user)
  }
  return results
}

async function processItems(items) {
  for (let i = 0; i < items.length; i++) {
    await saveToDatabase(items[i])
  }
}

export { searchUsers, matchOrders, startPolling, DataPoller, loadConfig, saveLog, loadUserData, processItems }
