import fs from 'node:fs'

// File with multiple performance issues
function processData(items, users) {
  // Nested loops issue
  for (let i = 0; i < items.length; i++) {
    for (let j = 0; j < users.length; j++) {
      if (items[i].userId === users[j].id) {
        console.log(items[i], users[j])
      }
    }
  }

  // Array find in loop issue
  for (const item of items) {
    const user = users.find(u => u.id === item.userId)
    console.log(user)
  }

  // Sync file operation issue
  const config = fs.readFileSync('./config.json', 'utf8')

  // Memory leak issue
  setInterval(() => {
    console.log('tick')
  }, 1000)
}

// Sequential requests issue
async function loadData(ids) {
  const results = []
  for (const id of ids) {
    const data = await fetch(`/api/data/${id}`)
    results.push(data)
  }
  return results
}
