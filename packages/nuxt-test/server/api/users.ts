// Nuxt API route with performance issues

export default defineEventHandler(async (event) => {
  // Issue 1: Sync file read - blocks entire server!
  const config = JSON.parse(
    readFileSync('./config.json', 'utf-8')
  )

  // Issue 2: Sequential DB queries (should be parallel)
  const users = await $fetch('/api/db/users')
  const posts = await $fetch('/api/db/posts')
  const comments = await $fetch('/api/db/comments')

  // Issue 3: O(n²) - matching users with posts
  const usersWithPosts = []
  for (const user of users) {
    for (const post of posts) {
      if (post.userId === user.id) {
        usersWithPosts.push({
          ...user,
          post
        })
      }
    }
  }

  return usersWithPosts
})

import { readFileSync } from 'fs'
