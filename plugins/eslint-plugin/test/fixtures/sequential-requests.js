// Sequential async operations that could be parallel
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

// Good: using Promise.all
async function loadUserDataParallel(userIds) {
  const promises = userIds.map(id => fetch(`/api/users/${id}`))
  return Promise.all(promises)
}
