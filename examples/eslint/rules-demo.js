import fs from 'node:fs'

// nested-loops + array-find-in-loop
export function matchUsersToPosts(users, posts) {
  const matches = []

  for (const user of users) {
    for (const post of posts) {
      if (post.userId === user.id) {
        matches.push({ user, post })
      }
    }
  }

  for (const user of users) {
    const latestPost = posts.find(post => post.userId === user.id)
    if (latestPost)
      matches.push({ user, latestPost })
  }

  return matches
}

// memory-leak-interval
export function startPolling() {
  setInterval(() => {
    fetch('/api/status').then(r => r.json())
  }, 1000)
}

// sync-file-operations
export function saveReport(path, contents) {
  fs.writeFileSync(path, contents)
}

export function loadConfig(path) {
  const raw = fs.readFileSync(path, 'utf8')
  return JSON.parse(raw)
}

// sequential-requests
export async function fetchUsers(ids) {
  const results = []
  for (const id of ids) {
    const res = await fetch(`/api/users/${id}`)
    results.push(res)
  }
  return results
}
