// Should trigger nested-loops rule
function findMatches(users, posts) {
  const matches = []
  for (const user of users) {
    for (const post of posts) {
      if (post.userId === user.id) {
        matches.push({ user, post })
      }
    }
  }
  return matches
}

// Should trigger array-find-in-loop rule
function filterActiveItems(items, categories) {
  return items.filter((item) => {
    const category = categories.find(cat => cat.id === item.categoryId)
    return category?.active
  })
}

// Should trigger memory-leak-interval rule
function startPolling() {
  setInterval(() => {
    console.log('polling...')
  }, 1000)
}
